'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, AlertCircle, Info, Package } from 'lucide-react';
import { Role, UserStatus, roleToString, getReadOnlyProvider, getContract } from '@/lib/contract';
import { toast } from 'sonner';
import { isAddress } from 'ethers';

interface TokenData {
  id: number;
  name: string;
  metadata: string;
  creator: string;
  parentId: number;
  balance: number;
}

export default function TransferTokenPage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params.id as string;
  
  const { account } = useWeb3();
  const { user, isLoading: loadingUser, initiateTransfer } = useContract();
  
  const [token, setToken] = useState<TokenData | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<{ role: Role; status: UserStatus } | null>(null);

  // Verificar acceso
  useEffect(() => {
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved) {
        router.push('/');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar token
  useEffect(() => {
    const loadToken = async () => {
      if (!account || !tokenId) return;
      
      try {
        setLoadingToken(true);
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        
        const tokenData = await contract.tokens(tokenId);
        const balance = await contract.balanceOf(account, tokenId);
        
        if (!tokenData.exists) {
          toast.error('Token not found');
          router.push('/tokens');
          return;
        }
        
        if (Number(balance) === 0) {
          toast.error('You have no balance of this token');
          router.push('/tokens');
          return;
        }
        
        setToken({
          id: Number(tokenId),
          name: tokenData.name,
          metadata: tokenData.metadata,
          creator: tokenData.creator,
          parentId: Number(tokenData.parentId),
          balance: Number(balance),
        });
      } catch (error) {
        console.error('Error loading token:', error);
        toast.error('Failed to load token');
        router.push('/tokens');
      } finally {
        setLoadingToken(false);
      }
    };
    
    loadToken();
  }, [account, tokenId, router]);

  // Verificar destinatario cuando se ingresa dirección
  useEffect(() => {
    const checkRecipient = async () => {
      if (!recipientAddress || !isAddress(recipientAddress)) {
        setRecipientInfo(null);
        return;
      }
      
      try {
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        const recipientUser = await contract.users(recipientAddress);
        
        setRecipientInfo({
          role: Number(recipientUser[1]) as Role,
          status: Number(recipientUser[2]) as UserStatus,
        });
      } catch (error) {
        console.error('Error checking recipient:', error);
        setRecipientInfo(null);
      }
    };
    
    checkRecipient();
  }, [recipientAddress]);

  const validateTransfer = (): string | null => {
    if (!recipientAddress.trim()) {
      return 'Recipient address is required';
    }
    
    if (!isAddress(recipientAddress)) {
      return 'Invalid Ethereum address';
    }
    
    if (recipientAddress.toLowerCase() === account?.toLowerCase()) {
      return 'Cannot transfer to yourself';
    }
    
    if (!recipientInfo) {
      return 'Recipient not found in the system';
    }
    
    if (recipientInfo.status !== UserStatus.Approved) {
      return 'Recipient must be an approved user';
    }
    
    const transferAmount = parseInt(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return 'Amount must be a positive number';
    }
    
    if (token && transferAmount > token.balance) {
      return `Amount exceeds your balance (${token.balance})`;
    }
    
    // Validar flujo según roles
    if (user?.role === Role.Producer && recipientInfo.role !== Role.Factory) {
      return 'Producers can only transfer to Factories';
    }
    
    if (user?.role === Role.Factory && recipientInfo.role !== Role.Retailer) {
      return 'Factories can only transfer to Retailers';
    }
    
    if (user?.role === Role.Retailer && recipientInfo.role !== Role.Consumer) {
      return 'Retailers can only transfer to Consumers';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateTransfer();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      toast.info('Initiating transfer...', {
        description: 'Please confirm the transaction in MetaMask',
      });
      
      const transferId = await initiateTransfer(
        Number(tokenId),
        recipientAddress,
        parseInt(amount)
      );
      
      if (transferId) {
        toast.success('Transfer initiated!', {
          description: `Transfer ID: ${transferId}. Waiting for recipient approval.`,
        });
        
        setTimeout(() => {
          router.push('/tokens');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Transfer error:', err);
      const errorMessage = err?.message || 'Failed to initiate transfer';
      setError(errorMessage);
      toast.error('Transfer failed', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser || loadingToken || !user || !token) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const getAllowedRecipients = () => {
    switch (user.role) {
      case Role.Producer:
        return 'Factories only';
      case Role.Factory:
        return 'Retailers only';
      case Role.Retailer:
        return 'Consumers only';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Transfer Token</CardTitle>
            </div>
            <CardDescription>
              Send tokens to another user in the supply chain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Token Info */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{token.name}</span>
                </div>
                <Badge variant="outline">#{token.id}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Balance:</span>
                <span className="font-bold text-lg">{token.balance}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address *</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="font-mono"
                />
                {recipientInfo && recipientInfo.status === UserStatus.Approved && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{roleToString(recipientInfo.role)}</Badge>
                    <span className="text-green-600">✓ Approved User</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  You can transfer to: <strong>{getAllowedRecipients()}</strong>
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max={token.balance}
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {token.balance}
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
                  The recipient must <strong>accept</strong> the transfer before the tokens are moved.
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/tokens')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Initiate Transfer
                    </>
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