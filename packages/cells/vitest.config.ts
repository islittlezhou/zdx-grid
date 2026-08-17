import react from "@vitejs/plugin-react";
import { defineConfig, configDefaults, type UserConfig } from "vitest/config";

// vitest bundles its own copy of vite; derive the plugin type from its UserConfig
// so the root vite Plugin returned by @vitejs/plugin-react can be safely bridged.
type PluginOption = NonNullable<UserConfig["plugins"]>[number];

export default defineConfig({
    plugins: [react() as unknown as PluginOption],
    test: {
        include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
        environment: "jsdom",
        setupFiles: "vitest.setup.ts",
        threads: false,
        singleThread: true,
        watch: false,
        clearMocks: true,
        maxConcurrency: 5,
        fakeTimers: {
            toFake: [
                ...(configDefaults.fakeTimers.toFake ?? []),
                "performance",
                "requestAnimationFrame",
                "cancelAnimationFrame",
            ],
        },
        deps: {
            optimizer: {
                web: {
                    include: ["vitest-canvas-mock"],
                },
            },
        },
        environmentOptions: {
            jsdom: {
                resources: "usable",
            },
        },
    },
});
