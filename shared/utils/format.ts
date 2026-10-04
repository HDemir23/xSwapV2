export function shortenAddress(address: string | undefined, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUsd(value: number | undefined): string {
  if (value === undefined || value === null) return '$0.00';
  if (value < 0.01) return '<$0.01';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBalance(balance: string | number | undefined, decimals = 4): string {
  if (!balance) return '0';
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  return num.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

export function formatNumber(num: number, decimals = 4): string {
  if (num === 0) return '0';
  if (num < 0.0001) return num.toExponential(2);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatTokenAmount(amount: string | bigint, decimals: number): string {
  const value = typeof amount === 'bigint' ? amount.toString() : amount;
  const divisor = BigInt(10 ** decimals);
  const quotient = BigInt(value) / divisor;
  const remainder = BigInt(value) % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0').slice(0, 6);
  return `${quotient}.${remainderStr}`.replace(/\.?0+$/, '') || '0';
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fractionPadded);
}
