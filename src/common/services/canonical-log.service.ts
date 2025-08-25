import { Injectable, Logger } from '@nestjs/common';

export interface CanonicalLogData {
  timestamp: string;
  requestId: string;
  allocCount?: number;
  authType?: string;
  databaseQueries?: number;
  duration: number;
  httpMethod: string;
  httpPath: string;
  httpStatus: number;
  remoteIp?: string;
  userId?: string;
  team?: string;
  userAgent?: string;
  error?: string;
  fullUrl?: string;
  // DeFi specific fields
  tokenSymbol?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  ethValue?: string;
}

@Injectable()
export class CanonicalLogService {
  private readonly logger = new Logger('canonical-log-line');

  logRequest(data: CanonicalLogData): void {
    const logParts = [
      `[${data.timestamp}]`,
      'canonical-log-line',
    ];

    // Core metrics
    if (data.allocCount) logParts.push(`alloc_count=${data.allocCount}`);
    if (data.authType) logParts.push(`auth_type=${data.authType}`);
    if (data.databaseQueries) logParts.push(`database_queries=${data.databaseQueries}`);
    
    logParts.push(`duration=${data.duration.toFixed(3)}`);
    logParts.push(`http_method=${data.httpMethod}`);
  // http_path is expected to be the relative path; fullUrl (if present) will be emitted as full_url
  logParts.push(`http_path=${data.httpPath}`);
  if (data.fullUrl) logParts.push(`full_url=${data.fullUrl}`);
    logParts.push(`http_status=${data.httpStatus}`);
    logParts.push(`request_id=${data.requestId}`);

    // Optional fields
    if (data.remoteIp) logParts.push(`remote_ip=${data.remoteIp}`);
    if (data.userId) logParts.push(`user_id=${data.userId}`);
    if (data.team) logParts.push(`team=${data.team}`);
    if (data.userAgent) logParts.push(`user_agent="${data.userAgent}"`);
    
    // DeFi specific fields
    if (data.tokenSymbol) logParts.push(`token_symbol=${data.tokenSymbol}`);
    if (data.transactionHash) logParts.push(`tx_hash=${data.transactionHash}`);
    if (data.blockNumber) logParts.push(`block_number=${data.blockNumber}`);
    if (data.gasUsed) logParts.push(`gas_used=${data.gasUsed}`);
    if (data.ethValue) logParts.push(`eth_value=${data.ethValue}`);

    // Error handling
    if (data.error) {
      logParts.push(`error="${data.error}"`);
      this.logger.error(logParts.join(' '));
    } else {
      this.logger.log(logParts.join(' '));
    }
  }

  logTransaction(data: {
    requestId: string;
    operation: string;
    tokenSymbol: string;
    amount: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    duration: number;
    success: boolean;
    error?: string;
  }): void {
    const timestamp = new Date().toISOString();
    
    const logParts = [
      `[${timestamp}]`,
      'canonical-log-line',
      `operation=${data.operation}`,
      `token_symbol=${data.tokenSymbol}`,
      `amount=${data.amount}`,
      `tx_hash=${data.transactionHash}`,
      `block_number=${data.blockNumber}`,
      `gas_used=${data.gasUsed}`,
      `duration=${data.duration.toFixed(3)}`,
      `request_id=${data.requestId}`,
      `success=${data.success}`,
    ];

    if (data.error) {
      logParts.push(`error="${data.error}"`);
      this.logger.error(logParts.join(' '));
    } else {
      this.logger.log(logParts.join(' '));
    }
  }

  logAaveOperation(data: {
    requestId: string;
    operation: 'supply' | 'withdraw' | 'borrow' | 'repay';
    token: string;
    amount: string;
    user: string;
    aavePool: string;
    liquidityIndex?: string;
    duration: number;
    success: boolean;
    error?: string;
  }): void {
    const timestamp = new Date().toISOString();
    
    const logParts = [
      `[${timestamp}]`,
      'canonical-log-line',
      `aave_operation=${data.operation}`,
      `token=${data.token}`,
      `amount=${data.amount}`,
      `user=${data.user.substring(0, 10)}...`, // Privacy for addresses
      `aave_pool=${data.aavePool}`,
      `duration=${data.duration.toFixed(3)}`,
      `request_id=${data.requestId}`,
      `success=${data.success}`,
    ];

    if (data.liquidityIndex) {
      logParts.push(`liquidity_index=${data.liquidityIndex}`);
    }

    if (data.error) {
      logParts.push(`error="${data.error}"`);
      this.logger.error(logParts.join(' '));
    } else {
      this.logger.log(logParts.join(' '));
    }
  }
}
