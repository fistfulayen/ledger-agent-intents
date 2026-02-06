import { useLedger } from "@/lib/ledger-provider";
import { Button, Dialog, DialogBody, DialogContent, DialogHeader } from "@ledgerhq/lumen-ui-react";

// =============================================================================
// Icons
// =============================================================================

function LedgerLogoIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Ledger"
		>
			<path
				d="M3 14.4V21h6.6v-1.2H4.2v-5.4H3ZM14.4 3H21v6.6h-1.2V4.2h-5.4V3ZM3 3h6.6v1.2H4.2v5.4H3V3Zm11.4 16.8V21H21v-6.6h-1.2v5.4h-5.4Z"
				fill="currentColor"
			/>
		</svg>
	);
}

function UsbIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="USB"
		>
			<path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07A1.993 1.993 0 0 0 8 7a2 2 0 0 0-4 0c0 .74.4 1.39 1 1.73V13a2 2 0 0 0 2 2h3v2.27c-.6.34-1 .99-1 1.73a2 2 0 0 0 4 0c0-.74-.4-1.39-1-1.73V15h3a2 2 0 0 0 2-2v-2h1V7h-3Z" />
		</svg>
	);
}

function BluetoothIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Bluetooth"
		>
			<path d="m17.71 7.71-5.12-5.12A.996.996 0 0 0 11 3.29v6.88L7.12 6.29 5.71 7.71 10.59 12l-4.88 4.29 1.41 1.41L11 13.83v6.88a.996.996 0 0 0 1.59.81l5.12-5.12a1 1 0 0 0 0-1.41L13.41 12l4.3-2.88a1 1 0 0 0 0-1.41ZM13 5.83l2.29 2.29L13 10.17V5.83Zm2.29 10.05L13 18.17v-4.34l2.29 2.05Z" />
		</svg>
	);
}

function ChevronRightIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			stroke="currentColor"
			strokeWidth="2"
			role="img"
			aria-label="Arrow"
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
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
		account,
		dismissDeviceAction,
	} = useLedger();

	const handleClose = () => {
		dismissDeviceAction();
		setShowConnectDialog(false);
	};

	return (
		<Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
			<DialogContent>
				{isConnected ? (
					<>
						<DialogHeader appearance="compact" title="Connected Device" onClose={handleClose} />
						<DialogBody>
							<div className="flex flex-col gap-16 py-16">
								<div className="flex items-center gap-12 rounded-md bg-surface p-16">
									<div className="flex size-40 items-center justify-center rounded-full bg-success/10">
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

								<Button
									appearance="transparent"
									size="md"
									onClick={() => {
										disconnect();
									}}
								>
									Disconnect
								</Button>
							</div>
						</DialogBody>
					</>
				) : (
					<>
						{/* Header with Ledger icon */}
						<div className="flex items-center justify-between p-16">
							<div className="flex items-center gap-12">
								<LedgerLogoIcon className="size-24 text-base" />
								<span className="heading-5 text-base">Connect a Ledger signer</span>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="flex size-32 items-center justify-center rounded-full hover:bg-muted-transparent transition-colors"
								aria-label="Close"
							>
								<svg
									className="size-20 text-muted"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									role="img"
									aria-label="Close"
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<DialogBody>
							<div className="flex flex-col gap-12">
								{/* USB option */}
								<button
									type="button"
									onClick={() => connect("usb")}
									className="flex items-center gap-16 rounded-lg bg-surface hover:bg-surface-hover p-16 transition-colors"
								>
									<div className="flex size-40 items-center justify-center rounded-full bg-base">
										<UsbIcon className="size-20 text-base" />
									</div>
									<div className="flex flex-col items-start gap-2 flex-1">
										<span className="body-1-semi-bold text-base">Connect with USB</span>
										<span className="body-2 text-muted">Plug in and unlock your device</span>
									</div>
									<ChevronRightIcon className="size-20 text-muted" />
								</button>

								{/* Bluetooth option */}
								<button
									type="button"
									onClick={() => connect("ble")}
									className="flex items-center gap-16 rounded-lg bg-surface hover:bg-surface-hover p-16 transition-colors"
								>
									<div className="flex size-40 items-center justify-center rounded-full bg-base">
										<BluetoothIcon className="size-20 text-interactive" />
									</div>
									<div className="flex flex-col items-start gap-2 flex-1">
										<span className="body-1-semi-bold text-base">Connect with bluetooth</span>
										<span className="body-2 text-muted">Power on and unlock your device</span>
									</div>
									<ChevronRightIcon className="size-20 text-muted" />
								</button>
							</div>
						</DialogBody>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
