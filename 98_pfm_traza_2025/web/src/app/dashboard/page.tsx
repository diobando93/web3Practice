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
import { Package, ArrowRightLeft, Users, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { UserStatus, Role, roleToString } from '@/lib/contract';
import { getReadOnlyProvider, getContract } from '@/lib/contract';

export default function DashboardPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { user, isLoading } = useContract();
  
  const [stats, setStats] = useState({
    myTokens: 0,
    pendingTransfers: 0,
    totalTokens: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!account) {
        router.push('/');
      } else if (user?.status !== UserStatus.Approved) {
        router.push('/');
      }
    }
  }, [account, user, isLoading, router]);


  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!account) return;
      
      try {
        setLoadingStats(true);
        const provider = getReadOnlyProvider();
        const contract = getContract(provider);
        
        // Obtener tokens del usuario
        const userTokens = await contract.getUserTokens(account);
        
        // Obtener transferencias pendientes
        const pendingTransfers = await contract.getPendingTransfers(account);
        
        // Obtener total de tokens en el sistema
        const tokenCounter = await contract.tokenCounter();
        
        setStats({
          myTokens: userTokens.length,
          pendingTransfers: pendingTransfers.length,
          totalTokens: Number(tokenCounter),
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (account && user?.status === UserStatus.Approved) {
      loadStats();
    }
  }, [account, user]);

  // Redirecciones
  if (!account && !isLoading) {
    router.push('/');
    return null;
  }

   if (isLoading || !account || user?.status !== UserStatus.Approved) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const getRoleColor = (role: Role) => {
    const colors: Record<Role, string> = {
      [Role.None]: 'secondary',
      [Role.Admin]: 'destructive',
      [Role.Producer]: 'default',
      [Role.Factory]: 'secondary',
      [Role.Retailer]: 'outline',
      [Role.Consumer]: 'default',
    };
    return colors[role] || 'default';
  };

  const getRoleActions = (role: Role) => {
    switch (role) {
      case Role.Admin:
        return [
          { label: 'Manage Users', href: '/admin/users', icon: Users },
          { label: 'System Stats', href: '/admin/stats', icon: TrendingUp },
        ];
      case Role.Producer:
        return [
          { label: 'Create Raw Material', href: '/tokens/create', icon: Plus },
          { label: 'My Materials', href: '/tokens', icon: Package },
        ];
      case Role.Factory:
        return [
          { label: 'Create Product', href: '/tokens/create', icon: Plus },
          { label: 'My Products', href: '/tokens', icon: Package },
        ];
      case Role.Retailer:
        return [
          { label: 'Create Product', href: '/tokens/create', icon: Plus },
          { label: 'My Inventory', href: '/tokens', icon: Package },
        ];
      case Role.Consumer:
        return [
          { label: 'My Products', href: '/tokens', icon: Package },
        ];
      default:
        return [];
    }
  };

  const actions = user ? getRoleActions(user.role) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Welcome back,</p>
            <Badge variant={getRoleColor(user?.role || Role.None) as any}>
              {roleToString(user?.role || Role.None)}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tokens</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myTokens}</div>
              <p className="text-xs text-muted-foreground">
                Tokens you own or created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTransfers}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total System Tokens</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokens}</div>
              <p className="text-xs text-muted-foreground">
                Tokens in the supply chain
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{action.label}</CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}

            {/* Common actions for all roles */}
            <Link href="/transfers">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ArrowRightLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">View Transfers</CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Role-specific information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Role: {roleToString(user?.role || Role.None)}</CardTitle>
            <CardDescription>
              {user?.role === Role.Admin && 'You can manage users and oversee the entire supply chain system.'}
              {user?.role === Role.Producer && 'You can create raw materials and transfer them to factories.'}
              {user?.role === Role.Factory && 'You can receive raw materials, create processed products, and transfer to retailers.'}
              {user?.role === Role.Retailer && 'You can receive products from factories and distribute them to consumers.'}
              {user?.role === Role.Consumer && 'You can receive products and view their complete traceability.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account:</span>
                <code className="text-xs">{account?.slice(0, 10)}...{account?.slice(-8)}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              {user?.metadata && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-semibold mb-2">Organization Info:</p>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(user.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}