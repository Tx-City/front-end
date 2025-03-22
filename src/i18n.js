import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import supportedLocales from "./locales";
import { formatDistanceStrict } from "date-fns";

export { supportedLocales };

function loadLocaleMessages() {
	const messages = {};
	for (const key in supportedLocales) {
		messages[key] = supportedLocales[key].messages;
	}
	return messages;
}

export function getBrowserLocale(options = {}) {
	const defaultOptions = { countryCodeOnly: false };
	const opt = { ...defaultOptions, ...options };
	const navigatorLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
	if (!navigatorLocale) {
		return undefined;
	}
	const trimmedLocale = opt.countryCodeOnly ? navigatorLocale.trim().split(/-|_/)[0] : navigatorLocale.trim();
	return trimmedLocale;
}

export function getStartingLocale() {
	const browserLocale = getBrowserLocale({ countryCodeOnly: true });
	if (Object.keys(supportedLocales).includes(browserLocale)) {
		return browserLocale;
	} else {
		return process.env.VUE_APP_I18N_LOCALE || "en";
	}
}

const i18n = createI18n({
	locale: getStartingLocale(),
	fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
	messages: loadLocaleMessages(),
	legacy: false, // Set to true if using Vue 2 API style in Vue 3
});

export function fds(date1, date2, options) {
	// For Vue 3, we need to use i18n.global.locale.value to get current locale
	const currentLocale = i18n.global.locale.value;
	const locale =
		supportedLocales[currentLocale] && supportedLocales[currentLocale].fns
			? supportedLocales[currentLocale].fns
			: undefined;

	return formatDistanceStrict(date1, date2, {
		...options,
		...(locale ? { locale } : {}),
	});
}

export default i18n;
