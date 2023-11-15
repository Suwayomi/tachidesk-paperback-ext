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
    Response,
} from "@paperback/types"

import {
    HomepageSettings,
    categoriesSettings,
    languageSettings,
    resetSettingsButton,
    serverAddressSettings,
    sourceSettings
} from "./Settings";

import {
    DEFAULT_SERVER_URL,
    MangaDetailsRequestVariables,
    chapterListRequestVariables,
    fetchMangaDetailsRequest,
    fetchServerCategories,
    fetchServerSources,
    getAuthState,
    getAuthString,
    getCategoryFromId,
    getCategoryNameFromId,
    getCategoryRowState,
    getCategoryRowStyle,
    getMangaDetailsRequest,
    getMangaPerRow,
    getRecentlyUpdatedDuplicates,
    getSelectedCategories,
    getSelectedSources,
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
    tachiMangaResponse,
    testRequest,
    v1Migration
} from "./Common";

export const TachiDeskInfo: SourceInfo = {
    author: 'ofelizestevez & Alles',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Tachidesk',
    version: '3.0',
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

// ! Must remove "/" from serverURL for migration from v2 to v3
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
    // ! Missing Server Address, Homepage, Categories, Language, Source, and Reset Button
    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: "main",
            header: "Source Settings",
            footer: "IMPORTANT NOTE: settings are more stable if you wait for your homepage section to load.",
            isHidden: false,
            rows: async () => [
                serverAddressSettings(this.stateManager, this.requestManager),
                HomepageSettings(this.stateManager),
                await categoriesSettings(this.stateManager),
                await languageSettings(this.stateManager),
                await sourceSettings(this.stateManager),
                await resetSettingsButton(this.stateManager)
            ]
        })
    }

    // share URL
    getMangaShareUrl(mangaId: string): string {
        console.log(this.serverAddress)
        console.log(mangaId)
        if (this.serverAddress != "") {
            return this.serverAddress + "/manga/" + mangaId
        }
        console.log("uhhhh")

        return ""
    }

    // Manga info -> uses TachiManga interface
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        let manga: any = ((await makeRequest(
            this.stateManager,
            this.requestManager,
            getMangaDetailsRequest,
            { "id": mangaId } as MangaDetailsRequestVariables)) as tachiMangaResponse).manga



        if (manga.lastFetchedAt == "0" || +(manga.lastFetchedAt) < Math.floor(Date.now() / 1000) - 86400) {
            manga = ((await makeRequest(
                this.stateManager,
                this.requestManager,
                fetchMangaDetailsRequest,
                { "id": mangaId } as MangaDetailsRequestVariables)))["fetchManga"]["manga"]
        }

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
                image: (await getServerURL(this.stateManager)) + manga.thumbnailUrl,
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
        const mangaDetailsAndChapters = await makeRequest(
            this.stateManager,
            this.requestManager,
            `query MyQuery($id: Int!) {
                manga(id: $id) {
                  id
                  title
                  description
                  artist
                  author
                  status
                  thumbnailUrl
                  lastFetchedAt
                  genre
                }
                chapters(condition: {mangaId: $id}) {
                  nodes {
                    id
                    chapterNumber
                    sourceOrder
                    uploadDate
                    name
                  }
                }
            }`,
            { "id": mangaId } as MangaDetailsRequestVariables)

        let chaptersData: tachiChapter[] = mangaDetailsAndChapters["chapters"]["nodes"] as tachiChapter[]


        if ((+mangaDetailsAndChapters["manga"]["lastFetchedAt"] < Math.floor(Date.now() / 1000) - 86400) || chaptersData.length === 0) {
            const mangaDetailsAndChapters = await makeRequest(
                this.stateManager,
                this.requestManager,
                `mutation MyMutation($id: Int!) {
                    fetchManga(input: {id: $id}) {
                      manga {
                        id
                        title
                        description
                        artist
                        author
                        status
                        thumbnailUrl
                        lastFetchedAt
                        genre
                      }
                    }
                    fetchChapters(input: {mangaId: $id}) {
                        chapters {
                          id
                          chapterNumber
                          sourceOrder
                          uploadDate
                          name
                        }
                    }
                }`,
                { "id": mangaId }
            )
            chaptersData = mangaDetailsAndChapters["fetchChapters"]["chapters"] as tachiChapter[]
            console.log("GOING THROUGH THE GAUNLET")
        }

        this.serverAddress = (await getServerURL(this.stateManager))

        const chapters: Chapter[] = []

        for (const chapter of chaptersData) {
            chapters.push(
                App.createChapter({
                    id: chapter.id.toString(),
                    name: chapter.name,
                    chapNum: chapter.chapterNumber,
                    time: new Date(+(chapter.uploadDate)),
                    sortingIndex: chapter.sourceOrder
                })
            )
        }

        return chapters
    }

    // Provides pages for chapter
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        let chapterData = (await makeRequest(
            this.stateManager,
            this.requestManager,
            `mutation MyMutation($id: Int!) {
                fetchChapterPages(input: {chapterId: $id}) {
                    pages
                  }
            }`,
            { "id": chapterId } as chapterListRequestVariables
        ))["fetchChapterPages"]["pages"]

        const pages: string[] = []
        console.log(JSON.stringify(chapterData))
        // Tachidesk uses page count, so make an array of length pageCount then use the keys of array LOL
        // pretty much a for i in range() from python
        for (const page of chapterData){
            pages.push((await getServerURL(this.stateManager)) + page)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages
        })
    }

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

        // Gets setting value to determine how to handle updated section
        const recentlyUpdatedDuplicates = await getRecentlyUpdatedDuplicates(this.stateManager)

        // Push Sections
        if (updatedRowState) {
            sections.push({
                section: App.createHomeSection({
                    id: "updated",
                    title: "Recently Updated",
                    containsMoreItems: true,
                    type: HomeSectionType[updatedRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                }),
                type: "updated",
                requestBody:
                    `query MyQuery {
                    chapters(
                      orderBy: FETCHED_AT
                      orderByType: DESC
                      filter: {inLibrary: {equalTo: true}}
                    ) {
                      nodes {
                        id
                        chapterNumber
                        name
                        manga {
                          id
                          title
                          thumbnailUrl
                        }
                      }
                    }
                }`,
                requestVariables: {}
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
                    type: "category",
                    requestBody:
                        `query MyQuery($id: Int!) {
                        category(id: $id) {
                          mangas {
                            nodes {
                              id
                              title
                              thumbnailUrl
                              chapters {
                                edges {
                                  node {
                                    name
                                  }
                                }
                              }
                            }
                          }
                        }
                    }`,
                    requestVariables: { "id": categoryId }
                })
            }
        }

        if (sourceRowState) {
            const serverSources = await getServerSources(this.stateManager);
            const selectedSources = await getSelectedSources(this.stateManager);

            for (const sourceId of selectedSources) {
                sections.push({
                    section: App.createHomeSection({
                        id: "popular-" + sourceId,
                        title: getSourceNameFromId(serverSources, sourceId) + " (Popular)",
                        containsMoreItems: true,
                        type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                    }),
                    type: "source",
                    requestBody:
                        `mutation MyMutation($source: LongString!, $page: Int!) {
                        fetchSourceManga(
                          input: {source: $source, type: POPULAR, page: $page}
                        ) {
                          hasNextPage
                          mangas {
                            id
                            title
                            thumbnailUrl
                          }
                        }
                    }`,
                    requestVariables: { "source": sourceId, "page": "1" }
                })

                if (getSourceFromId(serverSources, sourceId).supportsLatest) {
                    sections.push({
                        section: App.createHomeSection({
                            id: "latest-" + sourceId,
                            title: getSourceNameFromId(serverSources, sourceId) + " (Latest)",
                            containsMoreItems: true,
                            type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                        }),
                        type: "source",
                        requestBody:
                            `mutation MyMutation($source: LongString!, $page: Int!) {
                            fetchSourceManga(
                              input: {source: $source, type: LATEST, page: $page}
                            ) {
                              hasNextPage
                              mangas {
                                id
                                title
                                thumbnailUrl
                              }
                            }
                        }`,
                        requestVariables: { "source": sourceId, "page": "1" }
                    })
                }
            }
        }

        for (const section of sections) {
            sectionCallback(section.section)

            promises.push(
                makeRequest(this.stateManager, this.requestManager, section.requestBody, section.requestVariables).then(
                    async response => {

                        const tiles: any[] = []
                        if (section.type === "updated") {
                            const chapterList = response["chapters"]["nodes"]
                            let mangaIds: any[] = []

                            for (const chapter of chapterList.slice(0, mangaPerRow)) {
                                if ((!recentlyUpdatedDuplicates && !mangaIds.includes(JSON.stringify(chapter["manga"]["id"]))) || recentlyUpdatedDuplicates) {
                                    tiles.push(
                                        App.createPartialSourceManga({
                                            mangaId: JSON.stringify(chapter["manga"]["id"]),
                                            image: (await getServerURL(this.stateManager)) + chapter["manga"]["thumbnailUrl"],
                                            title: chapter["manga"]["title"],
                                            subtitle: chapter["name"],
                                        })
                                    )
                                }
                            }
                        }
                        else {
                            let mangaList: any[] = [];
                            if (section.type === "category") {
                                mangaList = response["category"]["mangas"]["nodes"]
                            }
                            else if (section.type === "source") {
                                mangaList = response["fetchSourceManga"]["mangas"]
                            }

                            for (const manga of mangaList.slice(0, mangaPerRow)) {
                                tiles.push(
                                    App.createPartialSourceManga({
                                        mangaId: JSON.stringify(manga["id"]),
                                        image: (await getServerURL(this.stateManager)) + manga["thumbnailUrl"],
                                        title: manga["title"]
                                    })
                                )
                            }
                        }

                        section.section.items = tiles
                        sectionCallback(section.section)
                    }
                )
            )
        }

        await Promise.all(promises)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const recentlyUpdatedDuplicates = await getRecentlyUpdatedDuplicates(this.stateManager)
        const sourceId = homepageSectionId.split('-').pop() ?? ""
        const type = homepageSectionId.split("-")[0]

        const tiles = [];
        let page;
        let hasNextPage;
        let response;
        let tileData: any;

        switch (type){
            case "updated":
                page = metadata?.page ?? 0
                response = await makeRequest(
                    this.stateManager,
                    this.requestManager,
                    `query MyQuery($first: Int!, $offset: Int!) {
                        chapters(
                          orderBy: FETCHED_AT
                          orderByType: DESC
                          filter: {inLibrary: {equalTo: true}}
                          first: $first
                          offset: $offset
                        ) {
                          nodes {
                            id
                            chapterNumber
                            name
                            manga {
                              id
                              title
                              thumbnailUrl
                            }
                          }
                          totalCount
                        }
                    }`,
                    {"first": "20", "offset": page * 20}
                )
                tileData = response["chapters"]["nodes"]
                hasNextPage = page * 20 < response["chapters"]["totalCount"]
                break

            case "category":
                page = metadata?.page ?? undefined
                response = await makeRequest(
                    this.stateManager,
                    this.requestManager,
                    `query MyQuery($id: Int!) {
                        category(id: $id) {
                          mangas {
                            nodes {
                              id
                              title
                              thumbnailUrl
                              chapters {
                                edges {
                                  node {
                                    name
                                  }
                                }
                              }
                            }
                          }
                        }
                    }`,
                    { "id": sourceId }
                )
                tileData = response["category"]["mangas"]["nodes"]
                hasNextPage = false
                break

            case "popular":
                page = metadata?.page ?? 1
                response = await makeRequest(
                    this.stateManager, 
                    this.requestManager,
                    `mutation MyMutation($source: LongString!, $page: Int!) {
                        fetchSourceManga(
                        input: {source: $source, type: POPULAR, page: $page}
                        ) {
                            hasNextPage
                            mangas {
                                id
                                title
                                thumbnailUrl
                            }
                        }
                    }`,
                    { "source": sourceId, "page": page }    
                    )
                    tileData = response["fetchSourceManga"]["mangas"]
                    hasNextPage = response["fetchSourceManga"]["hasNextPage"]
                    break

            case "latest":
                page = metadata?.page ?? 1
                response = await makeRequest(
                    this.stateManager,
                    this.requestManager,
                    `mutation MyMutation($source: LongString!, $page: Int!) {
                        fetchSourceManga(
                        input: {source: $source, type: LATEST, page: $page}
                        ) {
                            hasNextPage
                            mangas {
                                id
                                title
                                thumbnailUrl
                            }
                        }
                    }`,
                    { "source": sourceId, "page": page }  
                )
                hasNextPage = response["fetchSourceManga"]["hasNextPage"]
                break
            default:
                break
        }

        console.log(JSON.stringify(response))
        // Use mangaIds to ensure duplicate filter
        let mangaIds : any[] = []
        // updated list has a manga data and chapter data so have to specify.
         // Treats each type of tile different, updated section gets the chapter name as subtitle.
         for (const mangaResponse of tileData) {
            
            if (type === "updated") {
                if ((!recentlyUpdatedDuplicates && !mangaIds.includes(JSON.stringify(mangaResponse["manga"]["id"]))) || recentlyUpdatedDuplicates) {
                    tiles.push(
                        App.createPartialSourceManga({
                            mangaId: JSON.stringify(mangaResponse["manga"]["id"]),
                            image: (await getServerURL(this.stateManager)) + mangaResponse["manga"]["thumbnailUrl"],
                            title: mangaResponse["manga"]["title"],
                            subtitle: mangaResponse["name"],
                        })
                    )
                }
                mangaIds.push(mangaResponse["manga"]["id"])
            }

            else {
                tiles.push(
                    App.createPartialSourceManga({
                        mangaId: JSON.stringify(mangaResponse["id"]),
                        image: (await getServerURL(this.stateManager)) + mangaResponse["thumbnailUrl"],
                        title: mangaResponse["title"]
                    })
                )
            }
        }

        // Pushes the page number and results along
        metadata = hasNextPage ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: tiles,
            metadata: metadata
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const selectedSources = await getSelectedSources(this.stateManager)
        const meta_sources: { [key: string]: boolean } = metadata?.sources ?? {}
        const page: number = metadata?.page ?? 1;

        const tiles = []
        for (const source of selectedSources) {
            if (page !== 1) {
                if (!meta_sources[source]) continue
            }

            const mangaResults = await makeRequest(
                this.stateManager, 
                this.requestManager,
                `mutation MyMutation($source: LongString! , $query: String!, $page: Int!) {
                    fetchSourceManga(
                      input: {source: $source, type: SEARCH, query: $query, page: $page}
                    ) {
                      hasNextPage
                      mangas {
                        id
                        title
                        thumbnailUrl
                        source {
                            displayName
                          }
                      }
                    }
                  }`,
                  {"source": source, "query": query.title, "page": page})

            // If request result is an error (evaluated by makeRequest), then skip source
            // This stops individual sources from messing up the whole search process.
            if (mangaResults instanceof Error){
                continue
            }

            for (const manga of mangaResults["fetchSourceManga"]["mangas"]) {
                tiles.push(
                    App.createPartialSourceManga({
                        mangaId: JSON.stringify(manga["id"]),
                        image: (await getServerURL(this.stateManager)) + manga["thumbnailUrl"],
                        title: manga["title"],
                        subtitle: manga["source"]["displayName"]
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