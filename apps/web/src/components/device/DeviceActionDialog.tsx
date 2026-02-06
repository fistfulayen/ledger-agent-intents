import { type DeviceActionUiState, useLedger } from "@/lib/ledger-provider";
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@ledgerhq/lumen-ui-react";
import Lottie from "lottie-react";
import { useMemo } from "react";
import { type AnimationKey, type DeviceModel, getDeviceAnimation } from "./animations";

// =============================================================================
// Icons
// =============================================================================

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			role="img"
			aria-label="Success"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);
}

function AlertIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			role="img"
			aria-label="Error"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
			/>
		</svg>
	);
}

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

// =============================================================================
// Map UI state → animation key
// =============================================================================

function getAnimationKey(status: DeviceActionUiState["status"]): AnimationKey | null {
	switch (status) {
		case "unlock-device":
			return "pin";
		case "allow-secure-connection":
		case "verify-address":
			return "continueOnLedger";
		case "sign-transaction":
		case "sign-message":
		case "sign-typed-data":
			return "signTransaction";
		default:
			return null;
	}
}

// =============================================================================
// Status configuration
// =============================================================================

type StatusConfig = {
	title: string;
	subtitle: string | null;
	/** Show the USB icon instead of a Lottie animation. */
	useUsbIcon?: boolean;
};

function getStatusConfig(status: DeviceActionUiState["status"]): StatusConfig {
	switch (status) {
		case "unlock-device":
			return {
				title: "Unlock your Ledger",
				subtitle: "Enter your PIN code on your device.",
			};
		case "allow-secure-connection":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "open-app":
		case "confirm-open-app":
			return {
				title: "Open Ethereum app",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
				useUsbIcon: true,
			};
		case "sign-transaction":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "sign-message":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "sign-typed-data":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "verify-address":
			return {
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
			};
		case "success":
			return { title: "Success", subtitle: null };
		case "error":
			return { title: "Error", subtitle: null };
	}
}

// =============================================================================
// Component
// =============================================================================

export function DeviceActionDialog() {
	const { deviceActionState, deviceModelId, dismissDeviceAction } = useLedger();

	const deviceModel: DeviceModel = (deviceModelId as DeviceModel) ?? "generic";

	const animationData = useMemo(() => {
		if (!deviceActionState) return null;
		const key = getAnimationKey(deviceActionState.status);
		if (!key) return null;
		return getDeviceAnimation(deviceModel, key);
	}, [deviceActionState, deviceModel]);

	if (!deviceActionState) return null;

	const config = getStatusConfig(deviceActionState.status);
	const isError = deviceActionState.status === "error";
	const isSuccess = deviceActionState.status === "success";
	const isOpenApp =
		deviceActionState.status === "open-app" || deviceActionState.status === "confirm-open-app";

	// -------------------------------------------------------------------------
	// "Open Ethereum app" layout — matches the Ledger reference design
	// -------------------------------------------------------------------------
	if (isOpenApp) {
		return (
			<Dialog
				open
				onOpenChange={() => {
					/* managed programmatically */
				}}
			>
				<DialogContent>
					{/* Minimal header with just the Ledger logo */}
					<div className="p-16">
						<LedgerLogoIcon className="size-24 text-base" />
					</div>
					<DialogBody>
						<div className="flex flex-col items-center gap-16 py-24">
							<div className="flex size-64 items-center justify-center rounded-full bg-base">
								<div className="flex size-40 items-center justify-center rounded-full bg-canvas">
									<UsbIcon className="size-20 text-base" />
								</div>
							</div>
							<p className="heading-4 text-center text-base">{config.title}</p>
							<p className="body-2 text-muted text-center">{config.subtitle}</p>
						</div>
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	}

	// -------------------------------------------------------------------------
	// Standard device-action layout (Lottie + title + subtitle)
	// -------------------------------------------------------------------------
	return (
		<Dialog
			open={!!deviceActionState}
			onOpenChange={() => {
				/* managed programmatically */
			}}
		>
			<DialogContent>
				<DialogHeader
					appearance="compact"
					title={config.title}
					onClose={isError ? dismissDeviceAction : () => {}}
				/>
				<DialogBody>
					<div className="flex flex-col items-center gap-16 py-24">
						{/* Lottie animation or fallback icon */}
						{animationData ? (
							<div className="w-[200px] h-[200px] flex items-center justify-center">
								<Lottie
									animationData={animationData}
									loop
									autoplay
									style={{ width: "100%", height: "100%" }}
								/>
							</div>
						) : isSuccess ? (
							<div className="flex items-center justify-center size-64 rounded-full bg-success/10">
								<CheckIcon className="size-32 text-success" />
							</div>
						) : isError ? (
							<div className="flex items-center justify-center size-64 rounded-full bg-error/10">
								<AlertIcon className="size-32 text-error" />
							</div>
						) : (
							<div className="flex items-center justify-center size-64">
								<div className="size-40 border-4 border-muted border-t-interactive rounded-full animate-spin" />
							</div>
						)}

						{/* Title below animation for device-interaction states */}
						{config.subtitle && <p className="heading-5 text-center text-base">{config.title}</p>}

						{/* Subtitle / instructions */}
						{config.subtitle ? (
							<p className="body-2 text-muted text-center">{config.subtitle}</p>
						) : (
							<p className={`body-1 text-center ${isError ? "text-error" : "text-base"}`}>
								{deviceActionState.message}
							</p>
						)}
					</div>
				</DialogBody>

				{/* Allow dismissing error state */}
				{isError && (
					<DialogFooter>
						<Button appearance="transparent" size="md" onClick={dismissDeviceAction}>
							Close
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
