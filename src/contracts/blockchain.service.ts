import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { 
  TORITO_ABI, 
  AAVE_POOL_ABI, 
  CONTRACT_ADDRESSES, 
  SUPPORTED_TOKENS 
} from './torito.abi';
import { CanonicalLogService } from '../common/services/canonical-log.service';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(private readonly canonicalLogService: CanonicalLogService) {
    // Initialize provider and wallet
    // Trim environment values to avoid issues from trailing newlines/spaces
    const rpcUrl = process.env.SEPOLIA_RPC_URL ? process.env.SEPOLIA_RPC_URL.trim() : undefined;
    const privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : undefined;

    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    this.logger.log('Blockchain service initialized for Sepolia network');
  }

  /**
   * Get supply amount from Torito contract
   */
  async getSupplyFromContract(userAddress: string, token: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TORITO_MAIN,
        TORITO_ABI,
        this.provider
      );

      const supply = await contract.getSupply(userAddress, token);
      return supply.toString();
    } catch (error) {
      this.logger.error(`Error getting supply from contract: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supply tokens directly to Aave V3 Pool
   */
  async supplyToAave(
    token: string,
    amount: string,
    onBehalfOf?: string
  ): Promise<ethers.TransactionResponse> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    try {
      const aavePool = new ethers.Contract(
        CONTRACT_ADDRESSES.AAVE_POOL,
        AAVE_POOL_ABI,
        this.wallet
      );

      // If no onBehalfOf provided, use wallet address
      const beneficiary = onBehalfOf || this.wallet.address;

      // For ETH, convert to WETH first, then supply WETH to Aave
      if (token === CONTRACT_ADDRESSES.ETH_RESERVE_ADDRESS) {
        this.logger.log('Converting ETH to WETH for Aave supply...');
        
        // Use WETH address instead of ETH reserve address
        const wethAddress = CONTRACT_ADDRESSES.WETH_SEPOLIA;
        
        // First wrap ETH to WETH
        const wethContract = new ethers.Contract(
          wethAddress,
          ['function deposit() payable'],
          this.wallet
        );
        
        const wrapTx = await wethContract.deposit({ value: amount });
        const wrapReceipt = await wrapTx.wait();
        
        // Log wrap transaction
        this.canonicalLogService.logTransaction({
          requestId,
          operation: 'eth_wrap',
          tokenSymbol: 'ETH',
          amount: ethers.formatEther(amount),
          transactionHash: wrapTx.hash,
          blockNumber: wrapReceipt.blockNumber,
          gasUsed: wrapReceipt.gasUsed.toString(),
          duration: (Date.now() - startTime) / 1000,
          success: true,
        });
        
        // Approve WETH to Aave Pool
        const wethApproval = new ethers.Contract(
          wethAddress,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          this.wallet
        );
        
        const approveTx = await wethApproval.approve(CONTRACT_ADDRESSES.AAVE_POOL, amount);
        const approveReceipt = await approveTx.wait();
        
        // Log approval transaction
        this.canonicalLogService.logTransaction({
          requestId,
          operation: 'weth_approve',
          tokenSymbol: 'WETH',
          amount: ethers.formatEther(amount),
          transactionHash: approveTx.hash,
          blockNumber: approveReceipt.blockNumber,
          gasUsed: approveReceipt.gasUsed.toString(),
          duration: (Date.now() - startTime) / 1000,
          success: true,
        });
        
        // Now supply WETH to Aave
        const supplyTx = await aavePool.supply(wethAddress, amount, beneficiary, 0);
        const supplyReceipt = await supplyTx.wait();
        
        // Log Aave supply operation
        this.canonicalLogService.logAaveOperation({
          requestId,
          operation: 'supply',
          token: 'WETH',
          amount: ethers.formatEther(amount),
          user: beneficiary,
          aavePool: CONTRACT_ADDRESSES.AAVE_POOL,
          duration: (Date.now() - startTime) / 1000,
          success: true,
        });
        
        this.logger.log(`WETH supply transaction sent to Aave: ${supplyTx.hash}`);
        
        // Return the wrap transaction (shows ETH Value in Etherscan)
        return wrapTx;
      } else {
        // For ERC20 tokens, first approve then supply
        this.logger.log(`Supplying ${token} to Aave...`);
        
        // Approve token to Aave Pool first
        const tokenContract = new ethers.Contract(
          token,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          this.wallet
        );
        
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.AAVE_POOL, amount);
        await approveTx.wait();
        this.logger.log(`Token approved to Aave: ${approveTx.hash}`);
        
        const tx = await aavePool.supply(token, amount, beneficiary, 0);
        
        // Log ERC20 supply operation
        this.canonicalLogService.logAaveOperation({
          requestId,
          operation: 'supply',
          token: token,
          amount: amount,
          user: beneficiary,
          aavePool: CONTRACT_ADDRESSES.AAVE_POOL,
          duration: (Date.now() - startTime) / 1000,
          success: true,
        });
        
        this.logger.log(`Token supply transaction sent to Aave: ${tx.hash}`);
        return tx;
      }
    } catch (error) {
      // Log error
      this.canonicalLogService.logAaveOperation({
        requestId,
        operation: 'supply',
        token: token,
        amount: amount,
        user: onBehalfOf || this.wallet.address,
        aavePool: CONTRACT_ADDRESSES.AAVE_POOL,
        duration: (Date.now() - startTime) / 1000,
        success: false,
        error: error.message,
      });
      
      this.logger.error(`Error supplying to Aave: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Aave liquidity index for a token
   */
  async getAaveLiquidityIndex(token: string): Promise<string> {
    try {
      // For now, return a mock liquidity index
      // In production, you would call the actual Aave contract
      this.logger.log(`Getting liquidity index for token: ${token}`);
      
      // Mock liquidity index (1.05 = 5% growth)
      return "1050000000000000000000000000";
    } catch (error) {
      this.logger.error(`Error getting Aave liquidity index: ${error.message}`);
      // Return default liquidity index instead of throwing
      return "1000000000000000000000000000";
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        networkName: network.name,
        chainId: network.chainId.toString(),
        blockNumber,
        walletAddress: this.wallet.address
      };
    } catch (error) {
      this.logger.error(`Error getting network info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate transaction exists and is successful
   */
  async validateSupplyTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        this.logger.warn(`Transaction not found: ${txHash}`);
        return false;
      }

      // Check if transaction was successful
      if (receipt.status !== 1) {
        this.logger.warn(`Transaction failed: ${txHash}`);
        return false;
      }

      this.logger.log(`Transaction validated: ${txHash}`);
      return true;
    } catch (error) {
      this.logger.error(`Error validating transaction: ${error.message}`);
      return false;
    }
  }

  /**
   * Get token balance of wallet
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    try {
      if (tokenAddress === CONTRACT_ADDRESSES.ETH_RESERVE_ADDRESS) {
        // ETH balance
        const balance = await this.provider.getBalance(this.wallet.address);
        return balance.toString();
      } else {
        // ERC20 token balance
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          this.provider
        );
        
        const balance = await tokenContract.balanceOf(this.wallet.address);
        return balance.toString();
      }
    } catch (error) {
      this.logger.error(`Error getting token balance: ${error.message}`);
      throw error;
    }
  }
}
