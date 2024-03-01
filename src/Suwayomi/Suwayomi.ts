import {
    BadgeColor,
    Chapter,
    ChapterDetails,
    ContentRating,
    DUIForm,
    DUISection,
    HomeSection,
    HomeSectionType,
    MangaProgress,
    MangaProgressProviding,
    PagedResults,
    PaperbackExtensionBase,
    PartialSourceManga,
    SearchRequest,
    SourceInfo,
    SourceIntents,
    SourceManga,
    TrackerActionQueue
} from "@paperback/types";

import {
    categoriesSettings,
    homepageSettings,
    mangaTrackerForm,
    resetSettingsButton,
    serverSettings,
    sourcesSettings
} from "./Settings";

import {
    fetchServerInfo,
    queryGraphQL
} from "./common/Common";

import { States } from "./common/States";

import {
    CATEGORY_SECTION_DATA,
    CATEGORY_SECTION_QUERY,
    CATEGORY_SECTION_VARIABLES,
    CHAPTER_LIST_VARIABLES,
    CHAPTER_PAGES_VARIABLES,
    CategorySectionMetadata,
    FETCH_CHAPTER_DATA,
    FETCH_CHAPTER_LIST_DATA,
    FETCH_CHAPTER_LIST_QUERY,
    FETCH_CHAPTER_PAGES_QUERY,
    FETCH_MANGA_DETAILS_DATA,
    FETCH_MANGA_DETAILS_QUERY,
    GET_CHAPTER_LIST_DATA,
    GET_CHAPTER_LIST_QUERY,
    GET_MANGA_DETAILS_DATA,
    GET_MANGA_DETAILS_QUERY,
    MANGA_DETAILS_VARIABLES,
    MANGA_SEARCH_DATA,
    MANGA_SEARCH_QUERY,
    MANGA_SEARCH_VARIABLES,
    MANGA_SEARCH_METADATA,
    SOURCE_SECTION_DATA,
    SOURCE_SECTION_QUERY,
    SOURCE_SECTION_VARIABLES,
    SourceSectionMetadata,
    UPDATED_SECTION_DATA,
    UPDATED_SECTION_QUERY,
    UPDATED_SECTION_VARIABLES,
    UPDATE_CHAPTER_QUERY,
    UPDATE_CHAPTER_VARIABLES,
    UpdatedSectionMetadata
} from "./common/Queries";

import {
    HomepageSectionDetails,
    serverUnavailableMangaTiles
} from "./common/Defaults";

