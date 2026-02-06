/**
 * Agent Intents logo — robot/agent inside a coin circle.
 * Uses `currentColor` so it adapts to light/dark themes.
 */
export function AgentIntentsLogo({
	size = 32,
	className,
}: {
	size?: number;
	className?: string;
}) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			{/* Outer coin circle — represents payment */}
			<circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />

			{/* Bot head — represents the agent */}
			<rect x="9" y="12" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />

			{/* Left eye */}
			<circle cx="13" cy="17" r="1.5" fill="currentColor" />

			{/* Right eye */}
			<circle cx="19" cy="17" r="1.5" fill="currentColor" />

			{/* Antenna stem */}
			<line
				x1="16"
				y1="12"
				x2="16"
				y2="7"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>

			{/* Antenna tip — signal dot */}
			<circle cx="16" cy="6" r="1.5" fill="currentColor" />

			{/* Small signal arcs around antenna */}
			<path
				d="M12.5 5.5 C13.5 3.5 18.5 3.5 19.5 5.5"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
	);
}
