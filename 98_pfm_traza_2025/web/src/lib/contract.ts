import { ethers } from 'ethers';
import SupplyChainABI from '@/contracts/SupplyChain.json';
import { CONTRACT_ADDRESS } from '@/contracts/config';

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI.abi, signerOrProvider);
};

export enum Role {
  None = 0,
  Admin = 1,
  Producer = 2,
  Factory = 3,
  Retailer = 4,
  Consumer = 5,
}

export enum UserStatus {
  None = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Canceled = 4,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export const roleToString = (role: Role): string => {
  const roleMap: Record<Role, string> = {
    [Role.None]: 'None',
    [Role.Admin]: 'Admin',
    [Role.Producer]: 'Producer',
    [Role.Factory]: 'Factory',
    [Role.Retailer]: 'Retailer',
    [Role.Consumer]: 'Consumer',
  };
  return roleMap[role];
};

export const statusToString = (status: UserStatus): string => {
  const statusMap: Record<UserStatus, string> = {
    [UserStatus.None]: 'Not Registered',
    [UserStatus.Pending]: 'Pending',
    [UserStatus.Approved]: 'Approved',
    [UserStatus.Rejected]: 'Rejected',
    [UserStatus.Canceled]: 'Canceled',
  };
  return statusMap[status];
};