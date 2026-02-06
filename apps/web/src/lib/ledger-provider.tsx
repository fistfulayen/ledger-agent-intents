import {
	DeviceActionStatus,
	type DeviceManagementKit,
	DeviceManagementKitBuilder,
	type DeviceSessionId,
	DeviceStatus,
	type DiscoveredDevice,
	UserInteractionRequired,
	hexaStringToBuffer,
} from "@ledgerhq/device-management-kit";
import {
	type Signature as EthSignature,
	SignerEthBuilder,
	type TypedData,
} from "@ledgerhq/device-signer-kit-ethereum";
import { webBleIdentifier, webBleTransportFactory } from "@ledgerhq/device-transport-kit-web-ble";
import { webHidIdentifier, webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import {
	http,
	type Chain,
	type TransactionSerializable,
	createPublicClient,
	serializeTransaction,
} from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";

// =============================================================================
// Types
// =============================================================================

export type TransportType = "usb" | "ble";

interface TransactionRequest {
	to: string;
	data: string;
	value?: string;
}

export type DeviceActionUiState = {
	status:
		| "connecting"
		| "unlock-device"
		| "allow-secure-connection"
		| "open-app"
		| "confirm-open-app"
		| "sign-transaction"
		| "sign-message"
		| "sign-typed-data"
		| "verify-address"
		| "success"
		| "error"
		| "deriving-address";
	message: string;
	error?: Error;
};

interface LedgerContextType {
	account: string | null;
	chainId: number | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: Error | null;
	connect: (transport?: TransportType) => Promise<void>;
	disconnect: () => void;
	sendTransaction: (tx: TransactionRequest) => Promise<string>;
	signTypedDataV4: (typedData: unknown) => Promise<string>;
	personalSign: (message: string) => Promise<string>;
	openLedgerModal: () => void;
	deviceActionState: DeviceActionUiState | null;
	setShowConnectDialog: (show: boolean) => void;
	showConnectDialog: boolean;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

// =============================================================================
// DMK Singleton (persists across HMR)
// =============================================================================

let dmkInstance: DeviceManagementKit | null = null;

/** Ledger API key used as the origin token for clear-signing support. */
const LEDGER_API_KEY: string = import.meta.env.VITE_LEDGER_API_KEY ?? "";

function getDmk(): DeviceManagementKit {
	if (!dmkInstance) {
		const builder = new DeviceManagementKitBuilder();
		builder.addTransport(webHidTransportFactory).addTransport(webBleTransportFactory);
		dmkInstance = builder.build();
	}
	return dmkInstance;
}

// =============================================================================
// Chain configuration
// =============================================================================

const CHAIN_MAP: Record<number, Chain> = {
	8453: base,
	84532: baseSepolia,
	11155111: sepolia,
};

// Default chain: Base mainnet
const DEFAULT_CHAIN_ID = 8453;

function getChain(chainId: number): Chain {
	return CHAIN_MAP[chainId] ?? base;
}

function getRpcUrl(chainId: number): string {
	// Use custom RPC URL for Base mainnet if configured
	if (chainId === 8453) {
		const customRpc = import.meta.env.VITE_BASE_MAINNET_RPC_URL;
		if (typeof customRpc === "string" && customRpc.trim().length > 0) {
			return customRpc.trim();
		}
	}
	const chain = getChain(chainId);
	return chain.rpcUrls.default.http[0] ?? "https://mainnet.base.org";
}

// Default derivation path (Ledger Live)
const DEFAULT_DERIVATION_PATH = "44'/60'/0'/0/0";

// =============================================================================
// Helper: convert Signature to hex
// =============================================================================

function signatureToHex(sig: EthSignature): string {
	// r and s are HexaStrings (0x-prefixed), v is a number
	const r = sig.r.startsWith("0x") ? sig.r.slice(2) : sig.r;
	const s = sig.s.startsWith("0x") ? sig.s.slice(2) : sig.s;
	const v = sig.v.toString(16).padStart(2, "0");
	return `0x${r}${s}${v}`;
}

// =============================================================================
// Provider Component
// =============================================================================

export function LedgerProvider({ children }: { children: ReactNode }) {
	const [account, setAccount] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(DEFAULT_CHAIN_ID);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [deviceActionState, setDeviceActionState] = useState<DeviceActionUiState | null>(null);
	const [showConnectDialog, setShowConnectDialog] = useState(false);

	const sessionIdRef = useRef<DeviceSessionId | null>(null);
	const derivationPathRef = useRef<string>(DEFAULT_DERIVATION_PATH);
	const deviceSessionSubRef = useRef<{ unsubscribe: () => void } | null>(null);

	// -----------------------------------------------------------------------
	// Cleanup on unmount
	// -----------------------------------------------------------------------
	useEffect(() => {
		return () => {
			deviceSessionSubRef.current?.unsubscribe();
		};
	}, []);

	// -----------------------------------------------------------------------
	// Monitor device session state for disconnection
	// -----------------------------------------------------------------------
	const monitorSession = useCallback((sessionId: DeviceSessionId) => {
		const dmk = getDmk();
		deviceSessionSubRef.current?.unsubscribe();

		const subscription = dmk.getDeviceSessionState({ sessionId }).subscribe({
			next: (state) => {
				if (state.deviceStatus === DeviceStatus.NOT_CONNECTED) {
					setAccount(null);
					sessionIdRef.current = null;
					setDeviceActionState({
						status: "error",
						message: "Device disconnected",
						error: new Error("Device disconnected"),
					});
					// Auto-dismiss the error after 3 seconds
					setTimeout(() => setDeviceActionState(null), 3000);
				}
			},
			error: () => {
				// Session gone
				setAccount(null);
				sessionIdRef.current = null;
			},
		});

		deviceSessionSubRef.current = subscription;
	}, []);

	// -----------------------------------------------------------------------
	// Connect
	// -----------------------------------------------------------------------
	const connect = useCallback(
		async (transport: TransportType = "usb") => {
			setIsConnecting(true);
			setError(null);
			setDeviceActionState({
				status: "connecting",
				message:
					transport === "ble"
						? "Searching for Bluetooth devices..."
						: "Searching for USB devices...",
			});

			try {
				const dmk = getDmk();

				// Check environment support
				if (!dmk.isEnvironmentSupported()) {
					throw new Error(
						"Your browser does not support WebHID or WebBLE. Please use a compatible browser like Chrome.",
					);
				}

				const transportIdentifier = transport === "usb" ? webHidIdentifier : webBleIdentifier;

				// Start discovery and grab the first device
				const device: DiscoveredDevice = await firstValueFrom(
					dmk.startDiscovering({ transport: transportIdentifier }),
				);
				await dmk.stopDiscovering();

				// Connect to device
				setDeviceActionState({
					status: "connecting",
					message: "Connecting to your Ledger...",
				});

				const sessionId = await dmk.connect({
					device,
					sessionRefresherOptions: {
						isRefresherDisabled: true,
					},
				});

				sessionIdRef.current = sessionId;

				// Wait for device session to be ready
				setDeviceActionState({
					status: "deriving-address",
					message: "Deriving your address...",
				});

				// Build the Ethereum signer
				const ethSigner = new SignerEthBuilder({
					dmk,
					sessionId,
					originToken: LEDGER_API_KEY,
				}).build();

				// Get address from device
				const { observable: addressObservable } = ethSigner.getAddress(derivationPathRef.current, {
					checkOnDevice: false,
				});

				const addressState = await firstValueFrom(
					addressObservable.pipe(
						filter(
							(state) =>
								state.status === DeviceActionStatus.Completed ||
								state.status === DeviceActionStatus.Error,
						),
					),
				);

				if (addressState.status === DeviceActionStatus.Error) {
					throw new Error(`Failed to derive address: ${String(addressState.error)}`);
				}

				if (addressState.status === DeviceActionStatus.Completed) {
					const address = addressState.output.address;
					setAccount(address);
				}

				// Start monitoring the session for disconnects
				monitorSession(sessionId);

				setDeviceActionState({
					status: "success",
					message: "Connected successfully",
				});

				// Auto-dismiss success state
				setTimeout(() => setDeviceActionState(null), 1500);
				setShowConnectDialog(false);
			} catch (err) {
				const errorObj = err instanceof Error ? err : new Error("Connection failed");
				setError(errorObj);
				setDeviceActionState({
					status: "error",
					message: errorObj.message,
					error: errorObj,
				});
			} finally {
				setIsConnecting(false);
				// Make sure discovery is stopped
				try {
					getDmk().stopDiscovering();
				} catch {
					// Ignore if already stopped
				}
			}
		},
		[monitorSession],
	);

	// -----------------------------------------------------------------------
	// Disconnect
	// -----------------------------------------------------------------------
	const disconnect = useCallback(() => {
		const sessionId = sessionIdRef.current;
		if (sessionId) {
			try {
				getDmk().disconnect({ sessionId });
			} catch {
				// Ignore disconnect errors
			}
		}
		deviceSessionSubRef.current?.unsubscribe();
		deviceSessionSubRef.current = null;
		sessionIdRef.current = null;
		setAccount(null);
		setError(null);
		setDeviceActionState(null);
	}, []);

	// -----------------------------------------------------------------------
	// Ensure we have a connected session for signing operations
	// -----------------------------------------------------------------------
	const ensureSession = useCallback((): {
		dmk: DeviceManagementKit;
		sessionId: DeviceSessionId;
	} => {
		const sessionId = sessionIdRef.current;
		if (!sessionId) {
			throw new Error("No device connected. Please connect your Ledger first.");
		}
		return { dmk: getDmk(), sessionId };
	}, []);

	// -----------------------------------------------------------------------
	// Helper: observe a device action and update UI state
	// -----------------------------------------------------------------------
	const observeDeviceAction = useCallback(
		<T,>(
			observable: import("rxjs").Observable<
				import("@ledgerhq/device-management-kit").DeviceActionState<
					T,
					// biome-ignore lint/suspicious/noExplicitAny: DMK error types are complex union types
					any,
					{ requiredUserInteraction: string; [key: string]: unknown }
				>
			>,
			operationLabel: string,
		): Promise<T> => {
			return new Promise<T>((resolve, reject) => {
				const subscription = observable.subscribe({
					next: (state) => {
						switch (state.status) {
							case DeviceActionStatus.Pending: {
								const interaction = state.intermediateValue?.requiredUserInteraction;
								switch (interaction) {
									case UserInteractionRequired.UnlockDevice:
										setDeviceActionState({
											status: "unlock-device",
											message: "Please unlock your Ledger device",
										});
										break;
									case UserInteractionRequired.AllowSecureConnection:
										setDeviceActionState({
											status: "allow-secure-connection",
											message: "Please allow the secure connection on your device",
										});
										break;
									case UserInteractionRequired.ConfirmOpenApp:
										setDeviceActionState({
											status: "confirm-open-app",
											message: "Please confirm opening the Ethereum app on your device",
										});
										break;
									case UserInteractionRequired.SignTransaction:
										setDeviceActionState({
											status: "sign-transaction",
											message: `Review and confirm the ${operationLabel} on your device`,
										});
										break;
									case UserInteractionRequired.SignPersonalMessage:
										setDeviceActionState({
											status: "sign-message",
											message: "Review and sign the message on your device",
										});
										break;
									case UserInteractionRequired.SignTypedData:
										setDeviceActionState({
											status: "sign-typed-data",
											message: "Review and sign the data on your device",
										});
										break;
									case UserInteractionRequired.VerifyAddress:
										setDeviceActionState({
											status: "verify-address",
											message: "Verify the address on your device",
										});
										break;
									case UserInteractionRequired.None:
										// No user interaction needed, keep current state
										break;
									default:
										setDeviceActionState({
											status: "open-app",
											message: `Please check your device... (${interaction})`,
										});
										break;
								}
								break;
							}
							case DeviceActionStatus.Completed:
								setDeviceActionState({
									status: "success",
									message: `${operationLabel} confirmed`,
								});
								setTimeout(() => setDeviceActionState(null), 1500);
								subscription.unsubscribe();
								resolve(state.output);
								break;
							case DeviceActionStatus.Error: {
								const errMsg = String(state.error);
								const isUserRejection =
									errMsg.includes("6985") ||
									errMsg.toLowerCase().includes("reject") ||
									errMsg.toLowerCase().includes("denied");
								const isBlindSigning = errMsg.includes("6a80");

								let userMessage: string;
								if (isUserRejection) {
									userMessage = "Transaction rejected on device";
								} else if (isBlindSigning) {
									userMessage =
										"Blind signing is disabled. Enable it in the Ethereum app settings on your device.";
								} else {
									userMessage = `${operationLabel} failed: ${errMsg}`;
								}

								const errorObj = new Error(userMessage);
								setDeviceActionState({
									status: "error",
									message: userMessage,
									error: errorObj,
								});
								subscription.unsubscribe();
								reject(errorObj);
								break;
							}
							case DeviceActionStatus.Stopped:
								subscription.unsubscribe();
								reject(new Error(`${operationLabel} was cancelled`));
								break;
						}
					},
					error: (err) => {
						const errorObj = err instanceof Error ? err : new Error(`${operationLabel} failed`);
						setDeviceActionState({
							status: "error",
							message: errorObj.message,
							error: errorObj,
						});
						reject(errorObj);
					},
				});
			});
		},
		[],
	);

	// -----------------------------------------------------------------------
	// sendTransaction: sign + broadcast via RPC
	// -----------------------------------------------------------------------
	const sendTransaction = useCallback(
		async (tx: TransactionRequest): Promise<string> => {
			const { dmk, sessionId } = ensureSession();
			const currentChainId = chainId ?? DEFAULT_CHAIN_ID;
			const chain = getChain(currentChainId);
			const rpcUrl = getRpcUrl(currentChainId);

			setDeviceActionState({
				status: "open-app",
				message: "Preparing transaction...",
			});

			try {
				const publicClient = createPublicClient({
					chain,
					transport: http(rpcUrl),
				});

				const senderAddress = account as `0x${string}`;

				// Get nonce and gas estimates
				const [nonce, gasPrice, estimatedGas] = await Promise.all([
					publicClient.getTransactionCount({ address: senderAddress }),
					publicClient.getGasPrice(),
					publicClient.estimateGas({
						account: senderAddress,
						to: tx.to as `0x${string}`,
						data: tx.data as `0x${string}`,
						value: tx.value ? BigInt(tx.value) : 0n,
					}),
				]);

				// Build the unsigned transaction
				const unsignedTx: TransactionSerializable = {
					to: tx.to as `0x${string}`,
					data: tx.data as `0x${string}`,
					value: tx.value ? BigInt(tx.value) : 0n,
					nonce,
					gas: estimatedGas + (estimatedGas * 20n) / 100n, // 20% buffer
					gasPrice,
					chainId: currentChainId,
					type: "legacy" as const,
				};

				// Serialize to raw bytes for the device
				const serializedTx = serializeTransaction(unsignedTx);
				const txBytes = hexaStringToBuffer(serializedTx);
				if (!txBytes) {
					throw new Error("Failed to serialize transaction");
				}

				// Build signer
				const ethSigner = new SignerEthBuilder({
					dmk,
					sessionId,
					originToken: LEDGER_API_KEY,
				}).build();

				// Sign transaction on device
				const { observable: signObservable } = ethSigner.signTransaction(
					derivationPathRef.current,
					txBytes,
					{ skipOpenApp: false },
				);

				const signature = await observeDeviceAction(signObservable, "Transaction");

				// Reconstruct signed transaction
				const r = signature.r.startsWith("0x") ? signature.r : `0x${signature.r}`;
				const s = signature.s.startsWith("0x") ? signature.s : `0x${signature.s}`;

				const signedTx = serializeTransaction(unsignedTx, {
					r: r as `0x${string}`,
					s: s as `0x${string}`,
					v: BigInt(signature.v),
				});

				// Broadcast via RPC
				setDeviceActionState({
					status: "success",
					message: "Broadcasting transaction...",
				});

				const txHash = await publicClient.sendRawTransaction({
					serializedTransaction: signedTx,
				});

				setDeviceActionState({
					status: "success",
					message: "Transaction broadcast successfully",
				});
				setTimeout(() => setDeviceActionState(null), 2000);

				return txHash;
			} catch (err) {
				const errorObj = err instanceof Error ? err : new Error("Transaction failed");
				// Don't override device action state if it was already set by observeDeviceAction
				if (!deviceActionState || deviceActionState.status !== "error") {
					setDeviceActionState({
						status: "error",
						message: errorObj.message,
						error: errorObj,
					});
				}
				throw errorObj;
			}
		},
		[account, chainId, ensureSession, observeDeviceAction, deviceActionState],
	);

	// -----------------------------------------------------------------------
	// signTypedDataV4: sign EIP-712 typed data
	// -----------------------------------------------------------------------
	const signTypedDataV4 = useCallback(
		async (typedData: unknown): Promise<string> => {
			const { dmk, sessionId } = ensureSession();

			setDeviceActionState({
				status: "open-app",
				message: "Preparing to sign typed data...",
			});

			try {
				// Parse the typed data if it's a string
				const parsed: TypedData =
					typeof typedData === "string" ? JSON.parse(typedData) : (typedData as TypedData);

				// Build signer
				const ethSigner = new SignerEthBuilder({
					dmk,
					sessionId,
					originToken: LEDGER_API_KEY,
				}).build();

				// Sign typed data on device
				const { observable: signObservable } = ethSigner.signTypedData(
					derivationPathRef.current,
					parsed,
					{ skipOpenApp: false },
				);

				const signature = await observeDeviceAction(signObservable, "Typed data signing");

				return signatureToHex(signature);
			} catch (err) {
				const errorObj = err instanceof Error ? err : new Error("Typed data signing failed");
				if (!deviceActionState || deviceActionState.status !== "error") {
					setDeviceActionState({
						status: "error",
						message: errorObj.message,
						error: errorObj,
					});
				}
				throw errorObj;
			}
		},
		[ensureSession, observeDeviceAction, deviceActionState],
	);

	// -----------------------------------------------------------------------
	// personalSign: sign a personal message (EIP-191)
	// -----------------------------------------------------------------------
	const personalSign = useCallback(
		async (message: string): Promise<string> => {
			const { dmk, sessionId } = ensureSession();

			setDeviceActionState({
				status: "open-app",
				message: "Preparing to sign message...",
			});

			try {
				// Build signer
				const ethSigner = new SignerEthBuilder({
					dmk,
					sessionId,
					originToken: LEDGER_API_KEY,
				}).build();

				// Sign personal message on device
				const { observable: signObservable } = ethSigner.signMessage(
					derivationPathRef.current,
					message,
					{ skipOpenApp: false },
				);

				const signature = await observeDeviceAction(signObservable, "Message signing");

				return signatureToHex(signature);
			} catch (err) {
				const errorObj = err instanceof Error ? err : new Error("Message signing failed");
				if (!deviceActionState || deviceActionState.status !== "error") {
					setDeviceActionState({
						status: "error",
						message: errorObj.message,
						error: errorObj,
					});
				}
				throw errorObj;
			}
		},
		[ensureSession, observeDeviceAction, deviceActionState],
	);

	// -----------------------------------------------------------------------
	// openLedgerModal: show the connect dialog
	// -----------------------------------------------------------------------
	const openLedgerModal = useCallback(() => {
		setShowConnectDialog(true);
	}, []);

	// -----------------------------------------------------------------------
	// Context value
	// -----------------------------------------------------------------------
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
			personalSign,
			openLedgerModal,
			deviceActionState,
			setShowConnectDialog,
			showConnectDialog,
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
			personalSign,
			openLedgerModal,
			deviceActionState,
			showConnectDialog,
		],
	);

	return <LedgerContext.Provider value={contextValue}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
	const ctx = useContext(LedgerContext);
	if (!ctx) {
		throw new Error("useLedger must be used within LedgerProvider");
	}
	return ctx;
}
