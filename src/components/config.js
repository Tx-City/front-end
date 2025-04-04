import Vue from "vue";
import i18n from "../i18n";
import median from "./utils/median";

export const ethUnits = (wei, readable = true, round = false) => {
	let val = wei;
	let units = "Wei";
	if (val > 100000000) {
		units = "Gwei";
		val = val / 1000000000;
	} else if (val > 100000) {
		units = "Mwei";
		val = val / 1000000;
	} else if (val > 100) {
		units = "Kwei";
		val = val / 1000;
	}
	if (round && !isNaN(val)) val = Math.round(val);
	val = val.toLocaleString(i18n.locale, {
		maximumFractionDigits: 1,
		minimumFractionDigits: 0,
	});
	if (readable) return val + " " + units;
	else return val;
};

export const generalCalcBlockFeeArray = (data, ticker) => {
	if (!data.feeArray && data.txFull) {
		data.lowFee = Math.pow(10, 36);
		data.highFee = 0;
		data.feeArray = [];

		Object.values(data.txFull).forEach((tx) => {
			const fee = Number(enabledConfig[ticker].getAndApplyFee(tx));
			if (fee < data.lowFee) data.lowFee = fee;
			if (fee > data.highFee) data.highFee = fee;
			data.feeArray.push(fee);
		});

		data.medianFee = Math.round(median(data.feeArray));
	}
};

