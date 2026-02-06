import { type DerivedAddress, useLedger } from "@/lib/ledger-provider";
import { Dialog, DialogBody, DialogContent, Spinner, Spot } from "@ledgerhq/lumen-ui-react";
import {
	ArrowLeft,
	ChevronRight,
	Close,
	LedgerLogo,
	PenEdit,
} from "@ledgerhq/lumen-ui-react/symbols";
import * as RadixDialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useCallback, useMemo, useState } from "react";

// =============================================================================
// Blocky identicon generator (ethereum-style)
// =============================================================================

function generateIdenticonDataUrl(address: string, size = 8, scale = 5): string {
	// Simple deterministic hash from address
	let seed = 0;
	const addr = address.toLowerCase();
	for (let i = 0; i < addr.length; i++) {
		seed = (seed * 31 + addr.charCodeAt(i)) | 0;
	}

	// Pseudo-random number generator
	const randseed: [number, number, number, number] = [0, 0, 0, 0];
	for (let i = 0; i < addr.length; i++) {
		const idx = (i % 4) as 0 | 1 | 2 | 3;
		randseed[idx] = (randseed[idx] << 5) - randseed[idx] + addr.charCodeAt(i);
	}

	function rand(): number {
		const t = randseed[0] ^ (randseed[0] << 11);
		randseed[0] = randseed[1];
		randseed[1] = randseed[2];
		randseed[2] = randseed[3];
		randseed[3] = (randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8)) | 0;
		return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
	}

	function createColor(): string {
		const h = Math.floor(rand() * 360);
		const s = Math.floor(rand() * 60 + 40);
		const l = Math.floor((rand() + rand() + rand() + rand()) * 25);
		return `hsl(${h},${s}%,${l}%)`;
	}

	const color = createColor();
	const bgColor = createColor();
	const spotColor = createColor();

	// Generate pixel data (only left half, mirror for right)
	const dataWidth = Math.ceil(size / 2);
	const data: number[] = [];
	for (let y = 0; y < size; y++) {
		const row: number[] = [];
		for (let x = 0; x < dataWidth; x++) {
			row.push(Math.floor(rand() * 2.3));
		}
		const mirror = [...row].reverse();
		if (size % 2 !== 0) {
			mirror.shift();
		}
		for (const v of [...row, ...mirror]) {
			data.push(v);
		}
	}

	// Render to canvas
	const canvas = document.createElement("canvas");
	canvas.width = size * scale;
	canvas.height = size * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";

	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < data.length; i++) {
		if (data[i] === 0) continue;
		const x = (i % size) * scale;
		const y = Math.floor(i / size) * scale;
		ctx.fillStyle = data[i] === 1 ? color : spotColor;
		ctx.fillRect(x, y, scale, scale);
	}

	return canvas.toDataURL("image/png");
}

// =============================================================================
// Sub-components
// =============================================================================

function Identicon({ address, className }: { address: string; className?: string }) {
	const dataUrl = useMemo(() => generateIdenticonDataUrl(address), [address]);
	return (
		<img
			src={dataUrl}
			alt={`Identicon for ${address}`}
			className={`rounded-full ${className ?? "size-40"}`}
		/>
	);
}

function truncateAddress(address: string): string {
	return `${address.slice(0, 14)}...${address.slice(-12)}`;
}

function AddressRow({
	derived,
	onSelect,
}: { derived: DerivedAddress; onSelect: (d: DerivedAddress) => void }) {
	return (
		<button
			type="button"
			onClick={() => onSelect(derived)}
			className="flex items-center gap-12 rounded-lg bg-muted hover:bg-muted-hover p-16 transition-colors w-full"
		>
			<Identicon address={derived.address} className="size-40" />
			<div className="flex flex-col items-start gap-2 flex-1 min-w-0">
				<span className="body-1-semi-bold text-base font-mono truncate w-full text-left">
					{truncateAddress(derived.address)}
				</span>
				<span className="body-3 text-muted">{derived.derivationPath}</span>
			</div>
			<ChevronRight size={20} className="text-muted flex-shrink-0" />
		</button>
	);
}

// =============================================================================
// Manual path entry view
// =============================================================================

