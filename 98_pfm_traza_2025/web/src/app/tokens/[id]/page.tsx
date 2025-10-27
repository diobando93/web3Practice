'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ArrowRight, Loader2, Calendar, User, Link as LinkIcon, History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserStatus, TransferStatus, getReadOnlyProvider, getContract, roleToString } from '@/lib/contract';

interface TokenData {
  id: number;
  name: string;
  metadata: string;
  creator: string;
  parentId: number;
  createdAt: bigint;
  exists: boolean;
}

interface TransferData {
  id: number;
  from: string;
  to: string;
  amount: number;
  status: TransferStatus;
  createdAt: bigint;
}

export default function TokenDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params.id as string;
  
  const { account } = useWeb3();
  const { user, isLoading: loadingUser } = useContract();
  
  const [token, setToken] = useState<TokenData | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [parentToken, setParentToken] = useState<TokenData | null>(null);
  const [childrenTokens, setChildrenTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar acceso
  useEffect(() => {
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved) {
        router.push('/');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar token y datos relacionados
  useEffect(() => {
    const loadTokenData = async () => {
      if (!account || !tokenId) return;
      
      try {
        setIsLoading(true);
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        
        // Cargar token
        const tokenData = await contract.tokens(tokenId);
        
        if (!tokenData.exists) {
          router.push('/tokens');
          return;
        }
        
        setToken({
          id: Number(tokenId),
          name: tokenData.name,
          metadata: tokenData.metadata,
          creator: tokenData.creator,
          parentId: Number(tokenData.parentId),
          createdAt: tokenData.createdAt,
          exists: tokenData.exists,
        });
        
        // Cargar balance
        const userBalance = await contract.balanceOf(account, tokenId);
        setBalance(Number(userBalance));
        
        // Cargar historial de trazabilidad
        const tokenHistory = await contract.getTokenHistory(tokenId);
        setHistory(tokenHistory.map((id: bigint) => Number(id)));
        
        // Cargar transferencias del token
        const transferHistory = await contract.getTokenTransferHistory(tokenId);
        const transfersData: TransferData[] = [];
        
        for (const id of transferHistory) {
          try {
            const transfer = await contract.transfers(id);
            transfersData.push({
              id: Number(id),
              from: transfer.from,
              to: transfer.to,
              amount: Number(transfer.amount),
              status: Number(transfer.status) as TransferStatus,
              createdAt: transfer.createdAt,
            });
          } catch (err) {
            console.error(`Error loading transfer ${id}:`, err);
          }
        }
        
        setTransfers(transfersData);
        
        // Cargar token padre si existe
        if (Number(tokenData.parentId) > 0) {
          try {
            const parent = await contract.tokens(tokenData.parentId);
            setParentToken({
              id: Number(tokenData.parentId),
              name: parent.name,
              metadata: parent.metadata,
              creator: parent.creator,
              parentId: Number(parent.parentId),
              createdAt: parent.createdAt,
              exists: parent.exists,
            });
          } catch (err) {
            console.error('Error loading parent token:', err);
          }
        }
        
        // Cargar tokens hijos (que tienen este token como parent)
        const tokenCounter = await contract.tokenCounter();
        const children: TokenData[] = [];
        
        for (let i = 1; i <= Number(tokenCounter); i++) {
          try {
            const childToken = await contract.tokens(i);
            if (Number(childToken.parentId) === Number(tokenId) && childToken.exists) {
              children.push({
                id: i,
                name: childToken.name,
                metadata: childToken.metadata,
                creator: childToken.creator,
                parentId: Number(childToken.parentId),
                createdAt: childToken.createdAt,
                exists: childToken.exists,
              });
            }
          } catch (err) {
            console.error(`Error loading token ${i}:`, err);
          }
        }
        
        setChildrenTokens(children);
      } catch (error) {
        console.error('Error loading token data:', error);
        router.push('/tokens');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (account && user?.status === UserStatus.Approved) {
      loadTokenData();
    }
  }, [account, tokenId, user, router]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.Pending:
        return <Badge variant="secondary">Pending</Badge>;
      case TransferStatus.Accepted:
        return <Badge variant="default" className="bg-green-600">Accepted</Badge>;
      case TransferStatus.Rejected:
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  if (loadingUser || isLoading || !user || !token) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading token details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/tokens">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tokens
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">{token.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Token #{token.id}</Badge>
              {token.creator.toLowerCase() === account?.toLowerCase() && (
                <Badge variant="default">Owned by you</Badge>
              )}
            </div>
          </div>

          {balance > 0 && (
            <Link href={`/tokens/${token.id}/transfer`}>
              <Button size="lg">
                <ArrowRight className="mr-2 h-5 w-5" />
                Transfer Token
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Token ID</p>
                    <p className="font-semibold">#{token.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                    <p className="text-2xl font-bold">{balance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Creator</p>
                    <code className="text-xs">{formatAddress(token.creator)}</code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="text-sm">{formatDate(token.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                {/* Metadata */}
                <div>
                  <p className="text-sm font-semibold mb-2">Product Details</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(JSON.parse(token.metadata), null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traceability */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <CardTitle>Supply Chain Traceability</CardTitle>
                </div>
                <CardDescription>
                  Complete path from origin to current state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((historyTokenId, index) => (
                    <div key={historyTokenId}>
                      <Link href={`/tokens/${historyTokenId}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {historyTokenId === token.id ? token.name : `Token #${historyTokenId}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {index === 0 && 'Origin (Raw Material)'}
                              {index > 0 && index < history.length - 1 && 'Intermediate Product'}
                              {index === history.length - 1 && historyTokenId === token.id && 'Current Token'}
                            </p>
                          </div>
                          {historyTokenId === token.id && (
                            <Badge>Current</Badge>
                          )}
                        </div>
                      </Link>
                      {index < history.length - 1 && (
                        <div className="ml-4 my-1">
                          <div className="w-0.5 h-4 bg-border"></div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="w-0.5 h-4 bg-border"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transfer History */}
            {transfers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transfer History</CardTitle>
                  <CardDescription>
                    All transfers involving this token
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transfers.map((transfer) => (
                      <div key={transfer.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold">Transfer #{transfer.id}</p>
                          {getStatusBadge(transfer.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">From:</span>
                            <code className="ml-1">{formatAddress(transfer.from)}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">To:</span>
                            <code className="ml-1">{formatAddress(transfer.to)}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-1 font-bold">{transfer.amount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-1">{formatDate(transfer.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parent Token */}
            {parentToken && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Parent Token</CardTitle>
                  <CardDescription className="text-xs">
                    Source material for this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/tokens/${parentToken.id}`}>
                    <div className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        <p className="font-semibold">{parentToken.name}</p>
                      </div>
                      <Badge variant="outline">#{parentToken.id}</Badge>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Children Tokens */}
            {childrenTokens.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Derived Products</CardTitle>
                  <CardDescription className="text-xs">
                    Products created from this token
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {childrenTokens.map((child) => (
                      <Link key={child.id} href={`/tokens/${child.id}`}>
                        <div className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                          <p className="font-medium text-sm">{child.name}</p>
                          <Badge variant="outline" className="mt-1">#{child.id}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {balance > 0 && (
                  <Link href={`/tokens/${token.id}/transfer`}>
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Transfer Token
                    </Button>
                  </Link>
                )}
                <Link href="/tokens">
                  <Button variant="outline" className="w-full">
                    <Package className="mr-2 h-4 w-4" />
                    View All Tokens
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}