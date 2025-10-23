'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Package, ArrowRightLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { UserStatus, roleToString, statusToString } from '@/lib/contract';

export default function Home() {
  const { account, connectWallet } = useWeb3();
  const { user, isLoading } = useContract();

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Supply Chain Tracker
              </h1>
              <p className="text-xl text-muted-foreground">
                A decentralized application for transparent supply chain management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <Card>
                <CardHeader>
                  <Package className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Track Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Full traceability from raw materials to final products
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ArrowRightLeft className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Secure Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Controlled flow with approval system between supply chain actors
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Role-Based Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Producer, Factory, Retailer, and Consumer roles with specific permissions
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Wallet className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Web3 Powered</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Built on Ethereum with MetaMask integration for secure authentication
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" onClick={connectWallet} className="text-lg px-8">
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet to Get Started
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.status === UserStatus.None) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Welcome to Supply Chain Tracker</CardTitle>
              <CardDescription>
                You need to register to use the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button className="w-full">Register Now</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (user.status === UserStatus.Pending) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Registration Pending</CardTitle>
              <CardDescription>
                Your registration is awaiting admin approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role:</span>
                <Badge>{roleToString(user.role)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="secondary">{statusToString(user.status)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait for an administrator to review and approve your registration.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (user.status === UserStatus.Rejected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Registration Rejected</CardTitle>
              <CardDescription>
                Your registration has been rejected by an administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please contact support if you believe this was an error.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Usuario aprobado - redirigir al dashboard
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              You are registered as {roleToString(user.role)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}