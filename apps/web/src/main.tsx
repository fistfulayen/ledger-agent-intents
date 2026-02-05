import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./styles/app.css";

// #region agent log
// Capture runtime errors in prod/dev to debug minified stacks.
// NOTE: do not log secrets; keep payload minimal.
const __DBG_ENDPOINT__ =
	"http://127.0.0.1:7243/ingest/26dc3cf1-6d06-4e25-9781-0ae890b55d1f";
function __dbg_log__(payload: {
	hypothesisId: string;
	location: string;
	message: string;
	data?: Record<string, unknown>;
}) {
	fetch(__DBG_ENDPOINT__, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId: "debug-session",
			runId: "prod-repro",
			timestamp: Date.now(),
			...payload,
		}),
	}).catch(() => {});
}

if (typeof window !== "undefined") {
	window.addEventListener("error", (ev) => {
		const e = (ev as ErrorEvent).error as Error | undefined;
		__dbg_log__({
			hypothesisId: "H1",
			location: "src/main.tsx:window.error",
			message: (ev as ErrorEvent).message || "window.error",
			data: {
				filename: (ev as ErrorEvent).filename,
				lineno: (ev as ErrorEvent).lineno,
				colno: (ev as ErrorEvent).colno,
				stack: e?.stack ? String(e.stack).slice(0, 1200) : undefined,
				lastLedgerRpc: (window as unknown as { __lastLedgerRpc?: unknown }).__lastLedgerRpc,
			},
		});
	});
	window.addEventListener("unhandledrejection", (ev) => {
		const reason = (ev as PromiseRejectionEvent).reason as unknown;
		__dbg_log__({
			hypothesisId: "H1",
			location: "src/main.tsx:window.unhandledrejection",
			message: "unhandledrejection",
			data: {
				reasonType: typeof reason,
				reason: reason instanceof Error ? reason.message : String(reason).slice(0, 500),
				stack: reason instanceof Error ? String(reason.stack || "").slice(0, 1200) : undefined,
				lastLedgerRpc: (window as unknown as { __lastLedgerRpc?: unknown }).__lastLedgerRpc,
			},
		});
	});
}
// #endregion agent log

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
