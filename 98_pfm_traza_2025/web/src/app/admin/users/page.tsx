'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Clock, Loader2, Users, Shield } from 'lucide-react';
import { Role, UserStatus, roleToString, statusToString, getReadOnlyProvider, getContract } from '@/lib/contract';
import { toast } from 'sonner';

interface UserData {
  address: string;
  role: Role;
  status: UserStatus;
  metadata: string;
  registeredAt: bigint;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { account, signer } = useWeb3();
  const { user, isLoading: loadingUser } = useContract();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);

  // Verificar que sea admin
  useEffect(() => {
    console.log('Admin check:', {
    account,
    userRole: user?.role,
    userStatus: user?.status,
    isAdmin: user?.role === Role.Admin,
    loadingUser
  });
    if (!loadingUser) {
      if (!account || user?.status !== UserStatus.Approved || user?.role !== Role.Admin) {
        toast.error('Access denied', {
          description: 'Only admins can access this page',
        });
        router.push('/dashboard');
      }
    }
  }, [account, user, loadingUser, router]);

  // Cargar usuarios
  const loadUsers = async () => {
    if (!account) return;
    
    try {
      setIsLoading(true);
      const provider = getReadOnlyProvider();
      const contract = getContract(provider);
      
      // Obtener eventos de registro
      const filter = contract.filters.UserRegistered();
      const events = await contract.queryFilter(filter, 0, 'latest');
      
      const usersData: UserData[] = [];
      const processedAddresses = new Set<string>();
      
      for (const event of events) {
        
         try {
          // Parsear el log para obtener los argumentos
          const parsedLog = contract.interface.parseLog({
            topics: [...event.topics],
            data: event.data
          });
          
          if (!parsedLog) continue;
          
          const userAddress = parsedLog.args[0] as string;
          
          if (!userAddress || processedAddresses.has(userAddress.toLowerCase())) {
            continue;
          }
          
          processedAddresses.add(userAddress.toLowerCase());
          
          const userData = await contract.users(userAddress);
          
          usersData.push({
            address: userAddress,
            role: Number(userData[1]) as Role,
            status: Number(userData[2]) as UserStatus,
            metadata: userData[3],
            registeredAt: userData[4],
          });
        } catch (err) {
          console.error('Error loading user:', err);
        }
      }
      
      // Ordenar por fecha (más recientes primero)
      usersData.sort((a, b) => Number(b.registeredAt) - Number(a.registeredAt));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && user?.role === Role.Admin) {
      loadUsers();
    }
  }, [account, user]);

  const handleApprove = async (userAddress: string) => {
    if (!signer) return;
    
    try {
      setProcessingAddress(userAddress);
      
      toast.info('Approving user...', {
        description: 'Please confirm the transaction in MetaMask',
      });
      
      const contract = getContract(signer);
      const tx = await contract.approveUser(userAddress);
      await tx.wait();
      
      toast.success('User approved!', {
        description: `${userAddress.slice(0, 10)}... can now use the system`,
      });
      
      // Recargar usuarios
      await loadUsers();
    } catch (err: any) {
      console.error('Approve error:', err);
      toast.error('Failed to approve user', {
        description: err?.message || 'Unknown error',
      });
    } finally {
      setProcessingAddress(null);
    }
  };

  const handleReject = async (userAddress: string) => {
    if (!signer) return;
    
    try {
      setProcessingAddress(userAddress);
      
      toast.info('Rejecting user...', {
        description: 'Please confirm the transaction in MetaMask',
      });
      
      const contract = getContract(signer);
      const tx = await contract.rejectUser(userAddress);
      await tx.wait();
      
      toast.success('User rejected', {
        description: `${userAddress.slice(0, 10)}... has been rejected`,
      });
      
      // Recargar usuarios
      await loadUsers();
    } catch (err: any) {
      console.error('Reject error:', err);
      toast.error('Failed to reject user', {
        description: err?.message || 'Unknown error',
      });
    } finally {
      setProcessingAddress(null);
    }
  };

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

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Pending:
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case UserStatus.Approved:
        return <Badge variant="default" className="bg-green-600"><Check className="mr-1 h-3 w-3" />Approved</Badge>;
      case UserStatus.Rejected:
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Rejected</Badge>;
      case UserStatus.Canceled:
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: Role) => {
    const colors: Record<Role, string> = {
      [Role.None]: 'bg-gray-500',
      [Role.Admin]: 'bg-red-600',
      [Role.Producer]: 'bg-green-600',
      [Role.Factory]: 'bg-blue-600',
      [Role.Retailer]: 'bg-purple-600',
      [Role.Consumer]: 'bg-orange-600',
    };
    
    return (
      <Badge className={colors[role]}>
        {roleToString(role)}
      </Badge>
    );
  };

  if (loadingUser || !user || user.role !== Role.Admin) {
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

  const pendingUsers = users.filter(u => u.status === UserStatus.Pending);
  const approvedUsers = users.filter(u => u.status === UserStatus.Approved);
  const rejectedUsers = users.filter(u => u.status === UserStatus.Rejected);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage user registrations and approvals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Users</TabsTrigger>
          </TabsList>

          {/* Pending Users */}
          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingUsers.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <Clock className="h-16 w-16 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No pending users</h3>
                    <p className="text-muted-foreground">
                      All registration requests have been processed
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((userData) => (
                  <Card key={userData.address}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <code className="text-sm">{formatAddress(userData.address)}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(userData.role)}
                            {getStatusBadge(userData.status)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(userData.registeredAt)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metadata */}
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-semibold mb-2">Organization Info:</p>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(JSON.parse(userData.metadata), null, 2)}
                        </pre>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReject(userData.address)}
                          variant="outline"
                          className="flex-1"
                          disabled={processingAddress !== null}
                        >
                          {processingAddress === userData.address ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApprove(userData.address)}
                          className="flex-1"
                          disabled={processingAddress !== null}
                        >
                          {processingAddress === userData.address ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved Users */}
          <TabsContent value="approved">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {approvedUsers.map((userData) => (
                  <Card key={userData.address}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <code className="text-sm">{formatAddress(userData.address)}</code>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(userData.role)}
                            {getStatusBadge(userData.status)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(userData.registeredAt)}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Users */}
          <TabsContent value="rejected">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : rejectedUsers.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <X className="h-16 w-16 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No rejected users</h3>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedUsers.map((userData) => (
                  <Card key={userData.address}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <code className="text-sm">{formatAddress(userData.address)}</code>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(userData.role)}
                            {getStatusBadge(userData.status)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(userData.registeredAt)}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Users */}
          <TabsContent value="all">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((userData) => (
                  <Card key={userData.address}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <code className="text-sm">{formatAddress(userData.address)}</code>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(userData.role)}
                            {getStatusBadge(userData.status)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(userData.registeredAt)}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}