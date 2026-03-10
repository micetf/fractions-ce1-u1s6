import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    base: "/fractions-ce1-u1s6/",
    plugins: [react()],
});
