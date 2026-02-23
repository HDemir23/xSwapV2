export const ERROR_MESSAGES: Record<string, string> = {
  "insufficient balance": "You don't have enough {token} for this swap.",
  "insufficient allowance": "Please approve {token} first.",
  "slippage exceeded":
    "Price moved too much. Try increasing slippage tolerance.",
  "execution failed": "Swap failed. Your tokens are safe.",
  "network error": "Connection lost. Please try again.",
  "user rejected": "Transaction cancelled by user.",
  "invalid signature":
    "Invalid wallet signature. Please reconnect your wallet.",
  "session expired": "Session expired. Please reconnect your wallet.",
  "rate limit exceeded":
    "Too many requests. Please wait a moment and try again.",
  "token not found": "Token not found in our list.",
  "market not found": "No market available for this trading pair.",
  "insufficient liquidity": "Not enough liquidity for this swap amount.",
  "price impact too high": "Price impact is too high. Try a smaller amount.",
  "invalid amount": "Please enter a valid amount.",
  "invalid address": "Invalid wallet address.",
  unauthorized: "Unauthorized access. Please check your credentials.",
  "api key expired": "API key has expired. Please generate a new one.",
  "bot not found": "Bot not found. Please register first.",
  "transaction pending": "Transaction is still pending.",
  "transaction failed": "Transaction failed on the blockchain.",
  "unknown error": "An unexpected error occurred. Please try again.",
};

export function formatErrorMessage(
  errorKey: string,
  replacements?: Record<string, string>,
): string {
  let message =
    ERROR_MESSAGES[errorKey.toLowerCase()] ||
    ERROR_MESSAGES["unknown error"] ||
    errorKey;

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
  }

  return message;
}

export const RPC_ERROR_CODES: Record<number, string> = {
  4001: "user rejected",
  4100: "unauthorized",
  4200: "unsupported method",
  4900: "disconnected",
  4901: "chain disconnected",
  "-32000": "insufficient funds",
  "-32001": "resource unavailable",
  "-32002": "resource locked",
  "-32003": "transaction rejected",
  "-32004": "method not supported",
  "-32005": "limit exceeded",
  "-32006": "json-rpc version not supported",
  "-32600": "invalid request",
  "-32601": "method not found",
  "-32602": "invalid params",
  "-32603": "internal error",
  "-32700": "parse error",
};

export function parseRpcError(error: any): string {
  if (error?.code && RPC_ERROR_CODES[error.code]) {
    return RPC_ERROR_CODES[error.code];
  }

  if (error?.message) {
    const msg = error.message.toLowerCase();
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (msg.includes(key)) {
        return key;
      }
    }
    return msg;
  }

  return "unknown error";
}
