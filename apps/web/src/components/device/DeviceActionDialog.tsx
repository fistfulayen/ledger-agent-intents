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
// Fallback icons (used when no lottie is available)
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

// =============================================================================
// Map UI state → animation key
// =============================================================================

function getAnimationKey(status: DeviceActionUiState["status"]): AnimationKey | null {
	switch (status) {
		case "unlock-device":
			return "pin";
		case "allow-secure-connection":
		case "open-app":
		case "confirm-open-app":
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
				title: "Continue on your Ledger",
				subtitle: "Follow the instructions displayed on your Secure Touchscreen.",
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

	// Resolve the device model for animation lookup
	const deviceModel: DeviceModel = (deviceModelId as DeviceModel) ?? "generic";

	// Get the lottie animation data for the current state
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
							/* Connecting spinner */
							<div className="flex items-center justify-center size-64">
								<div className="size-40 border-4 border-muted border-t-interactive rounded-full animate-spin" />
							</div>
						)}

						{/* Title text (below animation for device-interaction states) */}
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
