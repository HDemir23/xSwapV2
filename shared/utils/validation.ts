const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function isValidAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address);
}

export function isValidAmount(amount: string): boolean {
  if (!amount || amount === '') return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

export function isValidSlippage(slippage: number): boolean {
  return slippage >= 0 && slippage <= 100;
}

export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return address.toLowerCase();
}
