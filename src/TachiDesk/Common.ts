import {
    RequestManager,
    SourceStateManager
} from '@paperback/types'

export function serverUnavailableMangaTiles() {
    return [
        App.createPartialSourceManga({
            title: "Server",
            image: "",
            mangaId: "placeholder-id",
            subtitle: "Unavailable"
        })
    ]
}

// StateManager Keys
export const SERVER_URL_KEY = "serverURL";
export const SERVER_API_KEY = "serverAPI";
export const AUTH_STATE_KEY = "AuthState";
export const AUTH_STRING_KEY = "AuthString";
export const USERNAME_KEY = "serverUsername";
export const PASSWORD_KEY = "serverPassword";

export const SERVER_CATEGORIES_KEY = "serverCategories";
export const SELECTED_CATEGORIES_KEY = "selectedCategories";

export const SERVER_SOURCES_KEY = "serverSources";
export const SELECTED_SOURCES_KEY = "selectedSources";

export const SELECTED_LANGUAGES_KEY = "selectedLanguages"

export const MANGA_PER_ROW_KEY = "mangaPerRow"
export const UPDATED_ROW_STATE_KEY = "updatedRowState"
export const CATEGORY_ROW_STATE_KEY = "categoryRowState"
export const SOURCE_ROW_STATE_KEY = "sourceRowState"
export const UPDATED_ROW_STYLE_KEY = "updatedRowStyle"
export const CATEGORY_ROW_STYLE_KEY = "categoryRowStyle"
export const SOURCE_ROW_STYLE_KEY = "sourceRowStyle"

// Defaults
export const DEFAULT_SERVER_URL = "http://127.0.0.1:4567/";
export const DEFAULT_API_ENDPOINT = "api/v1/";
export const DEFAULT_SERVER_API = DEFAULT_SERVER_URL + DEFAULT_API_ENDPOINT;
export const DEFAULT_AUTH_STATE = false;
export const DEFAULT_AUTH_STRING = "";
export const DEFAULT_USERNAME = "";
export const DEFAULT_PASSWORD = "";

export const DEFAULT_SERVER_CATEGORY: tachiCategory = {
    id: 0,
    order: 0,
    name: "Default",
    default: true,
    size: 0,
    includeInUpdate: "EXCLUDE",
    meta: {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
    }
}
export const DEFAULT_SERVER_CATEGORIES: Record<string, tachiCategory> = { "0": DEFAULT_SERVER_CATEGORY };
export const DEFAULT_SELECTED_CATEGORIES = ["0"];

export const DEFAULT_SERVER_SOURCE: tachiSources = {
    id: "0",
    name: "Local source",
    lang: "localsourcelang",
    iconUrl: "/api/v1/extension/icon/localSource",
    supportsLatest: true,
    isConfigurable: false,
    isNsfw: false,
    displayName: "Local source"
}
export const DEFAULT_SERVER_SOURCES: Record<string, tachiSources> = {
    "0": DEFAULT_SERVER_SOURCE
}
export const DEFAULT_SELECTED_SOURCES = ["0"]

export const DEFAULT_SELECTED_LANGUAGES = ["localsourcelang", "en"]

export const DEFAULT_MANGA_PER_ROW = 10;
export const DEFAULT_UPDATED_ROW_STATE = true
export const DEFAULT_CATEGORY_ROW_STATE = true
export const DEFAULT_SOURCE_ROW_STATE = true
export const DEFAULT_UPDATED_ROW_STYLE = ["singleRowNormal"]
export const DEFAULT_CATEGORY_ROW_STYLE = ["singleRowNormal"]
export const DEFAULT_SOURCE_ROW_STYLE = ["singleRowNormal"]

export const rowStyles = ["singleRowNormal", "singleRowLarge", "featured", "doubleRow"]
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

// ! Query Interfaces Start
// interface categories
export interface tachiCategory {
    id: number,
    order: number,
    name: string,
    default: boolean,
    size: number,
    includeInUpdate: string,
    meta: any
}

