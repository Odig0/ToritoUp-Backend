export interface CollateralResponseDto {
  _id: string;
  owner: string;
  amount: string;
  token: string;
  tokenSymbol: string;
  aaveLiquidityIndex: string;
  status: string;
  transactionHash: string;
  blockNumber: number;
  suppliedAt: Date;
  lastUpdateTimestamp: Date;
  yieldEarned: string;
  usdValueAtSupply: string;
  network: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TotalValueResponseDto {
  owner: string;
  totalValueUSD: string;
  activeSupplies: number;
}
