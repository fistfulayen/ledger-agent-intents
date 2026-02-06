import { type TransportType, useLedger } from "@/lib/ledger-provider";
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@ledgerhq/lumen-ui-react";
import { useState } from "react";

// =============================================================================
// Icons
// =============================================================================

function UsbIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			stroke="currentColor"
			strokeWidth="1.5"
			role="img"
			aria-label="USB"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 3v12m0 0l-3-3m3 3l3-3M6 18a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4zM6 16V9m12 7V9M6 9l6-6 6 6"
			/>
		</svg>
	);
}

function BluetoothIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			stroke="currentColor"
			strokeWidth="1.5"
			role="img"
			aria-label="Bluetooth"
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
		</svg>
	);
}

// =============================================================================
// Component
// =============================================================================

export function ConnectDeviceDialog() {
	const {
		showConnectDialog,
		setShowConnectDialog,
		connect,
		disconnect,
		isConnected,
		isConnecting,
		account,
	} = useLedger();

	const [selectedTransport, setSelectedTransport] = useState<TransportType>("usb");

	const handleConnect = async () => {
		await connect(selectedTransport);
	};

	const handleDisconnect = () => {
		disconnect();
	};

	return (
		<Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
			<DialogContent>
				<DialogHeader
					appearance="compact"
					title={isConnected ? "Connected Device" : "Connect Ledger"}
					onClose={() => setShowConnectDialog(false)}
				/>
				<DialogBody>
					{isConnected ? (
						// Connected state
						<div className="flex flex-col gap-16 py-16">
							<div className="flex items-center gap-12 rounded-md bg-surface p-16">
								<div className="flex size-40 items-center justify-center rounded-sm bg-success/10">
									<svg
										className="size-24 text-success"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										role="img"
										aria-label="Connected"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div className="flex flex-col gap-2">
									<span className="body-2-semi-bold text-base">Ledger Connected</span>
									<span className="body-3 text-muted font-mono">
										{account?.slice(0, 6)}...{account?.slice(-4)}
									</span>
								</div>
							</div>

							<Button appearance="transparent" size="md" onClick={handleDisconnect}>
								Disconnect
							</Button>
						</div>
					) : (
						// Not connected state
						<div className="flex flex-col gap-24 py-16">
							<p className="body-2 text-muted">Choose how to connect your Ledger device.</p>

							{/* Transport selection */}
							<div className="flex flex-col gap-12">
								<button
									type="button"
									onClick={() => setSelectedTransport("usb")}
									className={`flex items-center gap-16 rounded-md p-16 transition-colors ${
										selectedTransport === "usb"
											? "bg-interactive/10 border-2 border-interactive"
											: "bg-surface border-2 border-transparent hover:bg-surface-hover"
									}`}
								>
									<div className="flex size-40 items-center justify-center rounded-sm bg-muted-transparent">
										<UsbIcon className="size-24" />
									</div>
									<div className="flex flex-col items-start gap-2">
										<span className="body-2-semi-bold text-base">USB</span>
										<span className="body-3 text-muted">Connect via USB cable</span>
									</div>
								</button>

								<button
									type="button"
									onClick={() => setSelectedTransport("ble")}
									className={`flex items-center gap-16 rounded-md p-16 transition-colors ${
										selectedTransport === "ble"
											? "bg-interactive/10 border-2 border-interactive"
											: "bg-surface border-2 border-transparent hover:bg-surface-hover"
									}`}
								>
									<div className="flex size-40 items-center justify-center rounded-sm bg-muted-transparent">
										<BluetoothIcon className="size-24" />
									</div>
									<div className="flex flex-col items-start gap-2">
										<span className="body-2-semi-bold text-base">Bluetooth</span>
										<span className="body-3 text-muted">Connect wirelessly via Bluetooth</span>
									</div>
								</button>
							</div>

							<div className="rounded-sm bg-muted-transparent p-12">
								<p className="body-3 text-muted">
									{selectedTransport === "usb"
										? "Make sure your Ledger device is connected via USB and unlocked."
										: "Make sure your Ledger device has Bluetooth enabled and is unlocked."}
								</p>
							</div>
						</div>
					)}
				</DialogBody>
				{!isConnected && (
					<DialogFooter>
						<div className="flex gap-12 w-full">
							<Button
								appearance="transparent"
								size="md"
								onClick={() => setShowConnectDialog(false)}
								disabled={isConnecting}
							>
								Cancel
							</Button>
							<div className="flex-1">
								<Button
									appearance="accent"
									size="md"
									onClick={handleConnect}
									disabled={isConnecting}
									className="w-full"
								>
									{isConnecting ? "Connecting..." : "Connect"}
								</Button>
							</div>
						</div>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
