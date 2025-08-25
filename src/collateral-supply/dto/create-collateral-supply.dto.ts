import { IsString, IsNotEmpty, IsNumber, IsEthereumAddress, IsOptional } from 'class-validator';

export class CreateCollateralDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  owner: string; // Ethereum address of the user

  @IsString()
  @IsNotEmpty()
  amount: string; // Amount in wei/token decimals as string

  @IsEthereumAddress()
  @IsNotEmpty()
  token: string; // Token contract address

  @IsString()
  @IsNotEmpty()
  tokenSymbol: string; // e.g., 'USDT', 'USDC'

  @IsString()
  @IsNotEmpty()
  transactionHash: string; // Blockchain transaction hash

  @IsNumber()
  blockNumber: number; // Block number where transaction was mined

  @IsString()
  @IsOptional()
  aaveLiquidityIndex?: string; // Will be fetched from Aave if not provided

  @IsString()
  @IsOptional()
  usdValueAtSupply?: string; // Will be calculated from oracle if not provided
}
