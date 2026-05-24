// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://smc2sfc2.app.etejeda.dev",
	integrations: [sitemap()]
});
