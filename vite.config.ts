import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import { loadEnv } from "vite";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log("vite loads env", env);
  return defineConfig({
    plugins: [svelte(), viteSingleFile()],
    root: "./src/svelte/",
    build: {
      outDir: "../../dist",
      emptyOutDir: true, // Ensure the output directory is empty
      // Inline HTML and CSS
      rollupOptions: {},
    },
    define: {
      "process.env": env,
    },
    server: {
      proxy: {
        // General Aspen API proxy setup
        "/aspen": {
          target: "https://ma-innovation.myfollett.com", // target host
          changeOrigin: true, // necessary for virtual hosted sites
          rewrite: (path) => path.replace(/^\/aspen/, ""), // remove the /aspen when forwarding
        },
      },
    },
  });
};
