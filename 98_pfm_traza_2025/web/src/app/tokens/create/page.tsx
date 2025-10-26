'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Package, Info } from 'lucide-react';
import { Role, UserStatus } from '@/lib/contract';
import { toast } from 'sonner';
import { getReadOnlyProvider, getContract } from '@/lib/contract';

interface TokenOption {
  id: number;
  name: string;
  creator: string;
}

export default function CreateTokenPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { user, isLoading: loadingUser, createToken } = useContract();
  
  const [name, setName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [parentId, setParentId] = useState('0');
  const [initialAmount, setInitialAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableTokens, setAvailableTokens] = useState<TokenOption[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Verificar acceso
  useEffect(() => {
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved) {
        router.push('/');
      } else if (user?.role === Role.Admin || user?.role === Role.Consumer) {
        toast.error('Access denied', {
          description: 'Your role cannot create tokens',
        });
        router.push('/dashboard');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar tokens disponibles para parentId (solo para Factory y Retailer)
  useEffect(() => {
    const loadAvailableTokens = async () => {
      if (!user || user.role === Role.Producer) return;
      
      try {
        setLoadingTokens(true);
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        
        const tokenCounter = await contract.tokenCounter();
        const tokens: TokenOption[] = [];
        
        for (let i = 1; i <= Number(tokenCounter); i++) {
          try {
            const token = await contract.tokens(i);
            if (token.exists) {
              tokens.push({
                id: i,
                name: token.name,
                creator: token.creator,
              });
            }
          } catch (err) {
            console.error(`Error loading token ${i}:`, err);
          }
        }
        
        setAvailableTokens(tokens);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setLoadingTokens(false);
      }
    };
    
    loadAvailableTokens();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Token name is required');
      return;
    }

    if (!metadata.trim()) {
      setError('Metadata is required');
      return;
    }

    // Validar JSON
    try {
      JSON.parse(metadata);
    } catch {
      setError('Metadata must be valid JSON');
      return;
    }

    const amount = parseInt(initialAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Initial amount must be a positive number');
      return;
    }

    const parent = parseInt(parentId);
    if (isNaN(parent) || parent < 0) {
      setError('Invalid parent token ID');
      return;
    }

    // Validaciones según rol
    if (user?.role === Role.Producer && parent !== 0) {
      setError('Producers can only create raw materials (no parent token)');
      return;
    }

    if ((user?.role === Role.Factory || user?.role === Role.Retailer) && parent === 0) {
      setError('You must select a parent token');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      toast.info('Creating token...', {
        description: 'Please confirm the transaction in MetaMask',
      });

      const tokenId = await createToken(name, metadata, parent, amount);
      
      if (tokenId) {
        toast.success('Token created successfully!', {
          description: `Token ID: ${tokenId}`,
        });
        
        setTimeout(() => {
          router.push('/tokens');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Create token error:', err);
      const errorMessage = err?.message || 'Failed to create token';
      setError(errorMessage);
      toast.error('Failed to create token', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const isProducer = user.role === Role.Producer;
  const needsParent = user.role === Role.Factory || user.role === Role.Retailer;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <CardTitle className="text-2xl">
                Create {isProducer ? 'Raw Material' : 'Product'}
              </CardTitle>
            </div>
            <CardDescription>
              {isProducer && 'Register a new raw material in the supply chain'}
              {user.role === Role.Factory && 'Create a processed product from raw materials'}
              {user.role === Role.Retailer && 'Create a retail product from factory goods'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {isProducer ? 'Material Name' : 'Product Name'} *
                </Label>
                <Input
                  id="name"
                  placeholder={isProducer ? 'e.g., Organic Wheat' : 'e.g., Whole Wheat Flour'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Parent Token Selection (Factory and Retailer only) */}
              {needsParent && (
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Token *</Label>
                  {loadingTokens ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading available tokens...
                    </div>
                  ) : availableTokens.length > 0 ? (
                    <Select value={parentId} onValueChange={setParentId}>
                      <SelectTrigger id="parent">
                        <SelectValue placeholder="Select a parent token..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id.toString()}>
                            #{token.id} - {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No tokens available yet. You need to receive tokens from other actors first.
                      </AlertDescription>
                    </Alert>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Select the token this product derives from
                  </p>
                </div>
              )}

              {/* Initial Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Initial Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="1000"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of units to create
                </p>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <Label htmlFor="metadata">Product Information (JSON) *</Label>
                <Textarea
                  id="metadata"
                  placeholder={isProducer 
                    ? '{"type":"grain","origin":"Spain","organic":true,"harvestDate":"2024-10-20"}'
                    : '{"type":"processed","weight":"1kg","expiryDate":"2025-12-31"}'
                  }
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Product characteristics in JSON format
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {isProducer && 'As a Producer, you create raw materials without parent tokens.'}
                  {user.role === Role.Factory && 'As a Factory, you must specify which raw material you\'re processing.'}
                  {user.role === Role.Retailer && 'As a Retailer, you must specify which product you\'re distributing.'}
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (needsParent && availableTokens.length === 0)}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Token'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}