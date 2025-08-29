import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CollateralService } from './collateral-supply.service';
import { CreateCollateralDto } from './dto/create-collateral-supply.dto';
import { SupplyStatus } from './entities/collateral-supply.entity';
import { BlockchainService } from '../contracts/blockchain.service';

@Controller('collateral')
export class CollateralSupplyController {
  constructor(
    private readonly collateralSupplyService: CollateralService,
    private readonly blockchainService: BlockchainService
  ) {}

  // Supply collateral - makes actual transaction to Aave
  @Post('supply')
  async supplyCollateral(@Body() supplyRequest: any) {
    try {
      const tx = await this.blockchainService.supplyToAave(
        supplyRequest.token,
        supplyRequest.amount,
        supplyRequest.owner
      );

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Transaction receipt is null - transaction may have failed');
      }

      const collateralData = {
        owner: supplyRequest.owner,
        amount: supplyRequest.amount,
        token: supplyRequest.token,
        tokenSymbol: supplyRequest.tokenSymbol,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        aaveLiquidityIndex: await this.blockchainService.getAaveLiquidityIndex(supplyRequest.token),
        usdValueAtSupply: supplyRequest.usdValueAtSupply
      };

      return await this.collateralSupplyService.create(collateralData);
    } catch (error) {
      throw new Error(`Failed to supply to Aave: ${error.message}`);
    }
  }

  // Get total collateral value for a user
  @Get('owner/:address/total-value')
  async getTotalCollateralValue(@Param('address') address: string) {
    const totalValue = await this.collateralSupplyService.getTotalCollateralValue(address);
    return { owner: address, totalValueUSD: totalValue };
  }

  // Update collateral status (for withdrawals, liquidations)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SupplyStatus }
  ) {
    return await this.collateralSupplyService.updateStatus(id, body.status);
  }
}