function ManualPathEntry({
	onBack,
	onDerive,
	isLoading,
}: { onBack: () => void; onDerive: (path: string) => void; isLoading: boolean }) {
	const [path, setPath] = useState("44'/60'/0'/0/0");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = () => {
		// Basic validation: must look like a derivation path
		if (!/^\d+'?\/\d+'?\/\d+'?\/\d+'?\/\d+'?$/.test(path.trim())) {
			setError("Invalid derivation path format. Example: 44'/60'/0'/0/0");
			return;
		}
		setError(null);
		onDerive(path.trim());
	};

	return (
		<div className="flex flex-col gap-16">
			<button
				type="button"
				onClick={onBack}
				className="flex items-center gap-8 text-muted hover:text-base transition-colors self-start"
			>
				<ArrowLeft size={16} />
				<span className="body-2">Back</span>
			</button>

			<div className="flex flex-col gap-8">
				<label htmlFor="derivation-path-input" className="body-2-semi-bold text-base">
					Derivation path
				</label>
				<input
					id="derivation-path-input"
					type="text"
					value={path}
					onChange={(e) => {
						setPath(e.target.value);
						setError(null);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSubmit();
					}}
					className="rounded-lg border border-muted bg-surface px-12 py-10 body-2 text-base placeholder:text-muted-subtle focus:border-focus focus:outline-none font-mono"
					placeholder="44'/60'/0'/0/0"
					disabled={isLoading}
				/>
				{error && <p className="body-3 text-error">{error}</p>}
			</div>

			<button
				type="button"
				onClick={handleSubmit}
				disabled={isLoading}
				className="rounded-lg bg-accent text-on-accent hover:bg-accent-hover px-16 py-10 body-2-semi-bold transition-colors disabled:opacity-50"
			>
				{isLoading ? "Deriving…" : "Derive address"}
			</button>
		</div>
	);
}

// =============================================================================
// Main component
// =============================================================================

export function AddressPickerDialog() {
	const {
		showAddressPicker,
		derivedAddresses,
		selectAddress,
		deriveCustomAddress,
		isDerivingAddresses,
		disconnect,
	} = useLedger();

	const [showManualEntry, setShowManualEntry] = useState(false);

	const handleClose = useCallback(() => {
		// Closing without selecting disconnects — the user hasn't picked an account
		disconnect();
	}, [disconnect]);

	const handleDeriveCustom = useCallback(
		async (path: string) => {
			try {
				await deriveCustomAddress(path);
				setShowManualEntry(false);
			} catch {
				// Error is handled inside deriveCustomAddress
			}
		},
		[deriveCustomAddress],
	);

	if (!showAddressPicker) return null;

	return (
		<Dialog
			open={showAddressPicker}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		>
			<DialogContent aria-describedby={undefined}>
				{/* Visually-hidden Radix title — satisfies accessibility requirement */}
				<VisuallyHidden.Root asChild>
					<RadixDialog.Title>Signer address</RadixDialog.Title>
				</VisuallyHidden.Root>

				{/* Custom header with Ledger logo + title + close */}
				<div className="flex items-center justify-between p-16">
					<div className="flex items-center gap-12">
						<LedgerLogo size={24} className="text-base" />
						<span className="heading-5 text-base">Signer address</span>
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="flex size-32 items-center justify-center rounded-full hover:bg-muted-transparent transition-colors"
						aria-label="Close"
					>
						<Close size={20} className="text-muted" />
					</button>
				</div>
				<DialogBody>
					<div className="flex flex-col gap-16 pb-16">
						{showManualEntry ? (
							<ManualPathEntry
								onBack={() => setShowManualEntry(false)}
								onDerive={handleDeriveCustom}
								isLoading={isDerivingAddresses}
							/>
						) : (
							<>
								{/* Enter derivation path manually */}
								<button
									type="button"
									onClick={() => setShowManualEntry(true)}
									className="flex items-center gap-12 rounded-lg bg-muted hover:bg-muted-hover p-16 transition-colors"
								>
									<Spot appearance="icon" icon={PenEdit} size={40} />
									<span className="body-1-semi-bold text-base flex-1 text-left">
										Enter derivation path manually
									</span>
									<ChevronRight size={20} className="text-muted" />
								</button>

								{/* Divider */}
								<div className="border-t border-muted" />

								{/* Address list */}
								<p className="body-2-semi-bold text-base">Or select an address</p>

								{isDerivingAddresses && derivedAddresses.length === 0 ? (
									<div className="flex items-center justify-center py-32">
										<Spinner size={40} />
									</div>
								) : (
									<div className="flex flex-col gap-8 max-h-[320px] overflow-y-auto">
										{derivedAddresses.map((derived) => (
											<AddressRow
												key={derived.derivationPath}
												derived={derived}
												onSelect={selectAddress}
											/>
										))}
										{isDerivingAddresses && (
											<div className="flex items-center justify-center py-12">
												<Spinner size={24} />
											</div>
										)}
									</div>
								)}
							</>
						)}
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
