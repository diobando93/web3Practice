'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getContract, Role, UserStatus } from '@/lib/contract';
import { ethers } from 'ethers';

interface User {
  userAddress: string;
  role: Role;
  status: UserStatus;
  metadata: string;
  registeredAt: bigint;
}

export const useContract = () => {
  const { account, signer, provider } = useWeb3();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar información del usuario
  useEffect(() => {
    const loadUser = async () => {
      if (!account || !provider) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contract = getContract(provider);
        const userData = await contract.users(account);
        
        setUser({
          userAddress: userData[0],
          role: Number(userData[1]) as Role,
          status: Number(userData[2]) as UserStatus,
          metadata: userData[3],
          registeredAt: userData[4],
        });
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [account, provider]);

  // Función para registrarse
  const register = async (role: Role, metadata: string) => {
    if (!signer) throw new Error('No signer available');
    
    const contract = getContract(signer);
    const tx = await contract.register(role, metadata);
    await tx.wait();
  };

  // Función para crear token
  const createToken = async (
    name: string,
    metadata: string,
    parentId: number,
    initialAmount: number
  ) => {
    if (!signer) throw new Error('No signer available');
    
    const contract = getContract(signer);
    const tx = await contract.createToken(name, metadata, parentId, initialAmount);
    const receipt = await tx.wait();
    
    // Extraer el tokenId del evento
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'TokenCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return Number(parsed?.args[0]); // tokenId
    }
    
    return null;
  };

  // Función para iniciar transferencia
  const initiateTransfer = async (
    tokenId: number,
    to: string,
    amount: number
  ) => {
    if (!signer) throw new Error('No signer available');
    
    const contract = getContract(signer);
    const tx = await contract.initiateTransfer(tokenId, to, amount);
    const receipt = await tx.wait();
    
    // Extraer el transferId del evento
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'TransferInitiated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return Number(parsed?.args[0]); // transferId
    }
    
    return null;
  };

  // Función para aceptar transferencia
  const acceptTransfer = async (transferId: number) => {
    if (!signer) throw new Error('No signer available');
    
    const contract = getContract(signer);
    const tx = await contract.acceptTransfer(transferId);
    await tx.wait();
  };

  // Función para rechazar transferencia
  const rejectTransfer = async (transferId: number) => {
    if (!signer) throw new Error('No signer available');
    
    const contract = getContract(signer);
    const tx = await contract.rejectTransfer(transferId);
    await tx.wait();
  };

  // Función para obtener balance
  const getBalance = async (tokenId: number) => {
    if (!account || !provider) return 0;
    
    const contract = getContract(provider);
    const balance = await contract.balanceOf(account, tokenId);
    return Number(balance);
  };

  return {
    user,
    isLoading,
    register,
    createToken,
    initiateTransfer,
    acceptTransfer,
    rejectTransfer,
    getBalance,
  };
};