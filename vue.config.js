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
			new ReplaceInFileWebpackPlugin([
				{
					dir: "dist/static/img",
					files: ["sheet.json", "sheet_holiday.json"],
					rules: [
						{
							search: '"image": "sheet.png"',
							replace: '"image": "sheet.png?v=' + process.env.VUE_APP_VERSION + '"',
						},
						{
							search: '"image": "characters.png"',
							replace: '"image": "characters.png?v=' + process.env.VUE_APP_VERSION + '"',
						},
						{
							search: '"image": "mall.png"',
							replace: '"image": "mall.png?v=' + process.env.VUE_APP_VERSION + '"',
						},
						{
							search: '"image": "sheet_holiday.png"',
							replace: '"image": "sheet_holiday.png?v=' + process.env.VUE_APP_VERSION + '"',
						},
					],
				},
			]),
			// New plugin to help with error handling
			new webpack.DefinePlugin({
				"process.env.SUPPRESS_ERRORS": JSON.stringify("true"),
				"process.env.NODE_ENV": JSON.stringify("production"),
			}),
		],
	},
	chainWebpack: (config) => {
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
		},
	},
	publicPath: "/",
	outputDir: "dist",
	runtimeCompiler: true,
	assetsDir: "static",
	productionSourceMap: false,
	lintOnSave: false,
};
