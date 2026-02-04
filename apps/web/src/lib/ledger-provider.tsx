"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import type { EIP6963ProviderDetail } from "@ledgerhq/ledger-wallet-provider";

interface TransactionRequest {
	to: string;
	data: string;
	value?: string;
}

interface LedgerContextType {
	account: string | null;
	chainId: number | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: Error | null;
	connect: () => Promise<void>;
	disconnect: () => void;
	sendTransaction: (tx: TransactionRequest) => Promise<string>;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
	const [provider, setProvider] = useState<EIP6963ProviderDetail | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Initialize Ledger Button Provider
	useEffect(() => {
		if (typeof window === "undefined") return;

		let ledgerCleanup: (() => void) | undefined;

		// Set up provider listener BEFORE initializing - the Ledger Button
		// dispatches announceProvider immediately during initialization
		const handleProvider = (e: Event) => {
			const detail = (e as CustomEvent<EIP6963ProviderDetail>).detail;
			if (detail.info.name.toLowerCase().includes("ledger")) {
				setProvider(detail);
			}
		};

		window.addEventListener("eip6963:announceProvider", handleProvider);

		const initProvider = async () => {
			try {
				const { initializeLedgerProvider } = await import(
					"@ledgerhq/ledger-wallet-provider"
				);

				ledgerCleanup = initializeLedgerProvider({
					target: document.body,
					floatingButtonPosition: "bottom-right",
					dAppIdentifier: "agent-intents",
					apiKey: import.meta.env.VITE_LEDGER_API_KEY || "demo",
					loggerLevel: "info",
				});
			} catch (err) {
				console.error("Failed to initialize Ledger provider:", err);
			}
		};

		initProvider();

		return () => {
			window.removeEventListener("eip6963:announceProvider", handleProvider);
			ledgerCleanup?.();
		};
	}, []);

	// Listen for account/chain changes
	useEffect(() => {
		if (!provider?.provider.on) return;

		const handleAccountsChanged = (accounts: unknown) => {
			const accts = accounts as string[];
			setAccount(accts[0] || null);
		};

		const handleChainChanged = (chainIdHex: unknown) => {
			setChainId(Number.parseInt(chainIdHex as string, 16));
		};

		provider.provider.on("accountsChanged", handleAccountsChanged);
		provider.provider.on("chainChanged", handleChainChanged);

		return () => {
			provider.provider.removeListener?.(
				"accountsChanged",
				handleAccountsChanged,
			);
			provider.provider.removeListener?.("chainChanged", handleChainChanged);
		};
	}, [provider]);

	const connect = useCallback(async () => {
		if (!provider) {
			setError(new Error("Click the Ledger button to connect"));
			return;
		}

		setIsConnecting(true);
		setError(null);

		try {
			const accounts = (await provider.provider.request({
				method: "eth_requestAccounts",
				params: [],
			})) as string[];

		if (accounts.length > 0 && accounts[0]) {
			setAccount(accounts[0]);
		}

			const chain = (await provider.provider.request({
				method: "eth_chainId",
				params: [],
			})) as string;
			setChainId(Number.parseInt(chain, 16));
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Connection failed");
			setError(error);
			throw error;
		} finally {
			setIsConnecting(false);
		}
	}, [provider]);

	const disconnect = useCallback(() => {
		setAccount(null);
		setChainId(null);
		setError(null);
	}, []);

	const sendTransaction = useCallback(
		async (tx: TransactionRequest): Promise<string> => {
			if (!provider) throw new Error("No provider available");
			if (!account) throw new Error("Not connected");

			const txHash = (await provider.provider.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: account,
						to: tx.to,
						data: tx.data,
						value: tx.value || "0x0",
					},
				],
			})) as string;

			return txHash;
		},
		[provider, account],
	);

	return (
		<LedgerContext.Provider
			value={{
				account,
				chainId,
				isConnected: !!account,
				isConnecting,
				error,
				connect,
				disconnect,
				sendTransaction,
			}}
		>
			{children}
		</LedgerContext.Provider>
	);
}

export function useLedger() {
	const ctx = useContext(LedgerContext);
	if (!ctx) {
		throw new Error("useLedger must be used within LedgerProvider");
	}
	return ctx;
}
