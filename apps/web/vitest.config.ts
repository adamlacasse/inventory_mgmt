import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: [/@primer\/react/, /@inventory\/ui/],
      },
    },
  },
  plugins: [
    {
      name: "treat-css-as-empty-module",
      transform(_code, id) {
        if (id.endsWith(".css")) return "export default {}";
      },
    },
  ],
});
