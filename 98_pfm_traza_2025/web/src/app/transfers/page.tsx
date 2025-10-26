'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Check, X, Clock, Loader2, Package, User } from 'lucide-react';
import { UserStatus, TransferStatus, getReadOnlyProvider, getContract, roleToString } from '@/lib/contract';
import { toast } from 'sonner';

interface TransferData {
  id: number;
  tokenId: number;
  tokenName: string;
  from: string;
  to: string;
  amount: number;
  status: TransferStatus;
  createdAt: bigint;
  resolvedAt: bigint;
}

export default function TransfersPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { user, isLoading: loadingUser, acceptTransfer, rejectTransfer } = useContract();
  
  const [pendingTransfers, setPendingTransfers] = useState<TransferData[]>([]);
  const [allTransfers, setAllTransfers] = useState<TransferData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Verificar acceso
  useEffect(() => {
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved) {
        router.push('/');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar transferencias
  const loadTransfers = async () => {
    if (!account) return;
    
    try {
      setIsLoading(true);
      const provider = getReadOnlyProvider();
      const contract = getContract(provider);
      
      // Obtener IDs de transferencias pendientes
      const pendingIds = await contract.getPendingTransfers(account);
      
      // Cargar transferencias pendientes
      const pending: TransferData[] = [];
      for (const id of pendingIds) {
        try {
          const transfer = await contract.transfers(id);
          const token = await contract.tokens(transfer.tokenId);
          
          pending.push({
            id: Number(id),
            tokenId: Number(transfer.tokenId),
            tokenName: token.name,
            from: transfer.from,
            to: transfer.to,
            amount: Number(transfer.amount),
            status: Number(transfer.status) as TransferStatus,
            createdAt: transfer.createdAt,
            resolvedAt: transfer.resolvedAt,
          });
        } catch (err) {
          console.error(`Error loading transfer ${id}:`, err);
        }
      }
      
      setPendingTransfers(pending);
      
      // Cargar todas las transferencias (enviadas y recibidas)
      const transferCounter = await contract.transferCounter();
      const all: TransferData[] = [];
      
      for (let i = 1; i <= Number(transferCounter); i++) {
        try {
          const transfer = await contract.transfers(i);
          
          // Solo mostrar transferencias donde el usuario está involucrado
          if (
            transfer.from.toLowerCase() !== account.toLowerCase() &&
            transfer.to.toLowerCase() !== account.toLowerCase()
          ) {
            continue;
          }
          
          const token = await contract.tokens(transfer.tokenId);
          
          all.push({
            id: i,
            tokenId: Number(transfer.tokenId),
            tokenName: token.name,
            from: transfer.from,
            to: transfer.to,
            amount: Number(transfer.amount),
            status: Number(transfer.status) as TransferStatus,
            createdAt: transfer.createdAt,
            resolvedAt: transfer.resolvedAt,
          });
        } catch (err) {
          console.error(`Error loading transfer ${i}:`, err);
        }
      }
      
      setAllTransfers(all);
    } catch (error) {
      console.error('Error loading transfers:', error);
      toast.error('Failed to load transfers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && user?.status === UserStatus.Approved) {
      loadTransfers();
    }
  }, [account, user]);

  const handleAccept = async (transferId: number) => {
    try {
      setProcessingId(transferId);
      
      toast.info('Accepting transfer...', {
        description: 'Please confirm the transaction in MetaMask',
      });
      
      await acceptTransfer(transferId);
      
      toast.success('Transfer accepted!', {
        description: 'Tokens have been transferred to your account',
      });
      
      // Recargar transferencias
      await loadTransfers();
    } catch (err: any) {
      console.error('Accept error:', err);
      toast.error('Failed to accept transfer', {
        description: err?.message || 'Unknown error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (transferId: number) => {
    try {
      setProcessingId(transferId);
      
      toast.info('Rejecting transfer...', {
        description: 'Please confirm the transaction in MetaMask',
      });
      
      await rejectTransfer(transferId);
      
      toast.success('Transfer rejected');
      
      // Recargar transferencias
      await loadTransfers();
    } catch (err: any) {
      console.error('Reject error:', err);
      toast.error('Failed to reject transfer', {
        description: err?.message || 'Unknown error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (Number(timestamp) === 0) return '-';
    return new Date(Number(timestamp) * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.Pending:
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case TransferStatus.Accepted:
        return <Badge variant="default" className="bg-green-600"><Check className="mr-1 h-3 w-3" />Accepted</Badge>;
      case TransferStatus.Rejected:
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Rejected</Badge>;
    }
  };

  if (loadingUser || !user) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transfers</h1>
          <p className="text-muted-foreground">
            Manage incoming and view all transfer history
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pendingTransfers.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingTransfers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Pending Transfers */}
          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingTransfers.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <Clock className="h-16 w-16 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No pending transfers</h3>
                    <p className="text-muted-foreground">
                      You don't have any transfers waiting for your approval
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingTransfers.map((transfer) => (
                  <Card key={transfer.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            {transfer.tokenName}
                          </CardTitle>
                          <CardDescription>
                            Transfer #{transfer.id} • {formatDate(transfer.createdAt)}
                          </CardDescription>
                        </div>
                        {getStatusBadge(transfer.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">From</p>
                          <p className="font-mono text-sm">{formatAddress(transfer.from)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Amount</p>
                          <p className="text-2xl font-bold">{transfer.amount}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReject(transfer.id)}
                          variant="outline"
                          className="flex-1"
                          disabled={processingId !== null}
                        >
                          {processingId === transfer.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleAccept(transfer.id)}
                          className="flex-1"
                          disabled={processingId !== null}
                        >
                          {processingId === transfer.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : allTransfers.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <ArrowRightLeft className="h-16 w-16 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No transfers yet</h3>
                    <p className="text-muted-foreground">
                      No transfers have been made involving your account
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allTransfers.map((transfer) => {
                  const isSent = transfer.from.toLowerCase() === account?.toLowerCase();
                  
                  return (
                    <Card key={transfer.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Package className="h-5 w-5 text-primary" />
                              {transfer.tokenName}
                              {isSent ? (
                                <Badge variant="outline">Sent</Badge>
                              ) : (
                                <Badge variant="secondary">Received</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              Transfer #{transfer.id}
                            </CardDescription>
                          </div>
                          {getStatusBadge(transfer.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">From</p>
                            <p className="font-mono">{formatAddress(transfer.from)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">To</p>
                            <p className="font-mono">{formatAddress(transfer.to)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Amount</p>
                            <p className="font-bold text-lg">{transfer.amount}</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Created: {formatDate(transfer.createdAt)}</span>
                          {Number(transfer.resolvedAt) > 0 && (
                            <span>Resolved: {formatDate(transfer.resolvedAt)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}