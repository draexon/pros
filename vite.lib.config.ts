import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "dist",
    copyPublicDir: false,
    lib: {
      entry: "src/library/index.ts",
      name: "Pros",
      formats: ["es", "cjs"],
      fileName: (f) => (f === "es" ? "pros.js" : "pros.cjs"),
      cssFileName: "pros",
    },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
  },
});