export const BTC = {
	ticker: "BTC",
	coinName: "Bitcoin",
	color: "f7931a",
	busColor: "f2a445",
	busCapacity: 1000000,
	feeVar: "spb",
	explorerTxUrl: "https://www.blockchain.com/btc/tx/",
	explorerBlockUrl: "https://www.blockchain.com/btc/block/",
	explorerBlocksUrl: "https://www.blockchain.com/btc/blocks",
	explorerAddressUrl: "https://www.blockchain.com/btc/address/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 10,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 30,
			restart: false,
			value: 5,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usd", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("btc.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("btc.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"mempool-bytes": {
			title: () => {
				return i18n.t("btc.mempool-bytes");
			},
			after: " MB",
			divide: 1000000,
			decimals: 3,
			value: false,
			guide: ["mempool_size", "mempool"],
			socket: true,
			wiki: ["common/stats/mempool-size", "common/mempool"],
		},
		"mempool-size": {
			title: () => {
				return i18n.t("btc.mempool-size");
			},
			signTitle: "Pending Txs",
			decimals: 0,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("btc.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-satPerByte": {
			title: () => {
				return i18n.t("btc.medianFee-satPerByte");
			},
			common: "medianFeeSat",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-satPerByte", "common/transaction-fees"],
		},
		bps: {
			title: () => {
				return i18n.t("btc.bps");
			},
			decimals: 0,
			after: " vB",
			value: false,
			socket: true,
			wiki: ["common/stats/bps"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("btc.supply-circulating");
			},
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("btc.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => {
				return i18n.t("btc.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("btc.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		blockchainSize: {
			title: () => {
				return i18n.t("btc.blockchainSize");
			},
			after: " MB",
			value: false,
			socket: true,
		},
		difficulty: {
			title: () => {
				return i18n.t("btc.difficulty");
			},
			value: false,
			decimals: 0,
			socket: true,
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("btc.medianBlockSize");
			},
			decimals: 3,
			divide: 1000000,
			after: " MB",
			value: false,
			socket: true,
			wiki: ["common/stats/medianBlockSize"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("btc.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("btc.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("btc.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		halving: {
			title: () => {
				return i18n.t("btc.halving");
			},
			signTitle: "Halving in",
			value: false,
		},
	}),
};

export const DASH = {
	ticker: "DASH",
	coinName: "Dash",
	color: "ffffff",
	busColor: "ffffff",
	busCapacity: 1000000,
	feeVar: "spb",
	explorerTxUrl: "https://insight.dash.org/insight/tx/",
	explorerBlockUrl: "https://blockchair.com/dash/block/",
	explorerBlocksUrl: "https://blockchair.com/dash/blocks/",
	explorerAddressUrl: "https://blockchair.com/dash/address/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 10,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 30,
			restart: false,
			value: 5,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usd", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("dash.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("dash.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"mempool-bytes": {
			title: () => {
				return i18n.t("dash.mempool-bytes");
			},
			after: " MB",
			divide: 1000000,
			decimals: 3,
			value: false,
			guide: ["mempool_size", "mempool"],
			socket: true,
			wiki: ["common/stats/mempool-size", "common/mempool"],
		},
		"mempool-size": {
			title: () => {
				return i18n.t("dash.mempool-size");
			},
			signTitle: "Pending Txs",
			decimals: 0,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("dash.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-satPerByte": {
			title: () => {
				return i18n.t("dash.medianFee-satPerByte");
			},
			common: "medianFeeSat",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-satPerByte", "common/transaction-fees"],
		},
		bps: {
			title: () => {
				return i18n.t("dash.bps");
			},
			decimals: 0,
			after: " B",
			value: false,
			socket: true,
			wiki: ["common/stats/bps"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("btc.supply-circulating");
			},
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("btc.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => {
				return i18n.t("btc.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("btc.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		blockchainSize: {
			title: () => {
				return i18n.t("dash.blockchainSize");
			},
			value: false,
			socket: true,
			format: function (value) {
				// Check if value is a number and not null/undefined
				if (typeof value === "number" && !isNaN(value)) {
					return value.toLocaleString("en-US") + " MB";
				}
				// Return the original value if it's not a valid number, appended with MB
				return value + " MB";
			},
		},
		difficulty: {
			title: () => {
				return i18n.t("btc.difficulty");
			},
			value: false,
			decimals: 0,
			socket: true,
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("btc.medianBlockSize");
			},
			decimals: 3,
			divide: 1000000,
			after: " MB",
			value: false,
			socket: true,
			wiki: ["common/stats/medianBlockSize"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("btc.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("btc.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("btc.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		halving: {
			title: () => {
				return i18n.t("dash.halving");
			},
			signTitle: "Halving in",
			value: false,
		},
	}),
};

export const XION = {
	ticker: "XION",
	coinName: "XION",
	color: "ffffff",
	busColor: "ffffff",
	busColorText: "000000", // Adding text color to ensure visibility
	busCapacity: 1000000,
	feeVar: "xion",
	explorerTxUrl: "https://explorer.burnt.com/xion-mainnet-1/tx/",
	explorerBlockUrl: "https://explorer.burnt.com/xion-mainnet-1/block/",
	explorerBlocksUrl: "https://explorer.burnt.com/xion-mainnet-1/block/",
	explorerAddressUrl: "https://explorer.burnt.com/xion-mainnet-1/account/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 10,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 10,
			max: 10,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usdTransfer"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},

	stats: Vue.observable({
		tps: {
			title: () => "Transactions Per Second",
			decimals: 2,
			value: false,
			socket: false,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => "Confirmed TPS",
			decimals: 2,
			value: 1,
			socket: false,
			wiki: ["common/stats/ctps"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("xion.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: 0.0006,
			socket: false,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-satPerByte": {
			title: () => {
				return i18n.t("xion.medianFee-satPerByte");
			},
			common: "medianFeeSat",
			value: 0.0005,
			socket: false,
			wiki: ["common/stats/medianFee-satPerByte", "common/transaction-fees"],
		},
		"supply-circulating": {
			title: () => "Circulating Supply",
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("btc.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => "Last Block",
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianBlockTime: {
			title: () => "Median Block Time",
			value: 180,
			timeAgo: true,
			socket: false,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
	}),
};

export const EVOLUTION = {
	ticker: "EVOLUTION",
	coinName: "Dash Evolution",
	color: "ffffff",
	busColor: "ffffff",
	busColorText: "000000", // Adding text color to ensure visibility
	busCapacity: 1000000,
	feeVar: "spb",
	explorerTxUrl: "https://platform-explorer.com/transaction/",
	explorerBlockUrl: "https://platform-explorer.com/blocks/",
	explorerBlocksUrl: "https://platform-explorer.com/blocks/",
	explorerAddressUrl: "https://platform-explorer.com/identity/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 10,
	blockFormat: [
		{
			title: () => {
				return i18n.t("eth.gu");
			},
			icon: "fas fa-oil-can",
			key: "bv",
			color: "D6CDEA",
			format: (val) => {
				return val.toLocaleString(i18n.locale);
			},
		},
		{
			title: () => {
				return "Base Fee";
			},
			key: "av",
			color: "F9D8D6",
			icon: "fas fa-ticket-alt",
			format: (val) => {
				return ethUnits(val);
			},
		},
	],
	// Simple implementation of required functions without dependencies
	// getAndApplyFee: function (txData) {
	// 	if (txData.feeVal) return txData.feeVal;
	// 	txData.feeVal = txData.fee || 10;
	// 	return txData.feeVal;
	// },

	// calcBlockFeeArray: function (data) {
	// 	if (data.feeArray || !data.txFull) return;
	// 	data.lowFee = 9999999;
	// 	data.highFee = 0;
	// 	data.feeArray = [];
	// 	data.medianFee = 10;
	// },
	// Add the calcHalving function to the object
	calcHalving: function (numberOfCountdowns = 1) {
		// Set the first countdown date to March 16, 2025
		const startDate = new Date(2025, 2, 16); // Month is 0-indexed (0=Jan, 1=Feb, 2=Mar)

		// Array to store all countdown dates
		const countdownDates = [];

		// Calculate all the countdown dates
		for (let i = 0; i < numberOfCountdowns; i++) {
			// For the first countdown, use the start date
			// For subsequent countdowns, add 9.125 days to the previous date
			if (i === 0) {
				countdownDates.push(new Date(startDate));
			} else {
				// Calculate the new date by adding 9.125 days to the previous date
				const previousDate = new Date(countdownDates[i - 1]);

				// Convert 9.125 days to milliseconds (9.125 * 24 * 60 * 60 * 1000)
				const daysInMs = 9.125 * 24 * 60 * 60 * 1000;

				// Add the time to the previous date
				const newDate = new Date(previousDate.getTime() + daysInMs);
				countdownDates.push(newDate);
			}
		}

		// Format the date for output - just take the first countdown
		if (countdownDates.length > 0) {
			const date = countdownDates[0];
			const day = date.getDate();
			const month = date.toLocaleString("default", { month: "long" });

			// Add suffix to day number (1st, 2nd, 3rd, etc.)
			const daySuffix = this.getDaySuffix(day);

			return `${day}${daySuffix} ${month}`;
		}

		return "16th March"; // Default fallback
	},

	// Helper function to get the correct suffix for a day number
	getDaySuffix: function (day) {
		if (day > 3 && day < 21) return "th";

		switch (day % 10) {
			case 1:
				return "st";
			case 2:
				return "nd";
			case 3:
				return "rd";
			default:
				return "th";
		}
	},
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 10,
			max: 10,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usdTransfer"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},

	stats: Vue.observable({
		// tps: {
		// 	title: () => "Transactions Per Second",
		// 	decimals: 2,
		// 	value: false,
		// 	socket: false,
		// 	wiki: ["common/stats/tps"],
		// },
		ctps: {
			title: () => "Confirmed TPS",
			decimals: 2,
			value: 1,
			socket: false,
			wiki: ["common/stats/ctps"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("dash.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: 0.0001,
			socket: false,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-satPerByte": {
			title: () => {
				return i18n.t("dash.medianFee-satPerByte");
			},
			common: "medianFeeSat",
			value: 1,
			socket: false,
			wiki: ["common/stats/medianFee-satPerByte", "common/transaction-fees"],
		},
		// bps: {
		// 	title: () => "Bytes Per Second",
		// 	decimals: 0,
		// 	after: " B",
		// 	value: false,
		// 	socket: true,
		// 	wiki: ["common/stats/bps"],
		// },
		"supply-circulating": {
			title: () => "Circulating Supply",
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("btc.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => "Last Block",
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		// medianTxsPerBlock: {
		// 	title: () => "Median Txs Per Block",
		// 	value: 0,
		// 	decimals: 0,
		// 	socket: true,
		// 	wiki: ["common/stats/medianTxsPerBlock"],
		// },
		blockchainSize: {
			title: () => "Blockchain Size",
			value: 87 + "MB",
			socket: false,
		},
		// medianBlockSize: {
		// 	title: () => "Median Block Size",
		// 	decimals: 3,
		// 	divide: 1000000,
		// 	after: " MB",
		// 	value: 0.0001,
		// 	socket: true,
		// 	wiki: ["common/stats/medianBlockSize"],
		// },
		medianBlockTime: {
			title: () => "Median Block Time",
			value: 180,
			timeAgo: true,
			socket: false,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		halving: {
			title: () => "Next Epoch",
			signTitle: "Halving in",
			get value() {
				return EVOLUTION.calcHalving();
			},
		},
	}),
};

export const LTC = {
	ticker: "LTC",
	coinName: "Litecoin",
	color: "337fee",
	busColor: "5f9bd4",
	busCapacity: 1000000,
	feeVar: "lpb",
	explorerTxUrl: "https://blockchair.com/litecoin/transaction/",
	explorerBlockUrl: "https://blockchair.com/litecoin/block/",
	explorerBlocksUrl: "https://blockchair.com/litecoin/blocks",
	explorerAddressUrl: "https://blockchair.com/litecoin/address/",
	mwebExplorerBlockUrl: "https://www.mwebexplorer.com/blocks/block/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 15,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 30,
			restart: false,
			value: 5,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usd", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("ltc.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("ltc.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"mempool-bytes": {
			title: () => {
				return i18n.t("ltc.mempool-bytes");
			},
			after: " MB",
			divide: 1000000,
			decimals: 3,
			value: false,
			socket: true,
			guide: ["mempool_size", "mempool"],
			wiki: ["common/stats/mempool-size", "common/mempool"],
		},
		"mempool-size": {
			title: () => {
				return i18n.t("ltc.mempool-size");
			},
			signTitle: "Pending Txs",
			decimals: 0,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("ltc.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-litPerByte": {
			title: () => {
				return i18n.t("ltc.medianFee-litPerByte");
			},
			common: "medianFeeSat",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-satPerByte", "common/transaction-fees"],
		},
		bps: {
			title: () => {
				return i18n.t("ltc.bps");
			},
			decimals: 0,
			after: " vB",
			value: false,
			socket: true,
			wiki: ["common/stats/bps"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("ltc.supply-circulating");
			},
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("ltc.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => {
				return i18n.t("ltc.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("ltc.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		blockchainSize: {
			title: () => {
				return i18n.t("ltc.blockchainSize");
			},
			after: " MB",
			value: false,
			socket: true,
		},
		difficulty: {
			title: () => {
				return i18n.t("ltc.difficulty");
			},
			value: false,
			decimals: 0,
			socket: true,
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("ltc.medianBlockSize");
			},
			decimals: 3,
			divide: 1000000,
			after: " MB",
			value: false,
			socket: true,
			wiki: ["common/stats/medianBlockSize"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("ltc.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("ltc.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("ltc.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		halving: {
			title: () => {
				return i18n.t("ltc.halving");
			},
			signTitle: "Halving in",
			value: false,
		},
	}),
};

export const ETH = {
	ticker: "ETH",
	coinName: "Ethereum",
	color: "508de6",
	busColor: "6e9adc",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://etherscan.io/tx/",
	explorerBlockUrl: "https://etherscan.io/block/",
	explorerBlocksUrl: "https://etherscan.io/blocks",
	explorerAddressUrl: "https://etherscan.io/address/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	addressNonces: {},
	maxBlocksToKeep: 25,
	blockFormat: [
		{
			title: () => {
				return i18n.t("eth.gu");
			},
			icon: "fas fa-oil-can",
			key: "gu",
			color: "D6CDEA",
			format: (val) => {
				return val.toLocaleString(i18n.locale);
			},
		},
		{
			title: () => {
				return "Base Fee";
			},
			key: "baseFee",
			color: "F9D8D6",
			icon: "fas fa-ticket-alt",
			format: (val) => {
				return ethUnits(val);
			},
		},
	],
	calcBlockFeeArray: function (data) {
		if (data.feeArray || !data.txFull) return;
		data.lowFee = Math.pow(10, 36);
		data.highFee = 0;
		data.feeArray = [];

		Object.values(data.txFull).forEach((tx) => {
			const gp = this.getFee(tx);
			let fee = gp - (data.baseFee || 0);
			if (tx.mpfpg && fee > Number(tx.mpfpg)) {
				fee = Number(tx.mpfpg);
			}
			fee /= 1000000000; //hardcode to gwei for now
			if (fee <= 0) fee = 0.01;
			if (fee < data.lowFee) data.lowFee = fee;
			if (fee > data.highFee) data.highFee = fee;
			data.feeArray.push(fee);
		});
		data.medianFee = Math.round(median(data.feeArray));
	},
	getFee: function (txData) {
		if (typeof txData.ty === "undefined") return 0;
		if (txData.ty === 0) {
			return txData.gp || 0;
		} else if (txData.ty === 1) {
			return txData.gp || 0;
		} else if (txData.ty === 2) {
			return txData.mfpg || 0;
		} else {
			return 0;
		}
	},
	getAndApplyFee: function (txData) {
		if (txData.feeVal) return txData.feeVal;
		txData.feeVal = this.getFee(txData);

		return txData.feeVal;
	},
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usdTransfer", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("eth.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		baseFee: {
			title: () => {
				return i18n.t("eth.baseFee");
			},
			signTitle: "Base Fee",
			value: 0,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/baseFee"],
		},

		"mempool-size": {
			title: () => {
				return i18n.t("eth.mempool-size");
			},
			signTitle: "Pending Txs",
			value: 0,
			decimals: 0,
			limit: 75000,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("eth.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("eth.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("eth.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("eth.supply-circulating");
			},
			decimals: 0,
			socket: true,
			value: false,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("eth.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			socket: true,
			value: false,
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("eth.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		medianGasUsed: {
			title: () => {
				return i18n.t("eth.medianGasUsed");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/medianBlockGas"],
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("eth.medianBlockSize");
			},
			value: 0,
			decimals: 3,
			divide: 1000000,
			socket: true,
			after: " MB",
			wiki: ["common/stats/medianBlockSize"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("eth.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("eth.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
	}),
};

export const LUKSO = {
	ticker: "LUKSO",
	coinName: "LUKSO",
	color: "fff1f8",
	busColor: "fff1f8",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://explorer.consensus.mainnet.lukso.network/tx/",
	explorerBlockUrl: "https://explorer.consensus.mainnet.lukso.network/blocks",
	explorerBlocksUrl: "https://explorer.consensus.mainnet.lukso.network/blocks",
	explorerAddressUrl: "",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	addressNonces: {},
	maxBlocksToKeep: 25,
	blockFormat: [
		{
			title: () => {
				return i18n.t("eth.gu");
			},
			icon: "fas fa-oil-can",
			key: "gu",
			color: "D6CDEA",
			format: (val) => {
				return val.toLocaleString(i18n.locale);
			},
		},
		{
			title: () => {
				return "Base Fee";
			},
			key: "baseFee",
			color: "F9D8D6",
			icon: "fas fa-ticket-alt",
			format: (val) => {
				return ethUnits(val);
			},
		},
	],
	calcBlockFeeArray: function (data) {
		if (data.feeArray || !data.txFull) return;
		data.lowFee = Math.pow(10, 36);
		data.highFee = 0;
		data.feeArray = [];

		Object.values(data.txFull).forEach((tx) => {
			const gp = this.getFee(tx);
			let fee = gp - (data.baseFee || 0);
			if (tx.mpfpg && fee > Number(tx.mpfpg)) {
				fee = Number(tx.mpfpg);
			}
			fee /= 1000000000; //hardcode to gwei for now
			if (fee <= 0) fee = 0.01;
			if (fee < data.lowFee) data.lowFee = fee;
			if (fee > data.highFee) data.highFee = fee;
			data.feeArray.push(fee);
		});
		data.medianFee = Math.round(median(data.feeArray));
	},
	getFee: function (txData) {
		if (typeof txData.ty === "undefined") return 0;
		if (txData.ty === 0) {
			return txData.gp || 0;
		} else if (txData.ty === 1) {
			return txData.gp || 0;
		} else if (txData.ty === 2) {
			return txData.mfpg || 0;
		} else {
			return 0;
		}
	},
	getAndApplyFee: function (txData) {
		if (txData.feeVal) return txData.feeVal;
		txData.feeVal = this.getFee(txData);

		return txData.feeVal;
	},
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usdTransfer"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("eth.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		baseFee: {
			title: () => {
				return i18n.t("eth.baseFee");
			},
			signTitle: "Base Fee",
			value: 0,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/baseFee"],
		},

		"mempool-size": {
			title: () => {
				return i18n.t("eth.mempool-size");
			},
			signTitle: "Pending Txs",
			value: 0,
			decimals: 0,
			limit: 75000,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("lukso.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("eth.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: 0.001,
			socket: false,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("lukso.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("eth.supply-circulating");
			},
			decimals: 0,
			socket: true,
			value: false,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("lukso.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			socket: true,
			value: false,
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("eth.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		medianGasUsed: {
			title: () => {
				return i18n.t("eth.medianGasUsed");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/medianBlockGas"],
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("eth.medianBlockSize");
			},
			value: 0,
			decimals: 3,
			divide: 1000000,
			socket: true,
			after: " MB",
			wiki: ["common/stats/medianBlockSize"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("eth.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("eth.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
	}),
};

export const FLR = {
	ticker: "FLR",
	coinName: "flr",
	color: "a6153b",
	busColor: "a6153b",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://flarescan.com/tx/",
	explorerBlockUrl: "https://flarescan.com/block/",
	explorerBlocksUrl: "https://flarescan.com/blocks",
	explorerAddressUrl: "",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	addressNonces: {},
	maxBlocksToKeep: 25,
	blockFormat: [
		{
			title: () => {
				return i18n.t("eth.gu");
			},
			icon: "fas fa-oil-can",
			key: "gu",
			color: "D6CDEA",
			format: (val) => {
				return val.toLocaleString(i18n.locale);
			},
		},
		{
			title: () => {
				return "Base Fee";
			},
			key: "baseFee",
			color: "F9D8D6",
			icon: "fas fa-ticket-alt",
			format: (val) => {
				return ethUnits(val);
			},
		},
	],
	calcBlockFeeArray: function (data) {
		if (data.feeArray || !data.txFull) return;
		data.lowFee = Math.pow(10, 36);
		data.highFee = 0;
		data.feeArray = [];

		Object.values(data.txFull).forEach((tx) => {
			const gp = this.getFee(tx);
			let fee = gp - (data.baseFee || 0);
			if (tx.mpfpg && fee > Number(tx.mpfpg)) {
				fee = Number(tx.mpfpg);
			}
			fee /= 1000000000; //hardcode to gwei for now
			if (fee <= 0) fee = 0.01;
			if (fee < data.lowFee) data.lowFee = fee;
			if (fee > data.highFee) data.highFee = fee;
			data.feeArray.push(fee);
		});
		data.medianFee = Math.round(median(data.feeArray));
	},
	getFee: function (txData) {
		if (typeof txData.ty === "undefined") return 0;
		if (txData.ty === 0) {
			return txData.gp || 0;
		} else if (txData.ty === 1) {
			return txData.gp || 0;
		} else if (txData.ty === 2) {
			return txData.mfpg || 0;
		} else {
			return 0;
		}
	},
	getAndApplyFee: function (txData) {
		if (txData.feeVal) return txData.feeVal;
		txData.feeVal = this.getFee(txData);

		return txData.feeVal;
	},
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usdTransfer", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("eth.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		baseFee: {
			title: () => {
				return i18n.t("eth.baseFee");
			},
			signTitle: "Base Fee",
			value: 0,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/baseFee"],
		},

		"mempool-size": {
			title: () => {
				return i18n.t("eth.mempool-size");
			},
			signTitle: "Pending Txs",
			value: 0,
			decimals: 0,
			limit: 75000,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("flr.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("eth.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("flr.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("eth.supply-circulating");
			},
			decimals: 0,
			socket: true,
			value: false,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("flr.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			socket: true,
			value: false,
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("eth.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		medianGasUsed: {
			title: () => {
				return i18n.t("eth.medianGasUsed");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/medianBlockGas"],
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("eth.medianBlockSize");
			},
			value: 0,
			decimals: 3,
			divide: 1000000,
			socket: true,
			after: " MB",
			wiki: ["common/stats/medianBlockSize"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("eth.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("eth.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
	}),
};
//#ffe599
export const CELO = {
	ticker: "CELO",
	coinName: "CELO",
	color: "ffe599",
	busColor: "ffe599",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://explorer.celo.org/mainnet/tx/",
	explorerBlockUrl: "https://explorer.celo.org/mainnet/block/",
	explorerBlocksUrl: "https://explorer.celo.org/mainnet/blocks/",
	explorerAddressUrl: "",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	addressNonces: {},
	maxBlocksToKeep: 25,
	blockFormat: [
		{
			title: () => {
				return i18n.t("eth.gu");
			},
			icon: "fas fa-oil-can",
			key: "gu",
			color: "D6CDEA",
			format: (val) => {
				return val.toLocaleString(i18n.locale);
			},
		},
		{
			title: () => {
				return "Base Fee";
			},
			key: "baseFee",
			color: "F9D8D6",
			icon: "fas fa-ticket-alt",
			format: (val) => {
				return ethUnits(val);
			},
		},
	],
	calcBlockFeeArray: function (data) {
		if (data.feeArray || !data.txFull) return;
		data.lowFee = Math.pow(10, 36);
		data.highFee = 0;
		data.feeArray = [];

		Object.values(data.txFull).forEach((tx) => {
			const gp = this.getFee(tx);
			let fee = gp - (data.baseFee || 0);
			if (tx.mpfpg && fee > Number(tx.mpfpg)) {
				fee = Number(tx.mpfpg);
			}
			fee /= 1000000000; //hardcode to gwei for now
			if (fee <= 0) fee = 0.01;
			if (fee < data.lowFee) data.lowFee = fee;
			if (fee > data.highFee) data.highFee = fee;
			data.feeArray.push(fee);
		});
		data.medianFee = Math.round(median(data.feeArray));
	},
	getFee: function (txData) {
		if (typeof txData.ty === "undefined") return 0;
		if (txData.ty === 0) {
			return txData.gp || 0;
		} else if (txData.ty === 1) {
			return txData.gp || 0;
		} else if (txData.ty === 2) {
			return txData.mfpg || 0;
		} else {
			return 0;
		}
	},
	getAndApplyFee: function (txData) {
		if (txData.feeVal) return txData.feeVal;
		txData.feeVal = this.getFee(txData);

		return txData.feeVal;
	},
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usdTransfer", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("eth.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		baseFee: {
			title: () => {
				return i18n.t("eth.baseFee");
			},
			signTitle: "Base Fee",
			value: 0,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/baseFee"],
		},

		"mempool-size": {
			title: () => {
				return i18n.t("eth.mempool-size");
			},
			signTitle: "Pending Txs",
			value: 0,
			decimals: 0,
			limit: 75000,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("celo.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("celo.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: 0.0003,
			socket: true,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("eth.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("eth.supply-circulating");
			},
			decimals: 0,
			socket: true,
			value: false,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("eth.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			socket: true,
			value: false,
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("eth.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		medianGasUsed: {
			title: () => {
				return i18n.t("eth.medianGasUsed");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/medianBlockGas"],
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("eth.medianBlockSize");
			},
			value: 0,
			decimals: 3,
			divide: 1000000,
			socket: true,
			after: " MB",
			wiki: ["common/stats/medianBlockSize"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("eth.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("eth.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
	}),
};

export const ARBI = {
	ticker: "ARBI",
	coinName: "Arbitrum One",
	coinSlug: "Arbitrum",
	initialHouseY: 340,
	color: "299FEF",
	busColor: "299FEF",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://arbiscan.io/tx/",
	explorerBlockUrl: "https://arbiscan.io/block/",
	explorerBlocksUrl: "https://arbiscan.io/blocks",
	explorerAddressUrl: "https://arbiscan.io/address/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 100,
	addressNonces: {},
	blockFormat: ETH.blockFormat,
	calcBlockFeeArray: ETH.calcBlockFeeArray,
	getFee: ETH.getFee,
	getAndApplyFee: ETH.getAndApplyFee,
	socketBlocks: true,
	isRollup: true,
	missingRecentMultiplier: 1000,
	ignoreMissingRecent: true,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["medianFee-usdTransfer", "pendingBatchCountLive"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("eth.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("eth.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("eth.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		pendingBatchCount: {
			value: 0,
			decimals: 0,
			default: 0,
			socket: true,
			hidden: true,
		},
		pendingBatchCountLive: {
			title: "Pending Batch Count",
			value: 0,
			decimals: 0,
			default: 0,
			wiki: ["common/stats/pendingBatchSize"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("eth.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		medianGasUsed: {
			title: () => {
				return i18n.t("eth.medianGasUsed");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/medianBlockGas"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			default: 0,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
	}),
};

export const LUMIA = {
	ticker: "LUMIA",
	coinName: "LUMIA",
	coinSlug: "LUMIA",
	initialHouseY: 340,
	color: "000000",
	busColor: "000000",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://explorer.lumia.org/tx/",
	explorerBlockUrl: "https://testnet-explorer.lumia.org/block/",
	explorerBlocksUrl: "https://testnet-explorer.lumia.org/blocks",
	explorerAddressUrl: "https://testnet-explorer.lumia.org/address/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 100,
	addressNonces: {},
	blockFormat: ETH.blockFormat,
	calcBlockFeeArray: ETH.calcBlockFeeArray,
	getFee: ETH.getFee,
	getAndApplyFee: ETH.getAndApplyFee,
	socketBlocks: true,
	isRollup: true,
	missingRecentMultiplier: 1000,
	ignoreMissingRecent: true,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["medianFee-usdTransfer", "pendingBatchCountLive"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("eth.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("lumia.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("eth.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		pendingBatchCount: {
			value: 0,
			decimals: 0,
			default: 0,
			socket: true,
			hidden: true,
		},
		pendingBatchCountLive: {
			title: "Pending Batch Count",
			value: 0,
			decimals: 0,
			default: 0,
			wiki: ["common/stats/pendingBatchSize"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			default: 0,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
	}),
};

export const MANTA = {
	ticker: "MANTA",
	coinName: "Manta",
	coinSlug: "Manta",
	initialHouseY: 340,
	color: "29CCB9",
	busColor: "29CCB9",
	busCapacity: 0,
	feeVar: "gp",
	explorerTxUrl: "https://pacific-explorer.manta.network/tx/",
	explorerBlockUrl: "https://pacific-explorer.manta.network/block/",
	explorerBlocksUrl: "https://pacific-explorer.manta.network/block",
	explorerAddressUrl: "",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 100,
	addressNonces: {},
	blockFormat: ETH.blockFormat,
	calcBlockFeeArray: ETH.calcBlockFeeArray,
	getFee: ETH.getFee,
	getAndApplyFee: ETH.getAndApplyFee,
	socketBlocks: true,
	isRollup: true,
	missingRecentMultiplier: 1000,
	ignoreMissingRecent: true,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 25,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["medianFee-usdTransfer", "pendingBatchCountLive"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		ctps: {
			title: () => {
				return i18n.t("eth.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("eth.medianFee-usd");
			},
			signTitle: "Median Contract Fee",
			before: "~$",
			after: " USD",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianContractFee", "common/transaction-fees"],
		},
		"medianFee-usdTransfer": {
			title: () => {
				return i18n.t("eth.medianFee-usdTransfer");
			},
			signTitle: "Median Transfer Fee",
			after: " USD",
			before: "~$",
			value: false,
			socket: true,
			wiki: ["ETH/stats/medianTransferFee", "common/transaction-fees"],
		},
		"medianFee-gasPrice": {
			title: () => {
				return i18n.t("eth.medianFee-gasPrice");
			},
			value: false,
			socket: true,
			format: (val) => {
				return ethUnits(val);
			},
			wiki: ["ETH/stats/medianGasPrice"],
		},
		lastBlock: {
			title: () => {
				return i18n.t("eth.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		pendingBatchCount: {
			value: 0,
			decimals: 0,
			default: 0,
			socket: true,
			hidden: true,
		},
		pendingBatchCountLive: {
			title: "Pending Batch Count",
			value: 0,
			decimals: 0,
			default: 0,
			wiki: ["common/stats/pendingBatchSize"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("eth.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		gasLimit: {
			title: () => {
				return i18n.t("eth.gasLimit");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasLimit"],
		},
		gasTarget: {
			title: () => {
				return i18n.t("eth.gasTarget");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/gasTarget"],
		},
		medianGasUsed: {
			title: () => {
				return i18n.t("eth.medianGasUsed");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["ETH/stats/medianBlockGas"],
		},
		gasUsedDif: {
			title: () => {
				return i18n.t("eth.gasUsedDif");
			},
			value: 100,
			decimals: 2,
			socket: true,
			after: "%",
			wiki: ["ETH/stats/gasUsedDif"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("eth.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			default: 0,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
	}),
};

export const BCH = {
	ticker: "BCH",
	coinName: "Bitcoin Cash",
	color: "2db300",
	busColor: "32c06b",
	busCapacity: 32000000,
	feeVar: "spb",
	explorerTxUrl: "https://explorer.bitcoin.com/bch/tx/",
	explorerBlockUrl: "https://explorer.bitcoin.com/bch/block/",
	explorerBlocksUrl: "https://explorer.bitcoin.com/bch/blocks",
	explorerAddressUrl: "https://explorer.bitcoin.com/bch/address/",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 10,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 3,
			restart: false,
			value: 2,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usd", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("bch.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("bch.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"mempool-bytes": {
			title: () => {
				return i18n.t("bch.mempool-bytes");
			},
			after: " MB",
			divide: 1000000,
			decimals: 3,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-size", "common/mempool"],
		},
		"mempool-size": {
			title: () => {
				return i18n.t("bch.mempool-size");
			},
			signTitle: "Pending Txs",
			decimals: 0,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("bch.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-satPerByte": {
			title: () => {
				return i18n.t("bch.medianFee-satPerByte");
			},
			common: "medianFeeSat",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-satPerByte", "common/transaction-fees"],
		},
		bps: {
			title: () => {
				return i18n.t("bch.bps");
			},
			decimals: 0,
			after: " B",
			value: false,
			socket: true,
			wiki: ["common/stats/bps"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("bch.supply-circulating");
			},
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("bch.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => {
				return i18n.t("bch.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("bch.medianTxsPerBlock");
			},
			value: 0,
			socket: true,
			decimals: 0,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		difficulty: {
			title: () => {
				return i18n.t("bch.difficulty");
			},
			value: false,
			socket: true,
			decimals: 0,
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("bch.medianBlockSize");
			},
			decimals: 3,
			divide: 1000000,
			after: " MB",
			value: false,
			socket: true,
			wiki: ["common/stats/medianBlockSize"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("bch.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("bch.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("bch.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		halving: {
			title: () => {
				return i18n.t("bch.halving");
			},
			signTitle: "Halving in",
			value: false,
		},
	}),
};

export const XMR = {
	ticker: "XMR",
	coinName: "Monero",
	color: "f16822",
	busColor: "f18b4f",
	busCapacity: 1000000,
	feeVar: "nByte",
	explorerTxUrl: "https://monerovision.com/#/tx/",
	explorerBlockUrl: "https://monerovision.com/#/block/",
	explorerBlocksUrl: "https://monerovision.com/#/blocks",
	liveTxs: [],
	liveBlocks: [],
	houseArray: [],
	maxBlocksToKeep: 20,
	userSettings: {
		blockNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.block", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		txNotifications: {
			title: () => {
				return i18n.t("settings.browser-notifications") + " (" + i18n.tc("general.transaction", 2) + ")";
			},
			type: "checkbox",
			restart: false,
			value: true,
			writable: true,
		},
		maxBuses: {
			title: () => {
				return i18n.t("settings.max-buses");
			},
			type: "range",
			min: 1,
			max: 100,
			restart: false,
			value: 10,
			writable: true,
		},
		signArray: {
			title: "Sign Display",
			type: "multiselect",
			value: ["lastBlock", "medianFee-usd", "mempool-size"],
			writable: true,
			invisible: true,
			restart: false,
		},
	},
	stats: Vue.observable({
		tps: {
			title: () => {
				return i18n.t("xmr.tps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/tps"],
		},
		ctps: {
			title: () => {
				return i18n.t("xmr.ctps");
			},
			decimals: 2,
			value: false,
			socket: true,
			wiki: ["common/stats/ctps"],
		},
		"mempool-bytes": {
			title: () => {
				return i18n.t("xmr.mempool-bytes");
			},
			after: " MB",
			divide: 1000000,
			decimals: 3,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-size", "common/mempool"],
		},
		"mempool-size": {
			title: () => {
				return i18n.t("xmr.mempool-size");
			},
			signTitle: "Pending Txs",
			decimals: 0,
			value: false,
			socket: true,
			wiki: ["common/stats/mempool-count", "common/mempool"],
		},
		"medianFee-usd": {
			title: () => {
				return i18n.t("xmr.medianFee-usd");
			},
			signTitle: "Median Tx Fee",
			before: "$",
			value: false,
			socket: true,
			wiki: ["common/stats/medianFee-usd", "common/transaction-fees"],
		},
		"medianFee-fee": {
			title: () => {
				return i18n.t("xmr.medianFee-fee");
			},
			decimals: 8,
			signTitle: "Median Tx Fee (XMR)",
			value: false,
			socket: true,
			wiki: ["XMR/stats/medianFeeXMR", "common/stats/transaction-fees"],
		},
		"medianFee-aByte": {
			title: () => {
				return i18n.t("xmr.medianFee-aByte");
			},
			common: "medianFeeSat",
			divide: 1000,
			decimals: 1,
			value: false,
			socket: true,
			wiki: ["XMR/stats/medianFee-aByte"],
		},
		bps: {
			title: () => {
				return i18n.t("xmr.bps");
			},
			decimals: 0,
			after: " B",
			value: false,
			socket: true,
			wiki: ["common/stats/bps"],
		},
		"supply-circulating": {
			title: () => {
				return i18n.t("xmr.supply-circulating");
			},
			decimals: 0,
			value: false,
			socket: true,
		},
		"fiatPrice-usd": {
			title: () => {
				return i18n.t("xmr.fiatPrice-usd");
			},
			decimals: 2,
			before: "$",
			value: false,
			socket: true,
		},
		lastBlock: {
			title: () => {
				return i18n.t("xmr.lastBlock");
			},
			value: false,
			wiki: ["common/stats/lastBlock", "common/block-time"],
		},
		medianTxsPerBlock: {
			title: () => {
				return i18n.t("xmr.medianTxsPerBlock");
			},
			value: 0,
			decimals: 0,
			socket: true,
			wiki: ["common/stats/medianTxsPerBlock"],
		},
		blockchainSize: {
			title: () => {
				return i18n.t("xmr.blockchainSize");
			},
			decimals: 2,
			after: " MB",
			divide: 1000000,
			value: false,
			socket: true,
		},
		difficulty: {
			title: () => {
				return i18n.t("xmr.difficulty");
			},
			value: false,
			decimals: 0,
			socket: true,
		},
		medianBlockSize: {
			title: () => {
				return i18n.t("xmr.medianBlockSize");
			},
			decimals: 3,
			divide: 1000000,
			after: " MB",
			value: false,
			socket: true,
			wiki: ["common/stats/medianBlockSize"],
		},
		blockSizeLimit: {
			title: () => {
				return i18n.t("xmr.blockSizeLimit");
			},
			decimals: 3,
			divide: 1000000,
			after: " MB",
			value: false,
			socket: true,
			wiki: ["XMR/stats/currentBlockSizeLimit"],
		},
		medianBlockTime: {
			title: () => {
				return i18n.t("xmr.medianBlockTime");
			},
			value: 0,
			timeAgo: true,
			socket: true,
			wiki: ["common/stats/medianBlockTime", "common/block-time"],
		},
		blockHeight: { hidden: true, value: false },
		"marketCap-usd": {
			title: () => {
				return i18n.t("xmr.marketCap-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
		"volume-usd": {
			title: () => {
				return i18n.t("xmr.volume-usd");
			},
			before: "$",
			decimals: 0,
			value: false,
			socket: true,
		},
	}),
};

export const commonTitleOverrides = {
	medianFeeSat: "Median Fee Per Byte",
	bps: "Bytes Per Second",
};

export const enabledConfig = {
	ETH,
	BTC,
	BCH,
	DASH,
	EVOLUTION,
	XMR,
	LTC,
	ARBI,
	LUMIA,
	XION,
	// MANTA,
	// CELO,
	LUKSO,
	// FLR,
};

export const additionalSheets = {
	mall: {
		key: "mall",
		frames: [
			"mall.png",
			"eth_post.png",
			"walkway.png",
			"eth_post_desk.png",
			"rollup_sign.png",
			"rollup_sign_right.png",
			"envelope.png",
		],
	},
};

export const themes = {
	default: {
		key: "default",
		title: () => {
			return i18n.t("general.default");
		},
		frames: [""],
		backgroundColor: "#558259",
		curbWidth: 8,
		houseCurbWidth: 9,
		signPoleHeight: 151,
		signPolePadding: 0,
		stoplightPadding: 0,
		signBgColor: 0x212121,
		signFontColor: "#d8800e",
	},
	holiday: {
		key: "holiday",
		title: () => {
			return i18n.t("general.holiday");
		},
		frames: [
			"snow.png",
			"bushes.png",
			"curb.png",
			"door.png",
			"house_overlay.png",
			"lane.png",
			"road.png",
			"sign_pole.png",
			"stoplight.png",
			"stoplight_sign.png",
		],
		backgroundColor: "#eff0ef",
		houseOverlay: true,
		scrollLane: true,
		scrollHouseCurb: true,
		curbWidth: 18,
		houseCurbWidth: 19,
		signPoleHeight: 157,
		signPolePadding: 6,
		stoplightPadding: 5,
		signBgColor: 0x1d6e04,
		signFontColor: "#f9f9f9",
		effects: ["snowfall"],
	},
};

export const userSettings = {
	globalSettings: {
		autoLoad: {
			title: "Auto Launch",
			type: "checkbox",
			restart: false,
			value: function () {
				return window.mainVue.autoLoad;
			},
			writable: true,
		},
		resWidth: {
			title: () => {
				return i18n.t("settings.res-width");
			},
			type: "range",
			min: 960,
			max: 1920,
			restart: true,
			value:
				window.screen.width * window.devicePixelRatio >= 960
					? window.screen.width * window.devicePixelRatio <= 1920
						? window.screen.width * window.devicePixelRatio
						: 1920
					: 960,
			writable: true,
		},
		fps: {
			title: () => {
				return i18n.t("settings.fps");
			},
			type: "range",
			min: 10,
			max: 60,
			restart: true,
			value: 60,
			writable: true,
		},
		html: {
			value: true,
			writable: false,
		},
		animations: {
			title: () => {
				return i18n.t("settings.animations");
			},
			type: "checkbox",
			restart: true,
			value: true,
			writable: true,
		},
		nfts: {
			value: true,
			writable: false,
		},
		antialias: {
			title: () => {
				return i18n.t("settings.antialias");
			},
			type: "checkbox",
			restart: true,
			value: true,
			writable: true,
		},
		movements: {
			value: true,
			writable: false,
		},
		theme: {
			title: () => {
				return i18n.t("settings.theme");
			},
			type: "dropdown",
			restart: true,
			value: "default",
			options: [],
			writable: true,
		},
		openRoofs: {
			title: () => {
				return i18n.t("settings.open-roofs");
			},
			type: "checkbox",
			restart: false,
			value: false,
			writable: true,
		},
		darkMode: {
			title: "Dark Mode",
			type: "checkbox",
			restart: false,
			value: function () {
				return window.mainVue.darkMode;
			},
			writable: true,
		},
		followIcons: {
			value: false,
			writable: false,
		},
	},
};
//add street settings to userSettings object
for (const ticker in enabledConfig) {
	enabledConfig[ticker].apiUrl = process.env.VUE_APP_REST_API;
	enabledConfig[ticker].coinSlug = enabledConfig[ticker].coinName.replace(/\s/g, "");
	enabledConfig[ticker].coinSlug.charAt(0).toUpperCase() + enabledConfig[ticker].coinSlug.slice(1);
	userSettings[enabledConfig[ticker].ticker + "Settings"] = enabledConfig[ticker].userSettings;
	if (typeof enabledConfig[ticker].getAndApplyFee === "undefined")
		enabledConfig[ticker].getAndApplyFee = function (data) {
			data.feeVal = data[this.feeVar];
			return data[this.feeVar];
		};
	if (typeof enabledConfig[ticker].calcBlockFeeArray === "undefined")
		enabledConfig[ticker].calcBlockFeeArray = function (data) {
			let dataFee = generalCalcBlockFeeArray(data, ticker);
			return dataFee;
		};
}
for (const theme in themes) {
	userSettings.globalSettings.theme.options.push(themes[theme]);
}

//load values from localstorage
export const applySavedSettings = () => {
	for (const settingsKey in userSettings) {
		let settings = userSettings[settingsKey];
		let loaded = localStorage.getItem(settingsKey);
		let parsed = loaded ? JSON.parse(loaded) : false;
		for (const settingKey in settings) {
			if (parsed) {
				if (typeof parsed[settingKey] !== "undefined") {
					//value found in localstorage
					userSettings[settingsKey][settingKey].value = parsed[settingKey];
					userSettings[settingsKey][settingKey].initialUserLoaded = true;
				}
			}
			userSettings[settingsKey][settingKey].newValue = userSettings[settingsKey][settingKey].value;
		}
	}
};
applySavedSettings();

export const config = {
	resolution: userSettings.globalSettings.resWidth.value / 1920,
	vPadding: 0,
	antialias: userSettings.globalSettings.antialias.value,
	render: {
		antialias: userSettings.globalSettings.antialias.value,
	},
	fps: {
		target: userSettings.globalSettings.fps.value,
		min: userSettings.globalSettings.fps.value,
		forceSetTimeOut: userSettings.globalSettings.fps.value < 60,
	},
	disabledStreets: [
		// "Ethereum"
	],
	baseUrl: "/",
	path:
		window.location.protocol +
		"//" +
		window.location.hostname +
		(window.location.port ? ":" + window.location.port : ""),
	dev: process.env.NODE_ENV == "development",
	theme: themes[userSettings.globalSettings.theme.value],
	locale: "en",
};

export const zoomerNames = ["bat", "bear", "bull", "frog", "lion", "lizard", "monkey", "penguin", "unicorn", "wolf"];
export const genesisNames = [
	"helper",
	"santa",
	"snowman",
	"isabella",
	"flash",
	"blob",
	"ps",
	"dash",
	"alien",
	"mib",
	"moonboy",
	"mailman",
	"ltc",
	"lester",
];
export const moonheadNames = zoomerNames.concat(genesisNames);

export const charConfig = {
	default: {
		scaleAdjust: 1,
		defaultFlip: false,
		contract: "0x76ad70096b373dce5c2bf44eb9a9f8ecbb1c0b93",
	},
	"moonheads-zoomers": {
		scaleAdjust: 1,
		defaultFlip: false,
		contract: "0x1542b05412dfecd80e734929f9087f8766934275",
	},
	cryptopunks: {
		scaleAdjust: 4,
		defaultFlip: true,
		pixelArt: true,
		contract: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
	},
	evmavericks: {
		scaleAdjust: 1.3,
		defaultFlip: true,
		contract: "0x7ddaa898d33d7ab252ea5f89f96717c47b2fee6es",
	},
	"proof-moonbirds": {
		scaleAdjust: 2,
		defaultFlip: true,
		pixelArt: true,
		contract: "0x23581767a106ae21c074b2276d25e5c3e136a68b",
	},
	larvachads: {
		scaleAdjust: 2.5,
		defaultFlip: true,
		pixelArt: true,
		contract: "0x8fa600364b93c53e0c71c7a33d2ade21f4351da3",
	},
	"geviennaratives-by-cryptowiener": {
		scaleAdjust: 4,
		defaultFlip: true,
		pixelArt: true,
		contract: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
	},
	boredapeyachtclub: {
		scaleAdjust: 1,
		defaultFlip: true,
		pixelArt: false,
		contract: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
	},
	milady: {
		scaleAdjust: 0.5,
		defaultFlip: true,
		pixelArt: false,
		contract: "0x5af0d9827e0c53e4799bb226655a1de152a425a5",
	},
	//pudgypenguins
	pudgypenguins: {
		scaleAdjust: 0.5,
		defaultFlip: true,
		pixelArt: false,
		contract: "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
	},
	doodles: {
		scaleAdjust: 1,
		defaultFlip: true,
		pixelArt: false,
		contract: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
	},
	beanz: {
		scaleAdjust: 1,
		defaultFlip: false,
		pixelArt: false,
		contract: "0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949",
	},
};
charConfig.moonheads = charConfig.default;
