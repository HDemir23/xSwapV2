export interface AuthMessageResponse {
  message: string;
  nonce: string;
}

export interface ConnectWalletRequest {
  address: string;
  message: string;
  signature: string;
}

export interface ConnectWalletResponse {
  sessionToken: string;
  expiresIn: number;
  user: {
    id: string;
    address: string;
  };
}

export interface BotRegisterRequest {
  botName?: string;
  walletAddress: string;
}

export interface BotRegisterResponse {
  apiKey: string;
  apiSecret: string;
  walletAddress: string;
}
