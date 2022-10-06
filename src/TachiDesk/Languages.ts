import { LanguageCode } from "paperback-extensions-common";

const reverseLangCode: { [x: string]: LanguageCode } = {
    _unknown: LanguageCode.UNKNOWN,
    bn: LanguageCode.BENGALI,
    bg: LanguageCode.BULGARIAN,
    // 'br': LanguageCode.BRAZILIAN,         // use pt: Portuguese
    zs: LanguageCode.CHINEESE, // CHINESE
    cs: LanguageCode.CZECH,
    de: LanguageCode.GERMAN,
    da: LanguageCode.DANISH,
    en: LanguageCode.ENGLISH,
    es: LanguageCode.SPANISH,
    fi: LanguageCode.FINNISH,
    fr: LanguageCode.FRENCH,
    el: LanguageCode.GREEK,
    // 'hk': LanguageCode.CHINEESE_HONGKONG,
    hu: LanguageCode.HUNGARIAN,
    id: LanguageCode.INDONESIAN,
    he: LanguageCode.ISRELI, // HEBREW
    hi: LanguageCode.INDIAN, // HINDI
    fa: LanguageCode.IRAN, // PERSIAN
    it: LanguageCode.ITALIAN,
    ja: LanguageCode.JAPANESE,
    ko: LanguageCode.KOREAN,
    lt: LanguageCode.LITHUANIAN,
    mn: LanguageCode.MONGOLIAN,
    // 'mx': LanguageCode.MEXIAN,        // use es: Spanish
    // 'my': LanguageCode.MALAY,
    nl: LanguageCode.DUTCH,
    no: LanguageCode.NORWEGIAN,
    fil: LanguageCode.PHILIPPINE, // FILIPINO
    pl: LanguageCode.POLISH,
    pt: LanguageCode.PORTUGUESE,
    ro: LanguageCode.ROMANIAN,
    ru: LanguageCode.RUSSIAN,
    sa: LanguageCode.SANSKRIT,
    // 'si': LanguageCode.SAMI,
    th: LanguageCode.THAI,
    tr: LanguageCode.TURKISH,
    uk: LanguageCode.UKRAINIAN,
    vi: LanguageCode.VIETNAMESE,
};

export const parseLangCode = (code: string) => {
    // The code can have the format 'en' or 'en-gb'.
    // We only use the first 2 or 3 letters.

    // There is 1 three letters code
    if (code.substr(0, 3) === "fil") {
        return LanguageCode.PHILIPPINE;
    }

    // Other are two letters codes
    return reverseLangCode[code.substr(0, 2)] ?? LanguageCode.UNKNOWN;
};
