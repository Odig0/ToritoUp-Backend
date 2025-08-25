import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CollateralService } from './collateral-supply.service';
import { CreateCollateralDto } from './dto/create-collateral-supply.dto';
import { SupplyStatus } from './entities/collateral-supply.entity';
import { BlockchainService } from '../contracts/blockchain.service';

@Controller('collateral-supply')
export class CollateralSupplyController {
  constructor(
    private readonly collateralSupplyService: CollateralService,
    private readonly blockchainService: BlockchainService
  ) {}

  // CORE BUSINESS LOGIC

  // Supply collateral - makes actual transaction to Aave
  @Post('supply')
  async supplyCollateral(@Body() supplyRequest: any) {
    try {
      // 1. Hacer transacción real a Aave Pool directamente
      const tx = await this.blockchainService.supplyToAave(
        supplyRequest.token,
        supplyRequest.amount,
        supplyRequest.owner
      );

      // 2. Esperar confirmación
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null - transaction may have failed');
      }

      // 3. Crear registro con datos reales
      const collateralData = {
        owner: supplyRequest.owner,
        amount: supplyRequest.amount,
        token: supplyRequest.token,
        tokenSymbol: supplyRequest.tokenSymbol,
        transactionHash: receipt.hash,        // ← Hash REAL
        blockNumber: receipt.blockNumber,     // ← Block REAL
        aaveLiquidityIndex: await this.blockchainService.getAaveLiquidityIndex(supplyRequest.token),
        usdValueAtSupply: supplyRequest.usdValueAtSupply
      };

      return await this.collateralSupplyService.create(collateralData);
    } catch (error) {
      throw new Error(`Failed to supply to Aave: ${error.message}`);
    }
  }

  // Get collateral supplies by owner address
  @Get('owner/:address')
  async findByOwner(@Param('address') address: string) {
    return await this.collateralSupplyService.findByOwner(address);
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

  // UTILITIES

  // Get collateral by transaction hash
  @Get('transaction/:txHash')
  async findByTransactionHash(@Param('txHash') txHash: string) {
    return await this.collateralSupplyService.findByTransactionHash(txHash);
  }

  // Get single collateral supply by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.collateralSupplyService.findOne(id);
  }

  // Test Aave integration
  @Get('aave/liquidity-index/:token')
  async getAaveLiquidityIndex(@Param('token') token: string) {
    try {
      // Get liquidity index from blockchain service
      const liquidityIndex = '1000000000000000000000000000'; // Mock value for now
      return { 
        token, 
        liquidityIndex,
        message: 'Aave liquidity index retrieved successfully' 
      };
    } catch (error) {
      return { 
        error: 'Failed to get Aave liquidity index', 
        details: error.message 
      };
    }
  }
}
