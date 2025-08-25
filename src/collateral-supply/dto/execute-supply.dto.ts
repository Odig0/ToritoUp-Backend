import { IsString, IsNotEmpty, IsEthereumAddress, IsOptional } from 'class-validator';

export class ExecuteSupplyDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  owner: string; // Ethereum address of the user

  @IsString()
  @IsNotEmpty()
  amount: string; // Amount in wei as string

  @IsEthereumAddress()
  @IsNotEmpty()
  token: string; // Token contract address

  @IsString()
  @IsNotEmpty()
  tokenSymbol: string; // e.g., 'ETH', 'USDC'

  @IsString()
  @IsOptional()
  usdValueAtSupply?: string; // USD value at time of supply
}
