import type { ReactNode } from "react";
import { Header } from "./Header";
import { LeftNavbar } from "./LeftNavbar";

interface ShellProps {
	children: ReactNode;
}

export function Shell({ children }: ShellProps) {
	return (
		<div className="flex min-h-screen flex-col bg-canvas text-base">
			{/* Header */}
			<Header />

			{/* Left Navbar - Fixed position on left side */}
			<aside className="fixed left-24 top-1/2 -translate-y-1/2 z-50">
				<LeftNavbar />
			</aside>

			{/* Main content */}
			<main className="mx-auto w-full max-w-[800px] flex-1 px-24 py-48">
				{children}
			</main>
		</div>
	);
}
