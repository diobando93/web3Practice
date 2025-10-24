'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Role, roleToString } from '@/lib/contract';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { register, user, isLoading: loadingUser } = useContract();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [metadata, setMetadata] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Si no está conectado, redirigir
  if (!account && !loadingUser) {
    router.push('/');
    return null;
  }

  // Si ya está registrado, mostrar estado
  if (user && user.status !== 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Already Registered</CardTitle>
              <CardDescription>
                You have already registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Role: <strong>{roleToString(user.role)}</strong>
                </AlertDescription>
              </Alert>
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (!metadata.trim()) {
      setError('Please provide some information about yourself or your organization');
      return;
    }

    // Validar que sea JSON válido
    try {
      JSON.parse(metadata);
    } catch {
      setError('Metadata must be valid JSON. Example: {"name":"Farm ABC","location":"Spain"}');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      toast.info('Sending transaction...', {
        description: 'Please confirm the transaction in MetaMask',
      });

      await register(selectedRole, metadata);
      
      toast.success('Registration successful!', {
        description: 'Your registration is pending admin approval',
      });

      // Esperar un momento y redirigir
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err?.message || 'Failed to register';
      setError(errorMessage);
      toast.error('Registration failed', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleDescriptions: Record<number, string> = {
    [Role.Producer]: 'Creates and registers raw materials in the system. Can only transfer to Factories.',
    [Role.Factory]: 'Transforms raw materials into processed products. Receives from Producers, transfers to Retailers.',
    [Role.Retailer]: 'Distributes products to consumers. Receives from Factories, transfers to Consumers.',
    [Role.Consumer]: 'Final point in the supply chain. Can receive products and view complete traceability.',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register in Supply Chain</CardTitle>
            <CardDescription>
              Choose your role and provide information about yourself or your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Select Your Role *</Label>
                <Select
                  value={selectedRole?.toString() || ''}
                  onValueChange={(value) => setSelectedRole(Number(value) as Role)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.Producer.toString()}>
                      🌾 Producer
                    </SelectItem>
                    <SelectItem value={Role.Factory.toString()}>
                      🏭 Factory
                    </SelectItem>
                    <SelectItem value={Role.Retailer.toString()}>
                      🏪 Retailer
                    </SelectItem>
                    <SelectItem value={Role.Consumer.toString()}>
                      🛒 Consumer
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Role Description */}
                {selectedRole !== null && selectedRole !== Role.None && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      {roleDescriptions[selectedRole]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Metadata Input */}
              <div className="space-y-2">
                <Label htmlFor="metadata">Organization Information (JSON) *</Label>
                <Textarea
                  id="metadata"
                  placeholder='{"name":"My Organization","location":"Spain","description":"..."}'
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Provide information in JSON format. Example: {`{"name":"Farm ABC","location":"Valencia","contact":"info@farm.com"}`}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !selectedRole || !metadata.trim()}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>

              {/* Info Alert */}
              <Alert>
                <AlertDescription className="text-sm">
                  After registration, your request will be <strong>pending</strong> until an administrator approves it.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}