import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollateralDocument = Collateral & Document;

export enum SupplyStatus {
  ACTIVE = 'ACTIVE',
  WITHDRAWN = 'WITHDRAWN',
  LIQUIDATED = 'LIQUIDATED',
}

@Schema({ timestamps: true })
export class Collateral {
  @Prop({ required: true })
  owner: string; // Ethereum address

  @Prop({ required: true })
  amount: string; // BigNumber as string

  @Prop({ required: true })
  token: string; // Token contract address (USDT, USDC, etc.)

  @Prop({ required: true })
  tokenSymbol: string; // Token symbol for easy reference

  @Prop({ required: true })
  aaveLiquidityIndex: string; // BigNumber as string

  @Prop({ required: true, enum: SupplyStatus, default: SupplyStatus.ACTIVE })
  status: SupplyStatus;

  @Prop({ required: true })
  transactionHash: string; // Blockchain transaction hash

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  suppliedAt: Date;

  @Prop({ required: true })
  lastUpdateTimestamp: Date;

  // Current yield/interest earned
  @Prop({ default: '0' })
  yieldEarned: string;

  // USD value at time of supply
  @Prop({ required: true })
  usdValueAtSupply: string;

  // Network (for multi-chain support later)
  @Prop({ default: 'ethereum' })
  network: string;
}

export const CollateralSchema = SchemaFactory.createForClass(Collateral);
