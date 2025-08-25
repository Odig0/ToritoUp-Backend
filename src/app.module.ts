import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CollateralModule } from './collateral-supply/collateral-supply.module';
import { HealthController } from './health/health.controller';
import { CanonicalLogService } from './common/services/canonical-log.service';
import { CanonicalLoggingInterceptor } from './common/interceptors/canonical-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    DatabaseModule,
    CollateralModule
  ],
  controllers: [HealthController],
  providers: [CanonicalLogService, CanonicalLoggingInterceptor],
})
export class AppModule {}
