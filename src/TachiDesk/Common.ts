import {
    HomeSectionType,
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

// Defaults
export const DEFAULT_SERVER_URL = "http://127.0.0.1:4567/";
export const DEFAULT_API_ENDPOINT = "api/v1/";
export const DEFAULT_SERVER_API = DEFAULT_SERVER_URL + DEFAULT_API_ENDPOINT;
export const DEFAULT_AUTH_STATE = false;
export const DEFAULT_AUTH_STRING = "";
export const DEFAULT_USERNAME = "";
export const DEFAULT_PASSWORD = "";

export const DEFAULT_SERVER_CATEGORIES: Record<string, tachiCategory> = {
    "0": {
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
};
export const DEFAULT_SELECTED_CATEGORIES = ["0"];

export const DEFAULT_SERVER_SOURCES: Record<string, tachiSources> = {
    "0": {
        id: "0",
        name: "Local source",
        lang: "localsourcelang",
        iconUrl: "/api/v1/extension/icon/localSource",
        supportsLatest: true,
        isConfigurable: false,
        isNsfw: false,
        displayName: "Local source"
    }
}
export const DEFAULT_SELECTED_SOURCES = ["0"]

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
    "lastChapterRead": tachiChapter,
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
    await stateManager.store(MANGA_PER_ROW_KEY,DEFAULT_MANGA_PER_ROW)
    await stateManager.store(UPDATED_ROW_STATE_KEY,DEFAULT_UPDATED_ROW_STATE)
    await stateManager.store(CATEGORY_ROW_STATE_KEY,DEFAULT_CATEGORY_ROW_STATE)
    await stateManager.store(SOURCE_ROW_STATE_KEY,DEFAULT_SOURCE_ROW_STATE)
    await stateManager.store(UPDATED_ROW_STYLE_KEY,DEFAULT_UPDATED_ROW_STYLE)
    await stateManager.store(CATEGORY_ROW_STYLE_KEY,DEFAULT_CATEGORY_ROW_STYLE)
    await stateManager.store(SOURCE_ROW_STYLE_KEY,DEFAULT_SOURCE_ROW_STYLE)
}
// ! Reset Settings End

// ! Server URL start

// Clean server URL
export function cleanServerURL(url: String) {
    // If last character isn't a /, then add it to the url
    return url.slice(-1) === '/' ? url : url + "/"
}

// Set server URL
export async function setServerURL(stateManager: SourceStateManager, url: String) {
    url = url == "" ? DEFAULT_SERVER_URL : url
    await stateManager.store(SERVER_URL_KEY, cleanServerURL(url))
    await stateManager.store(SERVER_API_KEY, cleanServerURL(url) + DEFAULT_API_ENDPOINT)
}

// get server URL
export async function getServerURL(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_URL_KEY) as string | undefined) ?? DEFAULT_SERVER_URL
}

// Get Server API url (i.e. http://127.0.0.1/api/v1/)
export async function getServerAPI(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_API_KEY) as string | undefined) ?? DEFAULT_SERVER_API
}

// !Server URL End

// ! Authentication start

// Set AuthState
export async function setAuthState(stateManager: SourceStateManager, state: boolean) {
    await stateManager.store(AUTH_STATE_KEY, state)
}

// Get AuthState
export async function getAuthState(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(AUTH_STATE_KEY) as boolean | undefined) ?? DEFAULT_AUTH_STATE
}

// Set Auth String
export async function setAuthString(stateManager: SourceStateManager) {
    let username = await getUsername(stateManager);
    let password = await getPassword(stateManager);

    let authString = 'Basic ' + Buffer.from(username + ':' + password, 'binary').toString('base64');

    await stateManager.keychain.store(AUTH_STRING_KEY, authString);
}

// Get Auth String
export async function getAuthString(stateManager: SourceStateManager) {
    return (await stateManager.keychain.retrieve(AUTH_STRING_KEY) as string | undefined) ?? DEFAULT_AUTH_STRING;
}

// Set Username
export async function setUsername(stateManager: SourceStateManager, username: string) {
    await stateManager.store(USERNAME_KEY, username);
    await setAuthString(stateManager)
}

// Get Username
export async function getUsername(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(USERNAME_KEY) as string | undefined) ?? DEFAULT_USERNAME;
}

// Set Password
export async function setPassword(stateManager: SourceStateManager, password: string) {
    await stateManager.keychain.store(PASSWORD_KEY, password);
    await setAuthString(stateManager);
}

// Get Password
export async function getPassword(stateManager: SourceStateManager) {
    return (await stateManager.keychain.retrieve(PASSWORD_KEY) as string | undefined) ?? DEFAULT_PASSWORD;
}

// ! Authentication End

// ! Requests

// Make Request
export async function makeRequest(stateManager: SourceStateManager, requestManager: RequestManager, apiEndpoint: string, method = "GET", data: Record<string, string> = {}, headers: Record<string, string> = {}) {
    const serverAPI = await getServerAPI(stateManager)
    const authEnabled = await getAuthState(stateManager);

    if (authEnabled) {
        headers['Authorization'] = await getAuthString(stateManager);
    }
    const request = App.createRequest({
        url: serverAPI + apiEndpoint,
        method,
        data,
        headers
    })

    let response;
    let responseStatus;
    let responseData;

    try {
        response = await requestManager.schedule(request, 0);
    }
    catch (error: any) {
        return new Error(serverAPI + apiEndpoint)
    }

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

    try {
        responseData = JSON.parse(response.data ?? "")
    }
    catch (error: any) {
        return Error(apiEndpoint)
    }

    return responseData
}

