import { MONAD_BLOCK_EXPLORER } from '../constants';

export function getExplorerUrl(path: 'tx' | 'address' | 'token', hash: string): string {
  return `${MONAD_BLOCK_EXPLORER}/${path}/${hash}`;
}

export function getTxExplorerUrl(txHash: string): string {
  return getExplorerUrl('tx', txHash);
}

export function getAddressExplorerUrl(address: string): string {
  return getExplorerUrl('address', address);
}

export function getTokenExplorerUrl(tokenAddress: string): string {
  return getExplorerUrl('token', tokenAddress);
}
