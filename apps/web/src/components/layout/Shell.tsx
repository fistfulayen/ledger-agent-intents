import type { ReactNode } from "react";
import { Header } from "./Header";

interface ShellProps {
	children: ReactNode;
}

export function Shell({ children }: ShellProps) {
	return (
		<div className="flex min-h-screen flex-col bg-black text-white">
			{/* Header */}
			<Header />

			{/* Main content */}
			<main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
				{children}
			</main>
		</div>
	);
}