export interface tachiSources {
    "id": string,
    "name": string,
    "lang": string,
    "iconUrl": string,
    "supportsLatest": boolean,
    "isConfigurable": boolean,
    "isNsfw": boolean,
    "displayName": string
}

export interface tachiManga {
    "id": number,
    "sourceId": string,
    "url": string,
    "title": string,
    "thumbnailUrl": string,
    "thumbnailUrlLastFetched": number,
    "initialized": boolean,
    "artist": string,
    "author": string,
    "description": string,
    "genre": string[],
    "status": string,
    "inLibrary": boolean,
    "inLibraryAt": number,
    "source": tachiSources,
    "meta": any,
    "realUrl": string,
    "lastFetchedAt": number,
    "chaptersLastFetchedAt": number,
    "updateStrategy": string,
    "freshData": boolean,
    "unreadCount": number,
    "downloadCount": number,
    "chapterCount": number,
    "lastReadAt": number,
    "lastChapterRead"?: tachiChapter,
    "age": number,
    "chaptersAge": number
}

export interface tachiChapter {
    "id": number,
    "url": string,
    "name": string,
    "uploadDate": number,
    "chapterNumber": number,
    "scanlator": string,
    "mangaId": number,
    "read": boolean,
    "bookmarked": boolean,
    "lastPageRead": number,
    "lastReadAt": number,
    "index": number,
    "fetchedAt": number,
    "realUrl": string,
    "downloaded": boolean,
    "pageCount": number,
    "chapterCount": number,
    "meta": any
}

// ! Query Interfaces End

// ! Reset Settings Begin
export async function resetSettings(stateManager: SourceStateManager) {
    await stateManager.store(SERVER_URL_KEY, DEFAULT_SERVER_URL)
    await stateManager.store(SERVER_API_KEY, DEFAULT_SERVER_API)
    await stateManager.store(AUTH_STATE_KEY, DEFAULT_AUTH_STATE)
    await stateManager.keychain.store(AUTH_STRING_KEY, DEFAULT_AUTH_STRING)
    await stateManager.store(USERNAME_KEY, DEFAULT_USERNAME)
    await stateManager.keychain.store(PASSWORD_KEY, DEFAULT_PASSWORD)
    await stateManager.store(SERVER_CATEGORIES_KEY, DEFAULT_SERVER_CATEGORIES)
    await stateManager.store(SELECTED_CATEGORIES_KEY, DEFAULT_SELECTED_CATEGORIES)
    await stateManager.store(SERVER_SOURCES_KEY, DEFAULT_SERVER_SOURCES)
    await stateManager.store(SELECTED_SOURCES_KEY, DEFAULT_SELECTED_SOURCES)
    await stateManager.store(MANGA_PER_ROW_KEY, DEFAULT_MANGA_PER_ROW)
    await stateManager.store(UPDATED_ROW_STATE_KEY, DEFAULT_UPDATED_ROW_STATE)
    await stateManager.store(CATEGORY_ROW_STATE_KEY, DEFAULT_CATEGORY_ROW_STATE)
    await stateManager.store(SOURCE_ROW_STATE_KEY, DEFAULT_SOURCE_ROW_STATE)
    await stateManager.store(UPDATED_ROW_STYLE_KEY, DEFAULT_UPDATED_ROW_STYLE)
    await stateManager.store(CATEGORY_ROW_STYLE_KEY, DEFAULT_CATEGORY_ROW_STYLE)
    await stateManager.store(SOURCE_ROW_STYLE_KEY, DEFAULT_SOURCE_ROW_STYLE)
    await stateManager.store(SELECTED_LANGUAGES_KEY, DEFAULT_SELECTED_LANGUAGES)
}
// ! Reset Settings End

// ! Server URL start

