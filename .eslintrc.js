module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: ["plugin:vue/essential", "eslint:recommended", "@vue/typescript/recommended"],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
		// Disable the multi-word component names rule
		"vue/multi-word-component-names": "off",
		// Change no-mutating-props from error to warning
		"vue/no-mutating-props": "warn",
		// Allow var usage (you might want to fix those eventually)
		"no-var": "warn",
	},
};
