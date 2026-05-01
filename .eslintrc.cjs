module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
	],
	ignorePatterns: ["dist", "dist-server", ".eslintrc.cjs", "server", "api"],
	parser: "@typescript-eslint/parser",
	plugins: ["react-refresh", "@typescript-eslint"],
	rules: {
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true, allowExportNames: ["CartProvider", "useCart"] },
		],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
	},
};