export async function setServerURL(stateManager: SourceStateManager, url: string, typed = false) {
    // * since every key press is a value set() and get(), the override which ensuring that the URL always has a backslash won't let people delete it
    // ! typed is a boolean that we set to true only when being entered by the DUIInputField, skipping the override when typing the url
    // ! atleast until user hits submit.
    if (!typed) {
        url = url == "" ? DEFAULT_SERVER_URL : url
        url = url.slice(-1) === '/' ? url : url + "/" // Verified / at the end of URL
    }

    await stateManager.store(SERVER_URL_KEY, url)
    await stateManager.store(SERVER_API_KEY, url + DEFAULT_API_ENDPOINT)
}

export async function getServerURL(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_URL_KEY) as string | undefined) ?? DEFAULT_SERVER_URL
}

// Get Server API url (i.e. http://127.0.0.1/api/v1/)
export async function getServerAPI(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_API_KEY) as string | undefined) ?? DEFAULT_SERVER_API
}
// !Server URL End

// ! Authentication start
export async function setAuthState(stateManager: SourceStateManager, state: boolean) {
    await stateManager.store(AUTH_STATE_KEY, state)
}

export async function getAuthState(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(AUTH_STATE_KEY) as boolean | undefined) ?? DEFAULT_AUTH_STATE
}

export async function setAuthString(stateManager: SourceStateManager) {
    let username = await getUsername(stateManager);
    let password = await getPassword(stateManager);

    let authString = 'Basic ' + Buffer.from(username + ':' + password, 'binary').toString('base64'); // Base64 of username:password
    await stateManager.keychain.store(AUTH_STRING_KEY, authString);
}

export async function getAuthString(stateManager: SourceStateManager) {
    return (await stateManager.keychain.retrieve(AUTH_STRING_KEY) as string | undefined) ?? DEFAULT_AUTH_STRING;
}

export async function setUsername(stateManager: SourceStateManager, username: string) {
    await stateManager.store(USERNAME_KEY, username);
    await setAuthString(stateManager) // Set new auth string based on new username
}

export async function getUsername(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(USERNAME_KEY) as string | undefined) ?? DEFAULT_USERNAME;
}

export async function setPassword(stateManager: SourceStateManager, password: string) {
    await stateManager.keychain.store(PASSWORD_KEY, password);
    await setAuthString(stateManager); // Set new auth string based on new username
}

export async function getPassword(stateManager: SourceStateManager) {
    return (await stateManager.keychain.retrieve(PASSWORD_KEY) as string | undefined) ?? DEFAULT_PASSWORD;
}
// ! Authentication End

// ! Requests
export async function makeRequest(stateManager: SourceStateManager, requestManager: RequestManager, apiEndpoint: string, method = "GET", data?: Record<string, string> | string, headers: Record<string, string> = {}) {
    const serverAPI = await getServerAPI(stateManager)

    const request = App.createRequest({
        url: serverAPI + apiEndpoint,
        method,
        data,
        headers
    })

    let response;
    let responseStatus;
    let responseData;

    // Checks if the request actually went out
    try {
        response = await requestManager.schedule(request, 0);
    }
    catch (error: any) {
        return new Error(serverAPI + apiEndpoint)
    }

    // Checks if we got a response, then checks if we got a good response
    try {
        responseStatus = response?.status
    }
    catch (error: any) {
        return Error("Couldn't connect to server.")
    }
    if (responseStatus == 401) {
        return Error("Unauthorized" + " " + JSON.stringify(await getAuthString(stateManager)))
    }

    if (responseStatus != 200) {
        return Error("Your query is invalid. " + JSON.stringify(response?.status))
    }

    // Checks for garbage data
    try {
        responseData = JSON.parse(response.data ?? "")
    }
    catch (error: any) {
        return Error(apiEndpoint)
    }

    return responseData
}

// Requests used for the test server button. Could be useful to test connection at other points
export async function testRequest(stateManager: SourceStateManager, requestManager: RequestManager) {
    return await makeRequest(stateManager, requestManager, "settings/about/")
}
// ! Requests End

// ! Categories Start
// Fetch Categories from server and returns them as a record
export async function fetchServerCategories(stateManager: SourceStateManager, requestManager: RequestManager) {
    let categories: Record<string, tachiCategory> = {};

    const fetchedCategories = await makeRequest(stateManager, requestManager, "category/");

    if (fetchedCategories instanceof Error) {
        throw new Error("Failed to fetch categories.")
    }
    fetchedCategories.forEach((category: tachiCategory) => {
        categories[JSON.stringify(category.id)] = category
    });

    return categories
}

