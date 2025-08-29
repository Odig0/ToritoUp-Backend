import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers, isAddress } from 'ethers';
import { CreateCollateralDto } from './dto/create-collateral-supply.dto';
import { UpdateCollateralDto } from './dto/update-collateral-supply.dto';
import { Collateral, CollateralDocument, SupplyStatus } from './entities/collateral-supply.entity';

@Injectable()
export class CollateralService {
  constructor(
    @InjectModel(Collateral.name) private collateralModel: Model<CollateralDocument>,
  ) {}

  async create(createCollateralDto: CreateCollateralDto): Promise<Collateral> {
    try {
      // Validate Ethereum address
      if (!isAddress(createCollateralDto.owner)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      // Check if transaction hash already exists to prevent duplicates
      const existingCollateral = await this.collateralModel.findOne({
        transactionHash: createCollateralDto.transactionHash,
      });

      if (existingCollateral) {
        throw new BadRequestException('Collateral supply already recorded for this transaction');
      }

      // Normalize owner to lowercase so queries (which use owner.toLowerCase()) match stored docs
      const collateral = new this.collateralModel({
        ...createCollateralDto,
        owner: createCollateralDto.owner.toLowerCase(),
        status: SupplyStatus.ACTIVE,
        suppliedAt: new Date(),
        lastUpdateTimestamp: new Date(),
        yieldEarned: '0',
        aaveLiquidityIndex: createCollateralDto.aaveLiquidityIndex || '0',
        usdValueAtSupply: createCollateralDto.usdValueAtSupply || '0',
      });

      return await collateral.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create collateral supply record');
    }
  }

  async findAll(): Promise<Collateral[]> {
    return await this.collateralModel.find().exec();
  }

  async findByOwner(owner: string): Promise<Collateral[]> {
    if (!isAddress(owner)) {
      throw new BadRequestException('Invalid Ethereum address');
    }
  // Use case-insensitive match so existing documents with mixed-case addresses are found
  const ownerRegex = new RegExp(`^${owner}$`, 'i');
  return await this.collateralModel.find({ owner: ownerRegex }).exec();
  }

  async findActiveByOwner(owner: string): Promise<Collateral[]> {
    if (!isAddress(owner)) {
      throw new BadRequestException('Invalid Ethereum address');
    }
    // Case-insensitive owner match to include previously-stored documents
    const ownerRegex = new RegExp(`^${owner}$`, 'i');
    return await this.collateralModel.find({
      owner: ownerRegex,
      status: SupplyStatus.ACTIVE,
    }).exec();
  }

  async findOne(id: string): Promise<Collateral> {
    const collateral = await this.collateralModel.findById(id).exec();
    if (!collateral) {
      throw new NotFoundException('Collateral supply not found');
    }
    return collateral;
  }

  async findByTransactionHash(txHash: string): Promise<Collateral> {
    const collateral = await this.collateralModel.findOne({ transactionHash: txHash }).exec();
    if (!collateral) {
      throw new NotFoundException('Collateral supply not found for transaction hash');
    }
    return collateral;
  }

  async update(id: string, updateCollateralDto: UpdateCollateralDto): Promise<Collateral> {
    const updatedCollateral = await this.collateralModel.findByIdAndUpdate(
      id,
      { ...updateCollateralDto, lastUpdateTimestamp: new Date() },
      { new: true },
    ).exec();

    if (!updatedCollateral) {
      throw new NotFoundException('Collateral supply not found');
    }
    return updatedCollateral;
  }

  async updateStatus(id: string, status: SupplyStatus): Promise<Collateral> {
    const updatedCollateral = await this.collateralModel.findByIdAndUpdate(
      id,
      { status, lastUpdateTimestamp: new Date() },
      { new: true },
    ).exec();

    if (!updatedCollateral) {
      throw new NotFoundException('Collateral supply not found');
    }
    return updatedCollateral;
  }

  async remove(id: string): Promise<void> {
    const result = await this.collateralModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Collateral supply not found');
    }
  }

  // Calculate total collateral value for a user
  async getTotalCollateralValue(owner: string): Promise<string> {
    if (!isAddress(owner)) {
      throw new BadRequestException('Invalid Ethereum address');
    }

    const activeCollaterals = await this.findActiveByOwner(owner);
    // This would integrate with price oracles to calculate USD value
    // For now, return sum of usdValueAtSupply
    let totalValue = 0n;
    
    for (const collateral of activeCollaterals) {
      totalValue += BigInt(collateral.usdValueAtSupply );
    }

    return totalValue.toString();
  }
}
