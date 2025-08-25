// Torito Contract ABI - Main lending protocol contract with Aave integration
export const TORITO_ABI = [
  // Initialize function
  {
    "inputs": [
      { "internalType": "address", "name": "_aavePool", "type": "address" },
      { "internalType": "address", "name": "_owner", "type": "address" }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Supply function - deposits collateral and supplies to Aave
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Withdraw Supply function
  {
    "inputs": [
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "withdrawSupply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Borrow function
  {
    "inputs": [
      { "internalType": "address", "name": "_collateralToken", "type": "address" },
      { "internalType": "uint256", "name": "_borrowAmount", "type": "uint256" },
      { "internalType": "bytes32", "name": "_fiatCurrency", "type": "bytes32" }
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Repay Loan function
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_fiatCurrency", "type": "bytes32" },
      { "internalType": "uint256", "name": "_repaymentAmount", "type": "uint256" }
    ],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Get Supply function
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "address", "name": "_token", "type": "address" }
    ],
    "name": "supplies",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "aaveLiquidityIndex", "type": "uint256" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "enum Torito.SupplyStatus", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "lastUpdateTimestamp", "type": "uint256" }
        ],
        "internalType": "struct Torito.Supply",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Get Borrow function
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "bytes32", "name": "_fiatCurrency", "type": "bytes32" }
    ],
    "name": "borrows",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "uint256", "name": "borrowedAmount", "type": "uint256" },
          { "internalType": "address", "name": "collateralToken", "type": "address" },
          { "internalType": "bytes32", "name": "fiatCurrency", "type": "bytes32" },
          { "internalType": "uint256", "name": "interestAccrued", "type": "uint256" },
          { "internalType": "uint256", "name": "totalRepaid", "type": "uint256" },
          { "internalType": "enum Torito.BorrowStatus", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "collateralAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "lastInterestUpdate", "type": "uint256" },
          { "internalType": "uint256", "name": "lastRepaymentTimestamp", "type": "uint256" }
        ],
        "internalType": "struct Torito.Borrow",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Admin functions
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "bool", "name": "supported", "type": "bool" }
    ],
    "name": "setSupportedToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "bytes32", "name": "currency", "type": "bytes32" },
      { "internalType": "uint256", "name": "currencyExchangeRate", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "address", "name": "oracle", "type": "address" },
      { "internalType": "uint256", "name": "collateralizationRatio", "type": "uint256" },
      { "internalType": "uint256", "name": "liquidationThreshold", "type": "uint256" }
    ],
    "name": "setSupportedCurrency",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // View functions
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "supportedTokens",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "supportedCurrencies",
    "outputs": [
      { "internalType": "bytes32", "name": "currency", "type": "bytes32" },
      { "internalType": "uint256", "name": "currencyExchangeRate", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "address", "name": "oracle", "type": "address" },
      { "internalType": "uint256", "name": "collateralizationRatio", "type": "uint256" },
      { "internalType": "uint256", "name": "liquidationThreshold", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }
    ],
    "name": "SupplyUpdated",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "currency", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }
    ],
    "name": "BorrowUpdated",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "currency", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "remainingAmount", "type": "uint256" }
    ],
    "name": "LoanRepaid",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "collateralAmount", "type": "uint256" }
    ],
    "name": "CollateralLiquidated",
    "type": "event"
  }
] as const;

// Aave V3 Pool ABI (Sepolia)
export const AAVE_POOL_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "onBehalfOf", "type": "address" },
      { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "withdraw",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }],
    "name": "getReserveNormalizedIncome",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses (Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
  // Torito contract - replace with your deployed contract address
  TORITO_MAIN: '0x0000000000000000000000000000000000000000', // Replace with actual address
  
  // Aave V3 Sepolia addresses
  AAVE_POOL: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Aave V3 Pool Sepolia
  AAVE_ADDRESSES_PROVIDER: '0x0496275d34753A48320CA58103d5220d394FF77F', // Aave V3 AddressesProvider Sepolia
  
  // Token addresses on Sepolia
  USDC_SEPOLIA: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // USDC on Sepolia
  USDT_SEPOLIA: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT on Sepolia (example)
  DAI_SEPOLIA: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', // DAI on Sepolia
  WETH_SEPOLIA: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c', // WETH on Sepolia
  
  // ETH reserve address for Aave
  ETH_RESERVE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
} as const;

// Supported tokens configuration for Sepolia
export const SUPPORTED_TOKENS = {
  USDC: {
    address: CONTRACT_ADDRESSES.USDC_SEPOLIA,
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin'
  },
  USDT: {
    address: CONTRACT_ADDRESSES.USDT_SEPOLIA,
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD'
  },
  DAI: {
    address: CONTRACT_ADDRESSES.DAI_SEPOLIA,
    symbol: 'DAI',
    decimals: 18,
    name: 'Dai Stablecoin'
  },
  WETH: {
    address: CONTRACT_ADDRESSES.WETH_SEPOLIA,
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether'
  },
  ETH: {
    address: CONTRACT_ADDRESSES.ETH_RESERVE_ADDRESS,
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum'
  }
} as const;

// Supported fiat currencies
export const SUPPORTED_FIAT_CURRENCIES = {
  USD: {
    currency: 'USD',
    symbol: '$',
    decimals: 2
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    decimals: 2
  },
  BOB: {
    currency: 'BOB',
    symbol: 'Bs',
    decimals: 2
  }
} as const;
