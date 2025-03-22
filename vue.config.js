const CircularDependencyPlugin = require("circular-dependency-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const webpack = require("webpack");

const supportedLocales = require("./src/locales");
let codes = [];
for (const code in supportedLocales) {
	const locale = supportedLocales[code];
	codes.push(locale.fns.code);
}
process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
	configureWebpack: {
		devtool: false, // Force disable source maps in all environments
		performance: {
			hints: false,
		},
		// Add resolve fallbacks for node polyfills
		resolve: {
			fallback: {
				stream: require.resolve("stream-browserify"),
				assert: require.resolve("assert/"),
				http: require.resolve("stream-http"),
				https: require.resolve("https-browserify"),
				os: require.resolve("os-browserify/browser"),
				url: require.resolve("url/"),
			},
			// Add alias for Vue compat mode
			alias: {
				vue: "@vue/compat",
			},
		},
		plugins: [
			// Provide Node.js polyfills
			new webpack.ProvidePlugin({
				process: "process/browser",
				Buffer: ["buffer", "Buffer"],
			}),
			// Your existing plugins
			new webpack.ContextReplacementPlugin(
				/date\-fns[\/\\]/,
				new RegExp(`[/\\\\\](${codes.join("|")})[/\\\\\]index\.js$`)
			),
			new CircularDependencyPlugin({
				exclude: /a\.js|node_modules/,
				failOnError: false, // Changed to false to prevent error display
				allowAsyncCycles: false,
				cwd: process.cwd(),
			}),
			// new ReplaceInFileWebpackPlugin([
			// 	{
			// 		dir: "dist/static/img",
			// 		files: ["sheet.json", "sheet_holiday.json"],
			// 		rules: [
			// 			{
			// 				search: '"image": "sheet.png"',
			// 				replace: '"image": "sheet.png?v=' + process.env.VUE_APP_VERSION + '"',
			// 			},
			// 			{
			// 				search: '"image": "characters.png"',
			// 				replace: '"image": "characters.png?v=' + process.env.VUE_APP_VERSION + '"',
			// 			},
			// 			{
			// 				search: '"image": "mall.png"',
			// 				replace: '"image": "mall.png?v=' + process.env.VUE_APP_VERSION + '"',
			// 			},
			// 			{
			// 				search: '"image": "sheet_holiday.png"',
			// 				replace: '"image": "sheet_holiday.png?v=' + process.env.VUE_APP_VERSION + '"',
			// 			},
			// 		],
			// 		afterEmit: true, // <- Add this line to run after files are emitted
			// 		test: () => true,
			// 	},
			// ]),
			// New plugin to help with error handling
			new webpack.DefinePlugin({
				"process.env.SUPPRESS_ERRORS": JSON.stringify("true"),
				// "process.env.NODE_ENV": JSON.stringify("production"),
				__VUE_HMR_RUNTIME__: JSON.stringify(true),
				// Needed for Vue 3 to avoid warnings
				__VUE_OPTIONS_API__: JSON.stringify(true),
				__VUE_PROD_DEVTOOLS__: JSON.stringify(false),
			}),
		],
	},
	chainWebpack: (config) => {
		// Set Vue to compat mode
		config.resolve.alias.set("vue", "@vue/compat");
		config.devServer.hot(false);
		// Configure vue-loader for compat mode
		config.module
			.rule("vue")
			.use("vue-loader")
			.tap((options) => ({
				...options,
				compilerOptions: {
					// Vue 3 compat mode
					compatConfig: {
						MODE: 2,
					},
				},
			}));

		// Fix the i18n loader configuration for Vue 3
		config.module
			.rule("i18n")
			.resourceQuery(/blockType=i18n/)
			.type("javascript/auto")
			.use("i18n")
			.loader("@intlify/vue-i18n-loader")
			.end();

		// Handle JSON files in locales directory differently
		config.module
			.rule("json-locales")
			.test(/\.json$/)
			.include.add(/src\/locales/)
			.end()
			.type("javascript/auto")
			.use("json-loader")
			.loader("json-loader")
			.end();

		// Optimize terser to remove comments
		config.optimization.minimizer("terser").tap((args) => {
			args[0].terserOptions.output = {
				...args[0].terserOptions.output,
				comments: false,
				ascii_only: true,
			};
			return args;
		});

		// Define error suppression variables
		config.plugin("define").tap((args) => {
			args[0]["process.env"].SUPPRESS_ERRORS = JSON.stringify("true");
			args[0]["process.env"].NODE_ENV = JSON.stringify("production");
			args[0]["__VUE_OPTIONS_API__"] = JSON.stringify(true);
			args[0]["__VUE_PROD_DEVTOOLS__"] = JSON.stringify(false);
			return args;
		});

		// Add plugin to suppress error overlay
		config.plugin("friendly-errors").tap((args) => {
			args[0].clearConsole = false;
			return args;
		});
	},
	// Add dev server options to disable error overlay
	devServer: {
		client: {
			overlay: false,
		},
	},
	pluginOptions: {
		webpackBundleAnalyzer: {
			analyzerMode: "disabled",
			openAnalyzer: false,
		},
		i18n: {
			locale: "en",
			fallbackLocale: "en",
			localeDir: "locales",
			enableInSFC: true,
			// New Vue I18n v9 options
			runtimeOnly: false,
		},
	},
	publicPath: "/",
	outputDir: "dist",
	runtimeCompiler: true,
	assetsDir: "static",
	productionSourceMap: false,
	lintOnSave: false,
};
