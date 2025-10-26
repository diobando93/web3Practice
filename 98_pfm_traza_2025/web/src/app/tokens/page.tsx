'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Eye, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { UserStatus, getReadOnlyProvider, getContract } from '@/lib/contract';

interface TokenData {
  id: number;
  name: string;
  metadata: string;
  creator: string;
  parentId: number;
  createdAt: bigint;
  balance: number;
}

export default function TokensPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { user, isLoading: loadingUser } = useContract();
  
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar acceso
  useEffect(() => {
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved) {
        router.push('/');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar tokens del usuario
  useEffect(() => {
    const loadTokens = async () => {
      if (!account) return;
      
      try {
        setIsLoading(true);
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        
        // Obtener IDs de tokens del usuario
        const tokenIds = await contract.getUserTokens(account);
        
        // Cargar datos de cada token
        const tokensData: TokenData[] = [];
        
        for (const id of tokenIds) {
          try {
            const token = await contract.tokens(id);
            const balance = await contract.balanceOf(account, id);
            
            tokensData.push({
              id: Number(id),
              name: token.name,
              metadata: token.metadata,
              creator: token.creator,
              parentId: Number(token.parentId),
              createdAt: token.createdAt,
              balance: Number(balance),
            });
          } catch (err) {
            console.error(`Error loading token ${id}:`, err);
          }
        }
        
        setTokens(tokensData);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (account && user?.status === UserStatus.Approved) {
      loadTokens();
    }
  }, [account, user]);

  if (loadingUser || !account || user?.status !== UserStatus.Approved) {
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

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tokens</h1>
            <p className="text-muted-foreground">
              Tokens you own or created in the supply chain
            </p>
          </div>
          <Link href="/tokens/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Token
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading your tokens...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tokens.length === 0 && (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <Package className="h-16 w-16 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No tokens yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't created or received any tokens yet. Create your first token to get started!
                </p>
              </div>
              <Link href="/tokens/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Token
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Tokens Grid */}
        {!isLoading && tokens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <Card key={token.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{token.name}</CardTitle>
                    </div>
                    <Badge variant="outline">#{token.id}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    {token.creator.toLowerCase() === account.toLowerCase() ? (
                      <span className="text-green-600 font-medium">Created by you</span>
                    ) : (
                      <span>From {formatAddress(token.creator)}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Balance */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Balance:</span>
                    <span className="text-lg font-bold">{token.balance}</span>
                  </div>

                  {/* Parent Token */}
                  {token.parentId > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Parent Token:</span>
                      <Badge variant="secondary">#{token.parentId}</Badge>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(token.createdAt)}</span>
                  </div>

                  {/* Metadata Preview */}
                  <div className="p-2 bg-muted rounded text-xs font-mono overflow-hidden">
                    <div className="truncate">
                      {token.metadata.slice(0, 50)}
                      {token.metadata.length > 50 && '...'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/tokens/${token.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </Link>
                    {token.balance > 0 && (
                      <Link href={`/tokens/${token.id}/transfer`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <ArrowRight className="mr-2 h-3 w-3" />
                          Transfer
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}