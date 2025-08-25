import { PartialType } from '@nestjs/mapped-types';
import { CreateCollateralDto } from './create-collateral-supply.dto';

export class UpdateCollateralDto extends PartialType(CreateCollateralDto) {}
