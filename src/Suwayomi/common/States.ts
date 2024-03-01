import { HomeSectionType, RequestManager, SourceStateManager } from "@paperback/types"
import { ALL_CATEGORIES_DATA, ALL_CATEGORIES_QUERY, ALL_SOURCES_DATA, ALL_SOURCES_QUERY, Category, Sources } from "./Queries";
import { DEFAULT_SERVER_CATEGORIES, DEFAULT_SERVER_SOURCES } from "./Defaults";
import { queryGraphQL } from "./Common";

// State class uses parameters as .get(), .set(), .fetch()
export class State<T> {
    private getter: (stateManager: SourceStateManager) => Promise<T>;
    private setter: (stateManager: SourceStateManager, value?: T) => Promise<void>;
    private fetcher?: (stateManager: SourceStateManager, requestManager: RequestManager) => Promise<T>; // Change return type to Promise<T>

    constructor({ getter, setter, fetcher }: { getter: (stateManager: SourceStateManager) => Promise<T>, setter: (stateManager: SourceStateManager, value?: T) => Promise<void>, fetcher?: (stateManager: SourceStateManager, requestManager: RequestManager) => Promise<T> }) {
        this.getter = getter;
        this.setter = setter;
        this.fetcher = fetcher;
    }

    async get(stateManager: SourceStateManager): Promise<T> {
        return this.getter(stateManager);
    }

    async set(stateManager: SourceStateManager, value?: T): Promise<void> {
        return this.setter(stateManager, value);
    }

    async fetch(stateManager: SourceStateManager, requestManager: RequestManager): Promise<T> { // Change return type to Promise<T>
        if (this.fetcher) {
            return this.fetcher(stateManager, requestManager);
        }
        throw new Error("Fetcher not implemented");
    }

}

// Object that houses StateManager info for normal extension 
export const States = {
    SERVER_URL: new State<string>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("serverURL")) ?? "http://127.0.0.1:4567" },
        setter: async (stateManager: SourceStateManager, value?: string) => { await stateManager.store("serverURL", value) },
    }),
    AUTH_STATE: new State<boolean>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("AuthState")) ?? false },
        setter: async (stateManager: SourceStateManager, value?: boolean) => { await stateManager.store("AuthState", value) }
    }),
    AUTH_USERNAME: new State<string>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("serverUsername")) ?? "" },
        setter: async (stateManager: SourceStateManager, value?: string) => { await stateManager.store("serverUsername", value) },
    }),
    AUTH_PASSWORD: new State<string>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.keychain.retrieve("serverPassword")) ?? "" },
        setter: async (stateManager: SourceStateManager, value?: string) => { await stateManager.keychain.store("serverPassword", value) },
    }),
    MANGA_PER_SECTION: new State<number>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("mangaPerSection")) ?? 10 },
        setter: async (stateManager: SourceStateManager, value?: number) => { await stateManager.store("mangaPerSection", value) },
    }),
    RECENTLY_UPDATED_DUPLICATES: new State<boolean>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("recentlyUpdatedDuplicates")) ?? true },
        setter: async (stateManager: SourceStateManager, value?: boolean) => { await stateManager.store("recentlyUpdatedDuplicates", value) }
    }),
    UPDATED_SECTION_STATE: new State<boolean>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("updatedSectionState")) ?? true },
        setter: async (stateManager: SourceStateManager, value?: boolean) => { await stateManager.store("updatedSectionState", value) }
    }),
    CATEGORY_SECTION_STATE: new State<boolean>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("categorySectionState")) ?? true },
        setter: async (stateManager: SourceStateManager, value?: boolean) => { await stateManager.store("categorySectionState", value) }
    }),
    SOURCE_SECTION_STATE: new State<boolean>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("sourceSectionState")) ?? true },
        setter: async (stateManager: SourceStateManager, value?: boolean) => { await stateManager.store("sourceSectionState", value) }
    }),
    UPDATED_SECTION_STYLE: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("updatedSectionStyle")) ?? [HomeSectionType.singleRowNormal] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("updatedSectionStyle", value) },
    }),
    CATEGORY_SECTION_STYLE: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("categorySectionStyle")) ?? [HomeSectionType.singleRowNormal] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("categorySectionStyle", value) },
    }),
    SOURCE_SECTION_STYLE: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("sourceSectionStyle")) ?? [HomeSectionType.singleRowNormal] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("sourceSectionStyle", value) },
    }),
    SERVER_CATEGORIES: new State<Category[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("serverCategories")) ?? DEFAULT_SERVER_CATEGORIES; },
        setter: async (stateManager: SourceStateManager, value?: Category[]) => { await stateManager.store("serverCategories", value) },
        fetcher: async (stateManager, requestManager) => {
            const fetchedSources = await queryGraphQL(stateManager, requestManager, ALL_CATEGORIES_QUERY) as ALL_CATEGORIES_DATA
            return fetchedSources.categories.nodes
        },
    }),
    SELECTED_CATEGORIES: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("selectedCategories")) ?? ["0"] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("selectedCategories", value) },
    }),
    SERVER_SOURCES: new State<Sources[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("serverSources")) ?? DEFAULT_SERVER_SOURCES; },
        setter: async (stateManager: SourceStateManager, value?: Sources[]) => { await stateManager.store("serverSources", value) },
        fetcher: async (stateManager, requestManager) => {
            const fetchedSources = await queryGraphQL(stateManager, requestManager, ALL_SOURCES_QUERY) as ALL_SOURCES_DATA
            return fetchedSources.sources.nodes
        },
    }),
    SELECTED_SOURCES: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("selectedSources")) ?? ["0"] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("selectedSources", value) },
    }),
    SELECTED_LANGUAGES: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("selectedLanguages")) ?? ["localsourcelang", "en"] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("selectedLanguages", value) },
    })
}

// Temporary States for tracker to use.
export const TrackerStates = {
    IN_LIBRARY: new State<boolean>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("trackerInLibrary")) ?? false },
        setter: async (stateManager: SourceStateManager, value?: boolean) => { await stateManager.store("trackerInLibrary", value) },
    }),
    SERVER_CATEGORIES: new State<Category[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("trackerServerCategories")) ?? DEFAULT_SERVER_CATEGORIES; },
        setter: async (stateManager: SourceStateManager, value?: Category[]) => { await stateManager.store("trackerServerCategories", value) },
    }),
    SELECTED_CATEGORIES: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("trackerSelectedCategories")) ?? ["0"] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("trackerSelectedCategories", value) }
    }),
    OLD_SELECTED_CATEGORIES: new State<string[]>({
        getter: async (stateManager: SourceStateManager) => { return (await stateManager.retrieve("trackerOldSelectedCategories")) ?? ["0"] },
        setter: async (stateManager: SourceStateManager, value?: string[]) => { await stateManager.store("trackerOldSelectedCategories", value) }
    }),
}