import {
    BadgeColor,
    Chapter,
    ChapterDetails,
    ChapterProviding,
    ContentRating,
    DUISection,
    HomePageSectionsProviding,
    HomeSection,
    HomeSectionType,
    PagedResults,
    SearchRequest,
    SearchResultsProviding,
    SourceInfo,
    SourceIntents,
    SourceManga,
    TagSection,
    Request,
    Response
} from "@paperback/types"

import {
    HomepageSettings,
    categoriesSettings,
    languageSettings,
    resetSettingsButton,
    serverAddressSettings,
    sourceSettings,
} from "./Settings";

import {
    DEFAULT_SERVER_URL,
    fetchServerCategories,
    fetchServerSources,
    getAuthState,
    getAuthString,
    getCategoryFromId,
    getCategoryNameFromId,
    getCategoryRowState,
    getCategoryRowStyle,
    getMangaPerRow,
    getSelectedCategories,
    getSelectedSources,
    getServerAPI,
    getServerCategories,
    getServerSources,
    getServerURL,
    getSourceFromId,
    getSourceNameFromId,
    getSourceRowState,
    getSourceRowStyle,
    getUpdatedRowState,
    getUpdatedRowStyle,
    makeRequest,
    serverUnavailableMangaTiles,
    setServerCategories,
    setServerSources,
    tachiChapter,
    tachiManga,
    testRequest,
    v1Migration
} from "./Common";

