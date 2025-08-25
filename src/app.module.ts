import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CollateralModule } from './collateral-supply/collateral-supply.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    DatabaseModule,
    CollateralModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