export async function setServerCategories(stateManager: SourceStateManager, categories: Record<string, tachiCategory>) {
    await stateManager.store(SERVER_CATEGORIES_KEY, categories)
}

export async function getServerCategories(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_CATEGORIES_KEY) as Record<string, tachiCategory> | undefined) ?? DEFAULT_SERVER_CATEGORIES
}

export async function setSelectedCategories(stateManager: SourceStateManager, selectedCategories: string[]) {
    await stateManager.store(SELECTED_CATEGORIES_KEY, selectedCategories)
}

export async function getSelectedCategories(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SELECTED_CATEGORIES_KEY) as string[] | undefined) ?? DEFAULT_SELECTED_CATEGORIES;
}

export function getCategoriesIds(categories: Record<string, tachiCategory>) {
    let categoryIds: string[] = [];
    Object.values(categories).forEach(category => {
        categoryIds.push(JSON.stringify(category.id))
    })

    return categoryIds
}

export function getCategoryFromId(categories: Record<string, tachiCategory>, id: string): tachiCategory {
    return categories[id] ?? DEFAULT_SERVER_CATEGORY
}

// categoryName is used to give a name to old entries which are no longer in the server
export function getCategoryNameFromId(categories: Record<string, tachiCategory>, id: string) {
    let categoryName = "OLD ENTRY OR ERROR"
    Object.values(categories).forEach(category => {
        if (JSON.stringify(category.id) == id) {
            categoryName = category.name
        }
    })

    return categoryName
}
// ! Categories End

// ! Sources Start
// Fetch Sources from server and return as record
export async function fetchServerSources(stateManager: SourceStateManager, requestManager: RequestManager) {
    let sources: Record<string, tachiSources> = {};

    const fetchedSources = await makeRequest(stateManager, requestManager, "source/list")

    if (fetchedSources instanceof Error) {
        throw new Error("Failed to fetch sources.")
    }

    fetchedSources.forEach((source: tachiSources) => {
        sources[source.id] = source
    });

    return sources
}

export async function setServerSources(stateManager: SourceStateManager, sources: Record<string, tachiSources>) {
    await stateManager.store(SERVER_SOURCES_KEY, sources);
}

export async function getServerSources(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_SOURCES_KEY) as Record<string, tachiSources> | undefined) ?? DEFAULT_SERVER_SOURCES
}

export async function setSelectedSources(stateManager: SourceStateManager, selectedSources: string[]) {
    await stateManager.store(SELECTED_SOURCES_KEY, selectedSources)
}

export async function getSelectedSources(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SELECTED_SOURCES_KEY) as string[] | undefined) ?? DEFAULT_SELECTED_SOURCES
}

export function getSourcesIds(sources: Record<string, tachiSources>) {
    let sourceIds: string[] = [];
    Object.values(sources).forEach(source => {
        sourceIds.push(source.id)
    })

    return sourceIds
}

export function getSourceFromId(sources: Record<string, tachiSources>, id: string): tachiSources {
    return sources[id] ?? DEFAULT_SERVER_SOURCE
}

// SourceName is used to give a name to old entries which are no longer in the server
export function getSourceNameFromId(sources: Record<string, tachiSources>, id: string) {
    let sourceName = "OLD ENTRY OR ERROR"
    Object.values(sources).forEach(source => {
        if (source.id === id) {
            sourceName = source.displayName
        }
    })

    return sourceName
}
// ! Sources End

// ! Homepage Settings Start
export function styleResolver(style: string): string {
    switch (style) {
        case "singleRowNormal":
            return "Normal Single Row"
        case "singleRowLarge":
            return "Large Single Row"
        case "featured":
            return "Featured"
        case "doubleRow":
            return "Double Row"
        default:
            return ""
    }
}