// Test Request
export async function testRequest(stateManager: SourceStateManager, requestManager: RequestManager) {
    return await makeRequest(stateManager, requestManager, "settings/about/")
}

// ! Requests End



// ! Categories Start
// Fetch Categories -- get with a fetch
export async function fetchServerCategories(stateManager: SourceStateManager, requestManager: RequestManager) {
    let categories: Record<string, tachiCategory> = {};

    const fetchedCategories = await makeRequest(stateManager, requestManager, "category/");

    fetchedCategories.forEach((category: tachiCategory) => {
        categories[JSON.stringify(category.id)] = category
    });

    return categories
}

// Set Categories
export async function setServerCategories(stateManager: SourceStateManager, categories: Record<string, tachiCategory>) {
    await stateManager.store(SERVER_CATEGORIES_KEY, categories)
}

// Get Categories
export async function getServerCategories(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_CATEGORIES_KEY) as Record<string, tachiCategory> | undefined) ?? DEFAULT_SERVER_CATEGORIES
}

// Set Selected Categories
export async function setSelectedCategories(stateManager: SourceStateManager, selectedCategories: string[]) {
    await stateManager.store(SELECTED_CATEGORIES_KEY, selectedCategories)
}

// Get Selected Categories
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
export function getCategoryFromId(categories: Record<string, tachiCategory>, id: string) : tachiCategory{
    const default_category : tachiCategory = {
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
    return categories[id] ?? default_category
}

export function getCategoryNameFromId(categories: Record<string, tachiCategory>, id: string) {
    let categoryName = ""

    Object.values(categories).forEach(category => {
        if (JSON.stringify(category.id) == id) {
            categoryName = category.name
        }
    })

    return categoryName
}
// ! Categories End

// ! Sources Start
// Fetch Sources -- get with a fetch
export async function fetchServerSources(stateManager: SourceStateManager, requestManager: RequestManager) {
    let sources: Record<string, tachiSources> = {};

    const fetchedSources = await makeRequest(stateManager, requestManager, "source/list")

    fetchedSources.forEach((source: tachiSources) => {
        sources[source.id] = source
    });

    return sources
}

// Set Sources
export async function setServerSources(stateManager: SourceStateManager, sources: Record<string, tachiSources>) {
    await stateManager.store(SERVER_SOURCES_KEY, sources);
}

// Get Sources
export async function getServerSources(stateManager: SourceStateManager) {
    return (await stateManager.retrieve(SERVER_SOURCES_KEY) as Record<string, tachiSources> | undefined) ?? DEFAULT_SERVER_SOURCES
}

// Set Selected Sources
export async function setSelectedSources(stateManager: SourceStateManager, selectedSources: string[]) {
    await stateManager.store(SELECTED_SOURCES_KEY, selectedSources)
}

// Get Selected Sources
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

export function getSourceFromId(sources: Record<string, tachiSources>, id: string) : tachiSources{
    const default_category : tachiSources = {
        id: "0",
        name: "Local source",
        lang: "localsourcelang",
        iconUrl: "/api/v1/extension/icon/localSource",
        supportsLatest: true,
        isConfigurable: false,
        isNsfw: false,
        displayName: "Local source"
    }

    return sources[id] ?? default_category
}

export function getSourceNameFromId(sources: Record<string, tachiSources>, id: string) {
    let sourceName = ""

    Object.values(sources).forEach(source => {
        if (source.id === id) {
            sourceName = source.displayName
        }
    })

    return sourceName
}

// ! Sources End

// ! Homepage Settings Start

export const DEFAULT_MANGA_PER_ROW = 10;
export const DEFAULT_UPDATED_ROW_STATE = true
export const DEFAULT_CATEGORY_ROW_STATE = true
export const DEFAULT_SOURCE_ROW_STATE = true
export const DEFAULT_UPDATED_ROW_STYLE = ["singleRowNormal"]
export const DEFAULT_CATEGORY_ROW_STYLE = ["singleRowNormal"]
export const DEFAULT_SOURCE_ROW_STYLE = ["singleRowNormal"]

export const MANGA_PER_ROW_KEY = "mangaPerRow"
export const UPDATED_ROW_STATE_KEY = "updatedRowState"
export const CATEGORY_ROW_STATE_KEY = "categoryRowState"
export const SOURCE_ROW_STATE_KEY = "sourceRowState"
export const UPDATED_ROW_STYLE_KEY = "updatedRowStyle"
export const CATEGORY_ROW_STYLE_KEY = "categoryRowStyle"
export const SOURCE_ROW_STYLE_KEY = "sourceRowStyle"

export const rowStyles : {[key: string]: HomeSectionType}= {
    "singleRowNormal": HomeSectionType.singleRowNormal,
    "singleRowLarge": HomeSectionType.singleRowLarge,
    "featured": HomeSectionType.featured,
    "doubleRow": HomeSectionType.doubleRow
}

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
