import eslintPluginAstro from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";

export default [
	...eslintPluginAstro.configs.recommended,
	{
		ignores: [".astro/**", "dist/", ".claude/"]
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module"
			}
		}
	},
	{
		files: ["**/*.astro"],
		languageOptions: {
			parserOptions: {
				parser: tsParser
			}
		}
	},
	{
		rules: {
			"no-unused-vars": "warn",
			"no-console": "warn"
		}
	}
];