export async function setMangaPerRow(stateManager: SourceStateManager, rowNumber: number) {
    await stateManager.store(MANGA_PER_ROW_KEY, rowNumber)
}

export async function getMangaPerRow(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(MANGA_PER_ROW_KEY) as number | undefined) ?? DEFAULT_MANGA_PER_ROW;
}

export async function setUpdatedRowState(stateManager: SourceStateManager, state: boolean) {
    await stateManager.store(UPDATED_ROW_STATE_KEY, state)
}

export async function getUpdatedRowState(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(UPDATED_ROW_STATE_KEY) as boolean | undefined) ?? DEFAULT_UPDATED_ROW_STATE;
}

export async function setCategoryRowState(stateManager: SourceStateManager, state: boolean) {
    await stateManager.store(CATEGORY_ROW_STATE_KEY, state)
}

export async function getCategoryRowState(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(CATEGORY_ROW_STATE_KEY) as boolean | undefined) ?? DEFAULT_CATEGORY_ROW_STATE;
}

export async function setSourceRowState(stateManager: SourceStateManager, state: boolean) {
    await stateManager.store(SOURCE_ROW_STATE_KEY, state)
}

export async function getSourceRowState(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SOURCE_ROW_STATE_KEY) as boolean | undefined) ?? DEFAULT_SOURCE_ROW_STATE;
}

export async function setUpdatedRowStyle(stateManager: SourceStateManager, style: string[]) {
    await stateManager.store(UPDATED_ROW_STYLE_KEY, style)
}

export async function getUpdatedRowStyle(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(UPDATED_ROW_STYLE_KEY) as string[] | undefined) ?? DEFAULT_UPDATED_ROW_STYLE;
}

export async function setCategoryRowStyle(stateManager: SourceStateManager, style: string[]) {
    await stateManager.store(CATEGORY_ROW_STYLE_KEY, style)
}

export async function getCategoryRowStyle(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(CATEGORY_ROW_STYLE_KEY) as string[] | undefined) ?? DEFAULT_CATEGORY_ROW_STYLE;
}

export async function setSourceRowStyle(stateManager: SourceStateManager, style: string) {
    await stateManager.store(SOURCE_ROW_STYLE_KEY, style)
}

export async function getSourceRowStyle(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SOURCE_ROW_STYLE_KEY) as string[] | undefined) ?? DEFAULT_SOURCE_ROW_STYLE;
}
// ! Homepage Settings End

// ! Languages Settings Start
export async function getServerLanguages(stateManager: SourceStateManager) {
    const serverSources = await getServerSources(stateManager)
    const serverLanguages = Object.values(serverSources).map((source) => source.lang)
    const languages = getLanguageCodes()

    let missedLanguages = []

    for (const language of serverLanguages) {
        if (!(languages.includes(language))) {
            missedLanguages.push(language)
        }
    }

    return missedLanguages
}

export function getLanguageCodes() {
    return Object.keys(languages)
}

export function getLanguageName(languageCode: string): string {
    return languages[languageCode] ?? languageCode
}

export async function setSelectedLanguages(stateManager: SourceStateManager, languages: string[]) {
    await stateManager.store(SELECTED_LANGUAGES_KEY, languages)
}

export async function getSelectedLanguages(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SELECTED_LANGUAGES_KEY) as string[] | undefined) ?? DEFAULT_SELECTED_LANGUAGES
}
// ! Languages settings end

export async function v1Migration(stateManager: SourceStateManager) {
    const serverAddress = await stateManager.retrieve("server_address")
    const selectedCategories = await stateManager.retrieve("selected_category")
    const selectedSources = await stateManager.retrieve("selected_sources")

    if (serverAddress) {
        await setServerURL(stateManager, serverAddress)
        await stateManager.store("server_address", undefined)
    }
    if (selectedCategories) {
        await stateManager.store("selected_category", undefined)
        await setSelectedCategories(stateManager, selectedCategories)
    }
    if (selectedSources) {
        await stateManager.store("selected_sources", undefined)
        await setSelectedSources(stateManager, selectedSources)
    }
}
