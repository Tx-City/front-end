const dayjs = require("dayjs");
require("dayjs/locale/de");

const supportedLocales = {
	en: {
		title: "English",
		fns: dayjs,
		messages: require("./en.json"),
	},
	de: {
		title: "Deutsche",
		fns: dayjs,
		messages: require("./de.json"),
	},
};

module.exports = supportedLocales;
