/**
 * Shared types for Ledger Agent Payments system
 */
// =============================================================================
// Supported Chains
// =============================================================================
export const SUPPORTED_CHAINS = {
    8453: {
        name: "Base",
        symbol: "ETH",
        explorer: "https://basescan.org",
    },
    11155111: {
        name: "Sepolia",
        symbol: "ETH",
        explorer: "https://sepolia.etherscan.io",
    },
    84532: {
        name: "Base Sepolia",
        symbol: "ETH",
        explorer: "https://sepolia.basescan.org",
    },
};
// =============================================================================
// Supported Tokens
// =============================================================================
export const SUPPORTED_TOKENS = {
    // Base mainnet
    8453: {
        USDC: {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            decimals: 6,
        },
    },
    // Sepolia testnet
    11155111: {
        USDC: {
            address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            decimals: 6,
        },
    },
    // Base Sepolia testnet
    84532: {
        USDC: {
            address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            decimals: 6,
        },
    },
};
// =============================================================================
// Explorer URL Helpers
// =============================================================================
/**
 * Get the block explorer URL for a transaction hash
 */
export function getExplorerTxUrl(chainId, txHash) {
    const chain = SUPPORTED_CHAINS[chainId];
    const explorer = chain?.explorer ?? "https://etherscan.io";
    return `${explorer}/tx/${txHash}`;
}
/**
 * Get the block explorer URL for an address
 */
export function getExplorerAddressUrl(chainId, address) {
    const chain = SUPPORTED_CHAINS[chainId];
    const explorer = chain?.explorer ?? "https://etherscan.io";
    return `${explorer}/address/${address}`;
}
/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId) {
    return chainId in SUPPORTED_CHAINS;
}
/**
 * Get chain name by ID, or "Unknown" if not supported
 */
export function getChainName(chainId) {
    const chain = SUPPORTED_CHAINS[chainId];
    return chain?.name ?? "Unknown";
}
// =============================================================================
// Utility Functions
// =============================================================================
// Utility: generate intent ID
export function generateIntentId() {
    return `int_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
// Utility: format amount for display
export function formatAmount(amount, token) {
    return `${amount} ${token}`;
}
