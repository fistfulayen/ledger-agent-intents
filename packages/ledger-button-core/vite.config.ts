import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ command }) => ({
	plugins: [
		// Generate types during build (not in dev/serve mode)
		command === "build" &&
			dts({
				entryRoot: "src",
				outDir: "dist",
				tsconfigPath: "./tsconfig.json",
				insertTypesEntry: true,
			}),
	].filter(Boolean),
	build: {
		outDir: "./dist",
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		lib: {
			entry: "src/index.ts",
			name: "@ledgerhq/ledger-wallet-provider-core",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			external: [],
		},
	},
}));