export const TachiDeskInfo: SourceInfo = {
    author: 'ofelizestevez & Alles',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Tachidesk',
    version: '2.1',
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    contentRating: ContentRating.EVERYONE,
    sourceTags: [
        {
            text: "Self-hosted",
            type: BadgeColor.GREY
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.SETTINGS_UI | SourceIntents.HOMEPAGE_SECTIONS
}

export class TachiDesk implements HomePageSectionsProviding, ChapterProviding, SearchResultsProviding {
    stateManager = App.createSourceStateManager();
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
        interceptor: {
            // Intercepts request to add basic auth
            interceptRequest: async (request: Request) => {
                const authEnabled = await getAuthState(this.stateManager);

                if (authEnabled) {
                    request.headers = {
                        ...request.headers,
                        authorization: await getAuthString(this.stateManager)
                    }
                }

                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    // Variable used for share URL, updated by getChapters()
    serverAddress = ""

    // Settings
    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: "main",
            header: "Source Settings",
            footer: "IMPORTANT NOTE: settings are more stable if you wait for your homepage section to load.",
            isHidden: false,
            rows: async () => [
                serverAddressSettings(this.stateManager, this.requestManager),
                HomepageSettings(this.stateManager, this.requestManager),
                await categoriesSettings(this.stateManager, this.requestManager),
                await languageSettings(this.stateManager),
                await sourceSettings(this.stateManager, this.requestManager),
                await resetSettingsButton(this.stateManager)
            ]
        })
    }

    // share URL
    getMangaShareUrl(mangaId: string): string {
        if (this.serverAddress != "") {
            return this.serverAddress + "manga/" + mangaId
        }
        return ""
    }

    // Manga info -> uses TachiManga interface
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const manga: tachiManga = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId)
        const tags: [TagSection] = [
            App.createTagSection({
                id: "0",
                label: "genres",
                tags: manga.genre.map((tag: string) => App.createTag({
                    id: tag,
                    label: tag
                }))
            })
        ]

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [manga.title],
                image: (await getServerURL(this.stateManager)) + manga.thumbnailUrl.slice(1),
                author: manga.author,
                artist: manga.artist,
                desc: manga.description,
                status: manga.status,
                tags
            })
        })
    }

    // Chapter list, sets the share URl address
    async getChapters(mangaId: string): Promise<Chapter[]> {
        // Fetches manga first to use to check last fetched at
        const manga: tachiManga = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId)
        let chaptersQueryString = "manga/" + mangaId + "/chapters"

        // If last fetched is older than a day ago, do an online fetch for the manga and the chapter list
        // Online fetch manga to update the manga.lastFetchedAt. Seems redundant but now idea how to improve
        if (manga.lastFetchedAt < Math.floor(Date.now() / 1000) - 86400){
            makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId + "?onlineFetch=true")
            chaptersQueryString += "?onlineFetch=true"
        }

        const chaptersData: tachiChapter[] = await makeRequest(this.stateManager, this.requestManager, chaptersQueryString)
        this.serverAddress = await getServerURL(this.stateManager)

        const chapters: Chapter[] = []

        for (const chapter of chaptersData) {
            chapters.push(
                App.createChapter({
                    id: chapter.index.toString(),
                    name: chapter.name,
                    chapNum: chapter.chapterNumber,
                    time: new Date(chapter.uploadDate),
                    sortingIndex: chapter.index
                })
            )
        }

        return chapters
    }

    // Provides pages for chapter
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const apiURL = await getServerAPI(this.stateManager)
        const chapterData: tachiChapter = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId + "/chapter/" + chapterId)

        const pages: string[] = []

        // Tachidesk uses page count, so make an array of length pageCount then use the keys of array LOL
        // pretty much a for i in range() from python
        for (const pageIndex of Array(chapterData.pageCount).keys()) {
            pages.push(apiURL + "manga/" + mangaId + "/chapter/" + chapterId + "/page/" + pageIndex)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages
        })
    }

    // Homepage sections (updated, library categories, sources)
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const promises: Promise<void>[] = []
        const sections = []

        // Checks if you need to migrate from v1
        if (await this.stateManager.retrieve("server_address")) {
            await v1Migration(this.stateManager)
        }

        // Error Checking here!!!
        if (await testRequest(this.stateManager, this.requestManager) instanceof Error) {
            const section = App.createHomeSection({
                id: "unset",
                title: "Server Error",
                containsMoreItems: false,
                type: "singleRowNormal",
                items: serverUnavailableMangaTiles()
            });
            sectionCallback(section);
            return;
        }

        // Fetches sources and categories since it runs every time anyway, including after installing the extension
        // Useful because it fetches the sources and categories from the server, so you won't have to fetch them for settings
        // Makes settings a lot more stable (as long as homepage sections are loaded before entering settings)
        const serverURL = await getServerURL(this.stateManager);
        const serverSources = await getServerSources(this.stateManager);
        const serverCategories = await getServerCategories(this.stateManager);

        // only fetches when url has been set, only sets the fetched when the old record is different 
        if (serverURL !== DEFAULT_SERVER_URL) {
            promises.push(
                fetchServerSources(this.stateManager, this.requestManager).then((response) => {
                    if (JSON.stringify(response) !== JSON.stringify(serverSources)) {
                        setServerSources(this.stateManager, response)
                    }
                })
            )

            promises.push(
                fetchServerCategories(this.stateManager, this.requestManager).then((response) => {
                    if (JSON.stringify(response) !== JSON.stringify(serverCategories)) {
                        setServerCategories(this.stateManager, response)
                    }
                })
            )
        }

        // Gets the settings values to set the type of rows
        // Allows for customization of each type of row (updated, category, sources)
        const mangaPerRow = await getMangaPerRow(this.stateManager);
        const updatedRowState = await getUpdatedRowState(this.stateManager);
        const categoryRowState = await getCategoryRowState(this.stateManager);
        const sourceRowState = await getSourceRowState(this.stateManager);
        const updatedRowStyle = (await getUpdatedRowStyle(this.stateManager))[0];
        const categoryRowStyle = (await getCategoryRowStyle(this.stateManager))[0];
        const sourceRowStyle = (await getSourceRowStyle(this.stateManager))[0];

        // Push Sections
        // Uses regular paperback request syntax... could be changed to use the function makeRequest.
        if (updatedRowState) {
            sections.push({
                section: App.createHomeSection({
                    id: "updated",
                    title: "Recently Updated",
                    containsMoreItems: true,
                    type: HomeSectionType[updatedRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                }),
                request: App.createRequest({
                    url: (await getServerAPI(this.stateManager)) + "update/recentChapters/0",
                    method: "GET"
                }),
                responseArray: "page", //Refers to array of manga being inside the response's page key
            })
        }
        if (categoryRowState) {
            const serverCategories = await fetchServerCategories(this.stateManager, this.requestManager)
            const selectedCategories: Array<string> = await getSelectedCategories(this.stateManager)

            //Gets server categories with all request info, filters out to only include selected categories, then compares their order to sort
            const orderedSelectedCategories = Object.keys(serverCategories)
                .filter((key) => selectedCategories.includes(key))
                .sort((a, b) => {
                    const aOrder = getCategoryFromId(serverCategories, a).order
                    const bOrder = getCategoryFromId(serverCategories, b).order

                    if (aOrder < bOrder) {
                        return -1
                    }
                    else if (aOrder > bOrder) {
                        return 1
                    }
                    return 0
                })

            for (const categoryId of orderedSelectedCategories) {
                sections.push({
                    section: App.createHomeSection({
                        id: "category-" + categoryId,
                        title: getCategoryNameFromId(serverCategories, categoryId),
                        containsMoreItems: true,
                        type: HomeSectionType[categoryRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                    }),
                    request: App.createRequest({
                        url: (await getServerAPI(this.stateManager)) + "category/" + categoryId,
                        method: "GET"
                    }),
                    responseArray: "root" //Refers to array of manga in the response itself
                })
            }
        }
        if (sourceRowState) {
            const serverSources = await getServerSources(this.stateManager);
            const selectedSources = await getSelectedSources(this.stateManager);

            // Adds popular and latest... We could add an option to turn each on or off but no idea how to set it up
            // Should we allow each source to have an option for both? That sounds messy.
            // Should we allow to turn each type of row on/off entirely? idk.
            for (const sourceId of selectedSources) {
                sections.push({
                    section: App.createHomeSection({
                        id: "popular-" + sourceId,
                        title: getSourceNameFromId(serverSources, sourceId) + " (Popular)",
                        containsMoreItems: true,
                        type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                    }),
                    request: App.createRequest({
                        url: (await getServerAPI(this.stateManager)) + "source/" + sourceId + "/popular/1",
                        method: "GET"
                    }),
                    responseArray: "mangaList" //Refers to array of manga being inside the response's mangaList key
                })

                if (getSourceFromId(serverSources, sourceId).supportsLatest) {
                    sections.push({
                        section: App.createHomeSection({
                            id: "latest-" + sourceId,
                            title: getSourceNameFromId(serverSources, sourceId) + " (Latest)",
                            containsMoreItems: true,
                            type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                        }),
                        request: App.createRequest({
                            url: (await getServerAPI(this.stateManager)) + "source/" + sourceId + "/latest/1",
                            method: "GET"
                        }),
                        responseArray: "mangaList" //Refers to array of manga being inside the response's mangaList key
                    })
                }
            }
        }

        // Run Promises
        for (const section of sections) {
            sectionCallback(section.section)

            promises.push(
                this.requestManager.schedule(section.request, 1).then(async response => {
                    const json = JSON.parse(response.data ?? "")
                    const tiles = []

                    // Uses the responseAray to get manga list
                    let data;
                    switch (section.responseArray) {
                        case "page":
                            data = json.page
                            break
                        case "mangaList":
                            data = json.mangaList
                            break;
                        default:
                            data = json
                            break;
                    }

                    // Cuts manga list to the first X amount of manga (from settings)
                    for (const mangaResponse of data.slice(0, mangaPerRow)) {
                        let manga: tachiManga;
                        if (section.responseArray === "page") {
                            manga = mangaResponse.manga
                        }
                        else {
                            manga = mangaResponse
                        }

                        tiles.push(
                            App.createPartialSourceManga({
                                title: manga.title,
                                mangaId: manga.id.toString(),
                                image: (await getServerURL(this.stateManager)) + manga.thumbnailUrl.slice(1)
                            })
                        )
                    }

                    section.section.items = tiles
                    sectionCallback(section.section)
                })
            )
        }

        await Promise.all(promises)
    }

    // home sections that contain more items than shown
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const sourceId = homepageSectionId.split('-').pop() ?? ""
        const type = homepageSectionId.split("-")[0]

        const tiles = [];
        let page;
        let apiEndpoint: any;
        let response;
        let tileData: any;

        // uses type of source to determine where to get the manga list and the api link
        switch (type) {
            case "updated":
                page = metadata?.page ?? 1
                apiEndpoint = "update/recentChapters/" + page;
                response = (await makeRequest(this.stateManager, this.requestManager, apiEndpoint));
                tileData = response.page
                break
            case "category":
                page = metadata?.page ?? undefined // Categories don't have pages
                apiEndpoint = "category/" + sourceId;
                response = (await makeRequest(this.stateManager, this.requestManager, apiEndpoint));
                tileData = response
                break
            case "popular":
            case "latest":
            default:
                page = metadata?.page ?? 1
                apiEndpoint = "source/" + sourceId + "/" + type + "/" + page;
                response = (await makeRequest(this.stateManager, this.requestManager, apiEndpoint));
                tileData = response.mangaList
                break;
        }

        // updated list has a manga data and chapter data so have to specify.
        for (const mangaResponse of tileData) {
            let manga: tachiManga;
            if (type === "updated") {
                manga = mangaResponse.manga
            }
            else {
                manga = mangaResponse
            }

            tiles.push(
                App.createPartialSourceManga({
                    title: manga.title,
                    mangaId: manga.id.toString(),
                    image: (await getServerURL(this.stateManager)) + manga.thumbnailUrl.slice(1)
                })
            )
        }

        // Pushes the page number and results along
        // Eventually we might have to look through this to ensure only 1 distinct manga (updated list allows duups)
        metadata = response.hasNextPage ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: tiles,
            metadata: metadata
        })
    }

    // For now only supports searching sources.
    // Could support filters but it's too complicated since each source has their own set of filters
    // and paperback considers tachidesk as 1 source.
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const serverSources = await getServerSources(this.stateManager)
        const selectedSources = await getSelectedSources(this.stateManager)
        const meta_sources: { [key: string]: boolean } = metadata?.sources ?? {}
        const page: number = metadata?.page ?? 1;

        const paramsList = [`pageNum=${page}`];
        if (query.title !== undefined && query.title !== "") {
            paramsList.push("searchTerm=" + encodeURIComponent(query.title));
        }
        let paramsString = "";
        if (paramsList.length > 0) {
            paramsString = "?" + paramsList.join("&");
        }

        const tiles = []
        for (const source of selectedSources) {
            if (page !== 1) {
                if (!meta_sources[source]) continue
            }

            const mangaResults = await makeRequest(this.stateManager, this.requestManager, "source/" + source + "/search" + paramsString)
            for (const manga of mangaResults.mangaList) {
                tiles.push(
                    App.createPartialSourceManga({
                        title: manga.title,
                        mangaId: String(manga.id),
                        image: (await getServerURL(this.stateManager)) + manga.thumbnailUrl.slice(1),
                        subtitle: getSourceNameFromId(serverSources, source)
                    })
                )
            }
            meta_sources[source] = mangaResults.hasNextPage
        }

        metadata = tiles.length !== 0 ? { page: page + 1, sources: meta_sources } : undefined

        return App.createPagedResults({
            results: tiles,
            metadata
        })
    }
}