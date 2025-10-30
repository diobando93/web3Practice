'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Package, ArrowRightLeft, Calendar, Loader2, Shield } from 'lucide-react';
import { UserStatus, roleToString, statusToString, getReadOnlyProvider, getContract } from '@/lib/contract';

export default function ProfilePage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { user, isLoading: loadingUser } = useContract();
  
  const [stats, setStats] = useState({
    tokensOwned: 0,
    tokensCreated: 0,
    transfersSent: 0,
    transfersReceived: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verificar acceso
  useEffect(() => {
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved) {
        router.push('/');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!account) return;
      
      try {
        setIsLoading(true);
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        
        // Tokens que posee
        const userTokens = await contract.getUserTokens(account);
        
        // Contar tokens con balance > 0
        let tokensWithBalance = 0;
        for (const tokenId of userTokens) {
          const balance = await contract.balanceOf(account, tokenId);
          if (Number(balance) > 0) {
            tokensWithBalance++;
          }
        }
        
        // Contar transferencias enviadas y recibidas
        const transferCounter = await contract.transferCounter();
        let sent = 0;
        let received = 0;
        
        for (let i = 1; i <= Number(transferCounter); i++) {
          try {
            const transfer = await contract.transfers(i);
            if (transfer.from.toLowerCase() === account.toLowerCase()) {
              sent++;
            }
            if (transfer.to.toLowerCase() === account.toLowerCase()) {
              received++;
            }
          } catch (err) {
            console.error(`Error loading transfer ${i}:`, err);
          }
        }
        
        setStats({
          tokensOwned: tokensWithBalance,
          tokensCreated: userTokens.length,
          transfersSent: sent,
          transfersReceived: received,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (account && user?.status === UserStatus.Approved) {
      loadStats();
    }
  }, [account, user]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Your account information and activity
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your wallet and registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                  <code className="text-sm font-mono">{formatAddress(account!)}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <Badge variant="default">{roleToString(user.role)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {statusToString(user.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Registered</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.registeredAt)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Organization Info */}
              <div>
                <p className="text-sm font-semibold mb-2">Organization Information</p>
                <div className="p-3 bg-muted rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(user.metadata), null, 2);
                      } catch {
                        return user.metadata;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
              <CardDescription>Your activity in the supply chain</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Tokens Owned</p>
                    </div>
                    <p className="text-3xl font-bold">{stats.tokensOwned}</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Tokens Created</p>
                    </div>
                    <p className="text-3xl font-bold">{stats.tokensCreated}</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRightLeft className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-muted-foreground">Transfers Sent</p>
                    </div>
                    <p className="text-3xl font-bold">{stats.transfersSent}</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-muted-foreground">Transfers Received</p>
                    </div>
                    <p className="text-3xl font-bold">{stats.transfersReceived}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Description */}
          <Card>
            <CardHeader>
              <CardTitle>Your Role: {roleToString(user.role)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {user.role === 1 && (
                  <>
                    <Shield className="inline h-4 w-4 mr-2" />
                    As an <strong>Admin</strong>, you can manage user registrations and oversee the entire supply chain system.
                  </>
                )}
                {user.role === 2 && (
                  <>
                    As a <strong>Producer</strong>, you can create raw materials and transfer them to factories.
                  </>
                )}
                {user.role === 3 && (
                  <>
                    As a <strong>Factory</strong>, you can receive raw materials, create processed products, and transfer them to retailers.
                  </>
                )}
                {user.role === 4 && (
                  <>
                    As a <strong>Retailer</strong>, you can receive products from factories and distribute them to consumers.
                  </>
                )}
                {user.role === 5 && (
                  <>
                    As a <strong>Consumer</strong>, you can receive products and view their complete traceability from origin to destination.
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}