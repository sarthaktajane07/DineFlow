import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        global: "window",
    },
    server: {
        host: "0.0.0.0",
        port: 3001,
        proxy: {
            "/api": {
                target: "http://localhost:5001",
                changeOrigin: true,
            },
            "/ws": {
                target: "http://localhost:5001",
                ws: true,
                changeOrigin: true,
            },
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "react": path.resolve(__dirname, "./node_modules/react"),
            "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
        },
        dedupe: ["react", "react-dom"],
    },
});
