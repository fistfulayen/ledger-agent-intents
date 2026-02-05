"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef,
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
	signTypedDataV4: (typedData: unknown) => Promise<string>;
	openLedgerModal: () => void;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

// Module-level singleton to prevent re-initialization during HMR
let ledgerInitialized = false;
let ledgerCleanupFn: (() => void) | undefined;
let ledgerAppReady = false;

export function LedgerProvider({ children }: { children: ReactNode }) {
	const [provider, setProvider] = useState<EIP6963ProviderDetail | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Track the provider UUID to avoid re-setting state for the same provider
	const providerUuidRef = useRef<string | null>(null);

	const useStubDAppConfig =
		import.meta.env.VITE_LEDGER_STUB_DAPP_CONFIG === "true";

	// Initialize Ledger Button Provider
	useEffect(() => {
		if (typeof window === "undefined") return;

		// #region agent log
		fetch("http://127.0.0.1:7243/ingest/26dc3cf1-6d06-4e25-9781-0ae890b55d1f", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				sessionId: "debug-session",
				runId: "prod-repro",
				hypothesisId: "H2",
				location: "src/lib/ledger-provider.tsx:init",
				message: "ledger provider effect start",
				data: {
					useStubDAppConfig,
					hasApiKey: (import.meta.env.VITE_LEDGER_API_KEY || "").length > 0,
					hasBaseRpcOverride:
						typeof import.meta.env.VITE_BASE_MAINNET_RPC_URL === "string" &&
						import.meta.env.VITE_BASE_MAINNET_RPC_URL.trim().length > 0,
				},
				timestamp: Date.now(),
			}),
		}).catch(() => {});
		// #endregion agent log

		// Set up provider listener - this needs to run on every mount
		// to update React state when provider announces itself
		const handleProvider = (e: Event) => {
			const detail = (e as CustomEvent<EIP6963ProviderDetail>).detail;
			if (detail.info.name.toLowerCase().includes("ledger")) {
				// Only update state if this is a different provider (by UUID)
				// This prevents re-renders from repeated announcements
				if (providerUuidRef.current !== detail.info.uuid) {
					providerUuidRef.current = detail.info.uuid;
					// #region agent log
					fetch(
						"http://127.0.0.1:7243/ingest/26dc3cf1-6d06-4e25-9781-0ae890b55d1f",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								sessionId: "debug-session",
								runId: "prod-repro",
								hypothesisId: "H2",
								location: "src/lib/ledger-provider.tsx:announceProvider",
								message: "ledger provider announced",
								data: {
									name: detail.info.name,
									uuid: detail.info.uuid,
									rdns: detail.info.rdns,
								},
								timestamp: Date.now(),
							}),
						},
					).catch(() => {});
					// #endregion agent log
					setProvider(detail);
				}
			}
		};

		window.addEventListener("eip6963:announceProvider", handleProvider);

		// Only initialize the Ledger button once (survives HMR)
		if (!ledgerInitialized) {
			ledgerInitialized = true;

			const initProvider = async () => {
				try {
					const { initializeLedgerProvider } = await import(
						"@ledgerhq/ledger-wallet-provider"
					);

					ledgerCleanupFn = initializeLedgerProvider({
						target: document.body,
						floatingButtonPosition: false,
						dAppIdentifier: "multisig",
						apiKey: import.meta.env.VITE_LEDGER_API_KEY || "",
						// IMPORTANT: do not pass `undefined` values (can cause runtime errors in downstream code)
						// Base mainnet override for fee estimation / nonce / etc.
						rpcUrls: (() => {
							const out: Record<string, string> = {};
							const baseMainnet = import.meta.env.VITE_BASE_MAINNET_RPC_URL;
							if (typeof baseMainnet === "string" && baseMainnet.trim().length > 0) {
								out["8453"] = baseMainnet.trim();
							}
							return out;
						})(),
						loggerLevel: "info",
						devConfig: useStubDAppConfig
							? {
									stub: {
										dAppConfig: true,
									},
								}
							: undefined,
					});
					// Mark the app as ready after a short delay to allow it to mount
					setTimeout(() => {
						ledgerAppReady = true;
					}, 100);
				} catch (err) {
					console.error("Failed to initialize Ledger provider:", err);
					ledgerInitialized = false; // Allow retry on error
				}
			};

			initProvider();
		}

		return () => {
			window.removeEventListener("eip6963:announceProvider", handleProvider);
			// Don't cleanup the Ledger button on unmount - it should persist
			// across HMR and React Strict Mode double-mounting.
			// The button will be cleaned up when the page is unloaded.
		};
	}, [useStubDAppConfig]);

	// #region agent log
	// Track last RPC request to correlate with crashes.
	useEffect(() => {
		if (!provider) return;
		const anyWindow = window as unknown as { __lastLedgerRpc?: unknown };

		const req = provider.provider.request?.bind(provider.provider);
		if (!req) return;

		provider.provider.request = async (args: unknown) => {
			try {
				const a = args as { method?: unknown; params?: unknown };
				const method = typeof a?.method === "string" ? a.method : "unknown";
				const params = a?.params as unknown;
				anyWindow.__lastLedgerRpc = {
					method,
					paramsType: Array.isArray(params) ? "array" : params === undefined ? "undefined" : typeof params,
				};

				// Only log a few high-signal methods to avoid spam.
				if (
					method === "eth_requestAccounts" ||
					method === "eth_chainId" ||
					method === "eth_accounts" ||
					method === "wallet_switchEthereumChain"
				) {
					fetch("http://127.0.0.1:7243/ingest/26dc3cf1-6d06-4e25-9781-0ae890b55d1f", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							sessionId: "debug-session",
							runId: "prod-repro",
							hypothesisId: "H3",
							location: "src/lib/ledger-provider.tsx:request",
							message: "provider.request",
							data: {
								method,
								paramsType: anyWindow.__lastLedgerRpc,
							},
							timestamp: Date.now(),
						}),
					}).catch(() => {});
				}

				return await req(args as never);
			} catch (e) {
				fetch("http://127.0.0.1:7243/ingest/26dc3cf1-6d06-4e25-9781-0ae890b55d1f", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						sessionId: "debug-session",
						runId: "prod-repro",
						hypothesisId: "H3",
						location: "src/lib/ledger-provider.tsx:request.catch",
						message: "provider.request threw",
						data: {
							error: e instanceof Error ? e.message : String(e).slice(0, 300),
						},
						timestamp: Date.now(),
					}),
				}).catch(() => {});
				throw e;
			}
		};
	}, [provider]);
	// #endregion agent log

	// Listen for account/chain changes
	useEffect(() => {
		if (!provider?.provider.on) return;

		const handleAccountsChanged = (accounts: unknown) => {
			// #region agent log
			fetch("http://127.0.0.1:7243/ingest/26dc3cf1-6d06-4e25-9781-0ae890b55d1f", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sessionId: "debug-session",
					runId: "prod-repro",
					hypothesisId: "H3",
					location: "src/lib/ledger-provider.tsx:accountsChanged",
					message: "accountsChanged event",
					data: {
						isArray: Array.isArray(accounts),
						first: Array.isArray(accounts) ? (accounts[0] as unknown) : undefined,
					},
					timestamp: Date.now(),
				}),
			}).catch(() => {});
			// #endregion agent log

			if (!Array.isArray(accounts)) {
				setAccount(null);
				return;
			}
			setAccount((accounts[0] as string | undefined) || null);
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
			const accountsRaw = await provider.provider.request({
				method: "eth_requestAccounts",
				params: [],
			});

			const accounts = Array.isArray(accountsRaw) ? (accountsRaw as string[]) : [];

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

	const openLedgerModal = useCallback(() => {
		const tryOpenModal = () => {
			// Find the ledger-button-app element and call its navigationIntent method directly
			const app = document.querySelector("ledger-button-app") as HTMLElement & {
				navigationIntent?: (intent: string, params?: unknown, mode?: string) => void;
			};

			if (app?.navigationIntent) {
				app.navigationIntent("selectAccount", undefined, "panel");
				return true;
			}
			return false;
		};

		// Try immediately
		if (tryOpenModal()) {
			return;
		}

		// If app not ready yet, retry after a short delay
		if (!ledgerAppReady) {
			const retryInterval = setInterval(() => {
				if (tryOpenModal()) {
					clearInterval(retryInterval);
				}
			}, 100);

			// Stop retrying after 3 seconds
			setTimeout(() => {
				clearInterval(retryInterval);
				console.warn("Ledger modal could not be opened - app not ready");
			}, 3000);
		}
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

	const signTypedDataV4 = useCallback(
		async (typedData: unknown): Promise<string> => {
			if (!provider) throw new Error("No provider available");
			if (!account) throw new Error("Not connected");

			const signature = (await provider.provider.request({
				method: "eth_signTypedData_v4",
				params: [account, JSON.stringify(typedData)],
			})) as string;

			return signature;
		},
		[provider, account],
	);

	// Memoize the context value to prevent unnecessary re-renders of consumers
	const contextValue = useMemo(
		() => ({
			account,
			chainId,
			isConnected: !!account,
			isConnecting,
			error,
			connect,
			disconnect,
			sendTransaction,
			signTypedDataV4,
			openLedgerModal,
		}),
		[
			account,
			chainId,
			isConnecting,
			error,
			connect,
			disconnect,
			sendTransaction,
			signTypedDataV4,
			openLedgerModal,
		],
	);

	return (
		<LedgerContext.Provider value={contextValue}>
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