export const SuwayomiInfo: SourceInfo = {
    author: 'ofelizestevez, Alles, chancez',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Suwayomi',
    version: '1.0.0',
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    contentRating: ContentRating.EVERYONE,
    sourceTags: [
        {
            text: "Self-hosted",
            type: BadgeColor.GREY
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.SETTINGS_UI | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_TRACKING
}

// PaperbackExtensionBase -- normal extension function
// MangaProgressProviding allows sync FROM paperback TO suwayomi server
export class Suwayomi implements PaperbackExtensionBase, MangaProgressProviding {
    stateManager = App.createSourceStateManager();
    requestManager = App.createRequestManager({ requestsPerSecond: 4 });

    serverAddress = ""

    // Settings
    async getSourceMenu(): Promise<DUISection> {
        // Fetches everything before opening settings. Same as getHomePageSections, Minimizing settings crashes
        await fetchServerInfo(this.stateManager, this.requestManager)

        return App.createDUISection({
            id: "main",
            header: "Source Settings",
            isHidden: false,
            rows: async () => [
                serverSettings(this.stateManager, this.requestManager),
                homepageSettings(this.stateManager),
                await categoriesSettings(this.stateManager),
                await sourcesSettings(this.stateManager),
                await resetSettingsButton(this.stateManager)
            ]
        })
    }

    getMangaShareUrl(mangaId: string): string {
        if (this.serverAddress != "") {
            return this.serverAddress + "/manga/" + mangaId
        }
        return ""
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        let data: GET_MANGA_DETAILS_DATA | FETCH_MANGA_DETAILS_DATA;
        let variables = {
            id: parseInt(mangaId)
        } as MANGA_DETAILS_VARIABLES

        // Get Info
        data = await queryGraphQL(this.stateManager, this.requestManager, GET_MANGA_DETAILS_QUERY, variables) as GET_MANGA_DETAILS_DATA
        let manga = data.manga

        // Checks for lastFetched, if 0 or longer than a day, fetch
        // 86400 == 24hr * 60min * 60sec
        if (manga.lastFetchedAt == "0" || (parseInt(manga.lastFetchedAt)) < Math.floor(Date.now() / 1000) - 86400) {
            data = await queryGraphQL(this.stateManager, this.requestManager, FETCH_MANGA_DETAILS_QUERY, variables) as FETCH_MANGA_DETAILS_DATA
            manga = data.fetchManga.manga
        }


        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [manga.title],
                image: await States.SERVER_URL.get(this.stateManager) + manga.thumbnailUrl,
                author: manga.author,
                artist: manga.artist,
                desc: manga.description,
                status: manga.status,
                tags: [
                    App.createTagSection({
                        id: "0",
                        label: "genres",
                        tags: manga.genre.map((tag: string) =>
                            App.createTag({
                                id: tag,
                                label: tag
                            })
                        )
                    })
                ]
            })
        })
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        let data: GET_CHAPTER_LIST_DATA | FETCH_CHAPTER_LIST_DATA;
        let variables = {
            id: parseInt(mangaId)
        } as CHAPTER_LIST_VARIABLES

        // Gets Chapter List
        data = await queryGraphQL(this.stateManager, this.requestManager, GET_CHAPTER_LIST_QUERY, variables) as GET_CHAPTER_LIST_DATA
        let manga = data.manga
        let chapters = data.chapters.nodes

        // Checks if chapter is empty or last fetch of manga
        if (chapters.length == 0 || (parseInt(manga.chaptersLastFetchedAt)) < Math.floor(Date.now() / 1000) - 86400) {
            data = await queryGraphQL(this.stateManager, this.requestManager, FETCH_CHAPTER_LIST_QUERY, variables) as FETCH_CHAPTER_LIST_DATA
            console.log("HERE")
            console.log(data)
            chapters = data.fetchChapters.chapters
        }

        return chapters.map((chapter) => App.createChapter({
            id: chapter.id.toString(),
            name: chapter.name,
            chapNum: chapter.chapterNumber,
            time: new Date(+(chapter.uploadDate)),
            sortingIndex: chapter.sourceOrder
        }))
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        let variables = {
            id: parseInt(chapterId)
        } as CHAPTER_PAGES_VARIABLES

        let pages: string[] = []
        let data = await queryGraphQL(this.stateManager, this.requestManager, FETCH_CHAPTER_PAGES_QUERY, variables) as FETCH_CHAPTER_DATA;
        data.fetchChapterPages.pages.forEach((page) => {
            pages.push(this.serverAddress + page)
        })

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages
        })
    }

    // TODO: Duplicates
    // TODO: Refactor
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const promises: Promise<void>[] = [];
        const sections: HomepageSectionDetails[] = [];

        const test = await fetchServerInfo(this.stateManager, this.requestManager)

        if (test instanceof Error) {

            const section = App.createHomeSection({
                id: "unset",
                title: "Server Error",
                containsMoreItems: false,
                type: HomeSectionType.singleRowNormal,
                items: serverUnavailableMangaTiles()
            })

            sectionCallback(section)
            return;
        }

        let serverURL = await States.SERVER_URL.get(this.stateManager)
        serverURL = serverURL.slice(-1) === '/' ? serverURL.slice(0, -1) : serverURL;
        this.serverAddress = serverURL;

        const mangaPerRow = await States.MANGA_PER_SECTION.get(this.stateManager);
        // const recentlyUpdatedDuplicates = await States.RECENTLY_UPDATED_DUPLICATES.get(this.stateManager);
        const updatedRowState = await States.UPDATED_SECTION_STATE.get(this.stateManager);
        const categoryRowState = await States.CATEGORY_SECTION_STATE.get(this.stateManager);
        const sourceRowState = await States.SOURCE_SECTION_STATE.get(this.stateManager);
        const updatedRowStyle = (await States.UPDATED_SECTION_STYLE.get(this.stateManager))[0]!;
        const categoryRowStyle = (await States.CATEGORY_SECTION_STYLE.get(this.stateManager))[0]!;
        const sourceRowStyle = (await States.SOURCE_SECTION_STYLE.get(this.stateManager))[0]!;

        if (updatedRowState) {
            const variables: UPDATED_SECTION_VARIABLES = {
                first: mangaPerRow,
                offset: 0
            }
            sections.push({
                section: App.createHomeSection({
                    id: "updated",
                    title: "Recently Updated",
                    containsMoreItems: true,
                    type: updatedRowStyle
                }),
                query: UPDATED_SECTION_QUERY,
                variables
            })
        }
        if (categoryRowState) {
            const serverCategories = await States.SERVER_CATEGORIES.get(this.stateManager);
            const selectedCategories = await States.SELECTED_CATEGORIES.get(this.stateManager);

            const processedSelectedSources = serverCategories
                .filter((item) => {
                    return selectedCategories.includes(item.id.toString())
                })
                .sort((a, b) => {
                    if (a.order < b.order) {
                        return -1
                    }
                    else if (a.order > b.order) {
                        return 1
                    }
                    else {
                        return 0
                    }
                })

            processedSelectedSources.forEach((category) => {
                const variables: CATEGORY_SECTION_VARIABLES = {
                    categoryIds: [category.id],
                    first: mangaPerRow,
                    offset: 0,
                }

                sections.push({
                    section: App.createHomeSection({
                        id: `category-${category.id}`,
                        title: category.name,
                        containsMoreItems: true,
                        type: categoryRowStyle,
                    }),
                    query: CATEGORY_SECTION_QUERY,
                    variables
                })
            })
        }
        if (sourceRowState) {
            const serverSources = await States.SERVER_SOURCES.get(this.stateManager);
            const selectedSources = await States.SELECTED_SOURCES.get(this.stateManager);

            const processedSelectedSources = serverSources
                .filter((item) => {
                    return selectedSources.includes(item.id.toString())
                })

            processedSelectedSources.forEach((source) => {
                sections.push({
                    section: App.createHomeSection({
                        id: `popular-${source.id}`,
                        title: `${source.displayName} Popular`,
                        containsMoreItems: true,
                        type: sourceRowStyle
                    }),
                    query: SOURCE_SECTION_QUERY,
                    variables: {
                        page: 1,
                        source: source.id,
                        type: "POPULAR",
                        query: ""
                    } as SOURCE_SECTION_VARIABLES
                })

                if (source.supportsLatest) {
                    sections.push({
                        section: App.createHomeSection({
                            id: `latest-${source.id}`,
                            title: `${source.displayName} Latest`,
                            containsMoreItems: true,
                            type: sourceRowStyle
                        }),
                        query: SOURCE_SECTION_QUERY,
                        variables: {
                            page: 1,
                            source: source.id,
                            type: "LATEST",
                            query: ""
                        } as SOURCE_SECTION_VARIABLES
                    })
                }
            })

        }

        for (const section of sections) {
            sectionCallback(section.section)

            promises.push(
                queryGraphQL(this.stateManager, this.requestManager, section.query, section.variables)
                    .then((response) => {
                        const tiles: any[] = []
                        let data;
                        switch (section.query) {
                            case UPDATED_SECTION_QUERY:
                                data = response as UPDATED_SECTION_DATA

                                data.chapters.nodes.forEach((chapter) => {
                                    tiles.push(App.createPartialSourceManga({
                                        mangaId: chapter.manga.id.toString(),
                                        image: serverURL + chapter.manga.thumbnailUrl,
                                        title: chapter.manga.title,
                                        subtitle: chapter.name,
                                    }))
                                })
                                break;
                            case CATEGORY_SECTION_QUERY:
                                data = response as CATEGORY_SECTION_DATA

                                data.mangas.nodes.forEach((manga) => {
                                    tiles.push(App.createPartialSourceManga({
                                        mangaId: manga.id.toString(),
                                        image: serverURL + manga.thumbnailUrl,
                                        title: manga.title,
                                        subtitle: manga.source.displayName,
                                    }))
                                })
                                break;
                            case SOURCE_SECTION_QUERY:
                                data = response as SOURCE_SECTION_DATA

                                const mangas = data.fetchSourceManga.mangas.slice(0, mangaPerRow)

                                mangas.forEach((manga) => {
                                    tiles.push(App.createPartialSourceManga({
                                        mangaId: manga.id.toString(),
                                        image: serverURL + manga.thumbnailUrl,
                                        title: manga.title,
                                        subtitle: manga.source.displayName,
                                    }))
                                })
                                break;
                            default:
                                break;
                        }

                        section.section.items = tiles
                        sectionCallback(section.section)
                    })
            )
        }

        await Promise.all(promises)
    }

    // Rewrite, no metadata, metadata
    // We can make our metadata be an object of key source id value viewmoreitems source id metadata so we can pass it back
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const allResults: PartialSourceManga[][] = []
        const allMetadatas: any[] = []
        let results: PartialSourceManga[] = [];

        if (!metadata) {
            metadata = {}
        }
        metadata.query = query.title

        const selected_sources = await States.SELECTED_SOURCES.get(this.stateManager)
        for (const sourceId of selected_sources) {
            const viewMoreItems = await this.getViewMoreItems(`search-${sourceId}`, metadata)
            allResults.push(viewMoreItems.results)
            allMetadatas.push(viewMoreItems.metadata)
        }

        if (allResults.length <= 0) {
            metadata = null
        }
        else if (allResults.length == 1) {
            results = allResults[0]!
        }
        else {
            results = allResults.flatMap((innerArray) => { return innerArray })
        }

        metadata = allMetadatas[0]!
        return App.createPagedResults({
            results,
            metadata,
        })
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const sourceId = homepageSectionId.split('-').pop() ?? ""
        const type = homepageSectionId.split("-")[0]

        let serverUrl = metadata?.serverUrl ?? await States.SERVER_URL.get(this.stateManager);
        let hasNextPage = metadata?.hasNextPage ?? true;

        let pagedResults = App.createPagedResults({
            results: [],
            metadata: null
        });

        if (!hasNextPage) {
            return pagedResults
        }

        if (type == "updated") {
            let first = metadata?.first ?? await States.MANGA_PER_SECTION.get(this.stateManager)
            let offset = metadata?.offset ?? 0

            pagedResults = await this.getViewMoreItemsUpdated({
                serverUrl,
                first,
                offset,
                hasNextPage,
            })
        }
        else if (type == "category") {
            let first = metadata?.first ?? await States.MANGA_PER_SECTION.get(this.stateManager)
            let offset = metadata?.offset ?? 0

            pagedResults = await this.getViewMoreItemsCategories(sourceId, {
                serverUrl,
                first,
                offset,
                hasNextPage,
            })
        }
        else if (type == "popular" || type == "latest" || type == "search") {
            let page = metadata?.page ?? 1
            let length = metadata?.length ?? await States.MANGA_PER_SECTION.get(this.stateManager)
            let starting = metadata?.starting ?? 0;
            let query = metadata?.query ?? "";

            pagedResults = await this.getViewMoreItemsSources(sourceId, {
                serverUrl,
                query,
                page,
                length,
                starting,
                hasNextPage,
                type: type.toLocaleUpperCase(),
            })
        }
        else {
            let first = metadata?.first ?? await States.MANGA_PER_SECTION.get(this.stateManager)
            let offset = metadata?.offset ?? 0
            let query = metadata?.query ?? "";

            pagedResults = await this.getViewMoreItemsManga({
                serverUrl,
                first,
                offset,
                query,
                hasNextPage
            })
        }

        return pagedResults
    }

    async getViewMoreItemsUpdated(metadata: UpdatedSectionMetadata | any): Promise<PagedResults> {
        const results: PartialSourceManga[] = []

        const variables = {
            first: metadata.first,
            offset: metadata.offset
        } as UPDATED_SECTION_VARIABLES

        const response = await queryGraphQL(this.stateManager, this.requestManager, UPDATED_SECTION_QUERY, variables) as UPDATED_SECTION_DATA

        response.chapters.nodes.forEach((chapter) => {
            results.push(App.createPartialSourceManga({
                mangaId: chapter.manga.id.toString(),
                image: metadata.serverUrl + chapter.manga.thumbnailUrl,
                title: chapter.manga.title,
                subtitle: chapter.name
            }))
        })

        metadata.offset += metadata.first
        metadata.hasNextPage = response.chapters.pageInfo.hasNextPage

        return App.createPagedResults({
            results: results,
            metadata
        })
    }

    async getViewMoreItemsCategories(categoryId: string, metadata: CategorySectionMetadata): Promise<PagedResults> {
        const results: PartialSourceManga[] = [];

        const variables = {
            categoryIds: [parseInt(categoryId)],
            first: metadata.first,
            offset: metadata.offset
        } as CATEGORY_SECTION_VARIABLES

        const response = await (queryGraphQL(this.stateManager, this.requestManager, CATEGORY_SECTION_QUERY, variables)) as CATEGORY_SECTION_DATA

        response.mangas.nodes.forEach((manga) => {
            results.push(App.createPartialSourceManga({
                mangaId: manga.id.toString(),
                image: metadata.serverUrl + manga.thumbnailUrl,
                title: manga.title,
                subtitle: manga.source.displayName,
            }))
        })

        metadata.offset += metadata.first
        metadata.hasNextPage = response.mangas.pageInfo.hasNextPage

        return App.createPagedResults({
            results: results,
            metadata
        })
    }

    async getViewMoreItemsSources(sourceId: string, metadata: SourceSectionMetadata): Promise<PagedResults> {

        const results: PartialSourceManga[] = [];

        const variables = {
            page: metadata.page,
            source: sourceId,
            type: metadata.type,
            query: metadata.query,
        } as SOURCE_SECTION_VARIABLES

        const response = await (queryGraphQL(this.stateManager, this.requestManager, SOURCE_SECTION_QUERY, variables)) as SOURCE_SECTION_DATA

        let mangas = response.fetchSourceManga.mangas

        let mangaSliceStart = metadata.starting
        let mangaSliceEnd = metadata.starting + metadata.length - 1
        if (mangaSliceEnd > mangas.length) {
            mangaSliceEnd = mangas.length

            metadata.page += 1
            metadata.starting = 0
        }

        mangas = mangas.slice(mangaSliceStart, mangaSliceEnd)
        mangas.forEach(manga => {
            results.push(App.createPartialSourceManga({
                mangaId: manga.id.toString(),
                image: metadata.serverUrl + manga.thumbnailUrl,
                title: manga.title,
                subtitle: manga.source.displayName
            }))
        })
        metadata.hasNextPage = response.fetchSourceManga.hasNextPage
        metadata.starting += metadata.length

        return App.createPagedResults({
            results: results,
            metadata: metadata
        })
    }

    async getViewMoreItemsManga(metadata: MANGA_SEARCH_METADATA): Promise<PagedResults> {
        const results: PartialSourceManga[] = []

        const variables = {
            includes: metadata.query,
            first: metadata.first,
            offset: metadata.offset,
        } as MANGA_SEARCH_VARIABLES

        const response = await queryGraphQL(this.stateManager, this.requestManager, MANGA_SEARCH_QUERY, variables) as MANGA_SEARCH_DATA

        response.mangas.nodes.forEach((manga) => {
            results.push(App.createPartialSourceManga({
                mangaId: manga.id.toString(),
                image: metadata.serverUrl + manga.thumbnailUrl,
                title: manga.title,
                subtitle: manga.source.displayName
            }))
        })

        metadata.offset += metadata.first
        metadata.hasNextPage = response.mangas.hasNextPage

        return App.createPagedResults({
            results: results,
            metadata
        })
    }

    async getMangaProgress(mangaId: string): Promise<MangaProgress | undefined> {
        return Promise.resolve(undefined)
    }

    async getMangaProgressManagementForm(mangaId: string): Promise<DUIForm> {
        return await mangaTrackerForm(this.stateManager, this.requestManager, mangaId)
    }

    async processChapterReadActionQueue(actionQueue: TrackerActionQueue): Promise<void> {
        const chapterReadActions = await actionQueue.queuedChapterReadActions()

        for (const readAction of chapterReadActions) {
            try {
                await queryGraphQL(this.stateManager, this.requestManager, UPDATE_CHAPTER_QUERY, { id: parseInt(readAction.sourceChapterId) } as UPDATE_CHAPTER_VARIABLES)
                await actionQueue.discardChapterReadAction(readAction)
            }
            catch (error) {
                await actionQueue.retryChapterReadAction(readAction)
            }
        }
    }
}