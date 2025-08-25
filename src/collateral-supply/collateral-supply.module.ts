import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollateralService } from './collateral-supply.service';
import { CollateralSupplyController } from './collateral-supply.controller';
import { BlockchainService } from '../contracts/blockchain.service';
import {
  Collateral,
  CollateralSchema,
} from './entities/collateral-supply.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collateral.name, schema: CollateralSchema },
    ]),
  ],
  controllers: [CollateralSupplyController],
  providers: [CollateralService, BlockchainService],
  exports: [CollateralService, BlockchainService], // Export for use in other modules
})
export class CollateralModule {}
