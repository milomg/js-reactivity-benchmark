import { defineConfig } from "vite";

export default defineConfig({
  define: {
    ngDevMode: "false",
  },
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        minify: {
          mangle: false,
          codegen: {
            removeWhitespace: false,
          },
        },
      },
    },
  },
});
