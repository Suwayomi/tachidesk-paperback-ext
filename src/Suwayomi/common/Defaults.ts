import {
    HomeSection
} from "@paperback/types";

import {
    Category, Sources
} from "./Queries";

// Interface used by getHomePageSections
export interface HomepageSectionDetails {
    section: HomeSection,
    query: string,
    variables?: {}
}

// Default manga in case of server error
export const serverUnavailableMangaTiles = () => {
    return [
        App.createPartialSourceManga({
            title: "Server",
            image: "",
            mangaId: "placeholder-id",
            subtitle: "Unavailable"
        })
    ]
}

// TODO: Move to States
export const DEFAULT_SERVER_CATEGORY: Category = {
    id: 0,
    order: 0,
    name: "Default"
}
export const DEFAULT_SERVER_CATEGORIES: Category[] = [DEFAULT_SERVER_CATEGORY];
export const DEFAULT_SERVER_SOURCE: Sources = {
    id: "0",
    displayName: "Local source",
    lang: "localsourcelang",
    supportsLatest: true
}
export const DEFAULT_SERVER_SOURCES: Sources[] = [DEFAULT_SERVER_SOURCE]

export const languages: Record<string, string> = {
    'ar': 'اَلْعَرَبِيَّةُ', // Arabic
    'bg': 'български', // Bulgarian
    'bn': 'বাংলা', // Bengali
    'ca': 'Català', // Catalan
    'cs': 'Čeština', // Czech
    'da': 'Dansk', // Danish
    'de': 'Deutsch', // German
    'en': 'English', // English
    'es': 'Español', // Spanish
    'es-419': 'Español (Latinoamérica)', // Spanish (Latin American)
    'fa': 'فارسی', // Farsi
    'fi': 'Suomi', // Finnish
    'fr': 'Français', // French
    'he': 'עִבְרִית', // Hebrew
    'hi': 'हिन्दी', // Hindi
    'hu': 'Magyar', // Hungarian
    'id': 'Indonesia', // Indonesian
    'it': 'Italiano', // Italian
    'ja': '日本語', // Japanese
    'ko': '한국어', // Korean
    'lt': 'Lietuvių', // Lithuanian
    'mn': 'монгол', // Mongolian
    'ms': 'Melayu', // Malay
    'my': 'မြန်မာဘာသာ', // Burmese
    'nl': 'Nederlands', // Dutch
    'no': 'Norsk', // Norwegian
    'pl': 'Polski', // Polish
    'pt': 'Português', // Portuguese
    'pt-BR': 'Português (Brasil)', // Portuguese (Brazilian)
    'ro': 'Română', // Romanian
    'ru': 'Pусский', // Russian
    'sr': 'Cрпски', // Serbian
    'sv': 'Svenska', // Swedish
    'th': 'ไทย', // Thai
    'tl': 'Filipino', // Tagalog
    'tr': 'Türkçe', // Turkish
    'uk': 'Yкраї́нська', // Ukrainian
    'vi': 'Tiếng Việt', // Vietnamese
    'zh-Hans': '中文 (简化字)', // Chinese (Simplified)
    'zh-Hant': '中文 (繁體字)', // Chinese (Traditional)
}