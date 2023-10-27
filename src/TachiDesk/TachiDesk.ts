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
    TagSection
} from "@paperback/types"

import { 
    HomepageSettings,
    resetSettingsButton,
    serverAddressSettings,
} from "./Settings";

import {  
    fetchServerCategories, 
    getCategoryFromId, 
    getCategoryNameFromId, 
    getCategoryRowState, 
    getCategoryRowStyle, 
    getMangaPerRow, 
    getSelectedCategories, 
    getSelectedSources, 
    getServerAPI, 
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
    tachiChapter, 
    tachiManga,
    testRequest 
} from "./Common";

export const TachiDeskInfo: SourceInfo = {
    author: 'ofelizestevez & Alles',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Tachidesk',
    version: '2.0',
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    contentRating: ContentRating.ADULT,
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
        requestTimeout: 20000
    })

    // Variable used for share URL
    serverAddress = ""

    // Settings
    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: "main",
            header: "Source Settings",
            isHidden: false,
            rows: async () => [
                serverAddressSettings(this.stateManager, this.requestManager),
                HomepageSettings(this.stateManager, this.requestManager),
                await resetSettingsButton(this.stateManager)
            ]
        })
    }

    // share URL
    getMangaShareUrl(mangaId: string): string {
        if (this.serverAddress != ""){
            return this.serverAddress + "manga/" + mangaId
        }
        return ""
    }

    // Manga info -> uses TachiManga interface
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const manga : tachiManga = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId)
        const tags : [TagSection] = [
            App.createTagSection({
                id: "0",
                label: "genres",
                tags: manga.genre.map((tag : string) => App.createTag({
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
        const chaptersData : tachiChapter[] = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId + "/chapters")
        this.serverAddress = await getServerURL(this.stateManager)

        const chapters: Chapter[] = []

        for (const chapter of chaptersData){
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
        const chapterData : tachiChapter = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId + "/chapter/" + chapterId)

        const pages : string[] = []

        // Tachidesk uses page count, so for keys makes it easy to provide the links
        for ( const pageIndex of Array(chapterData.pageCount).keys()){
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
        
        // Error Checking here!!!
        if (await testRequest(this.stateManager, this.requestManager) instanceof Error){
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

        // Gets the settings values to set the type of rows
        const mangaPerRow = await getMangaPerRow(this.stateManager);
        const updatedRowState = await getUpdatedRowState(this.stateManager);
        const categoryRowState = await getCategoryRowState(this.stateManager);
        const sourceRowState = await getSourceRowState(this.stateManager);
        const updatedRowStyle = (await getUpdatedRowStyle(this.stateManager))[0];
        const categoryRowStyle = (await getCategoryRowStyle(this.stateManager))[0];
        const sourceRowStyle = (await getSourceRowStyle(this.stateManager))[0];
        
        // Push Sections
        if (updatedRowState){
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
        if (categoryRowState){
            const serverCategories = await fetchServerCategories(this.stateManager, this.requestManager)
            const selectedCategories : Array<string>= await getSelectedCategories(this.stateManager)

            // Gets the information of selected sources to compare their order on the tachidesk server
            const orderedSelectedCategories = Object.keys(serverCategories)
            .filter((key) => selectedCategories.includes(key))
            .sort((a,b) => {
                const aOrder = getCategoryFromId(serverCategories, a).order
                const bOrder = getCategoryFromId(serverCategories, b).order
                
                if (aOrder < bOrder){
                    return -1
                }
                else if (aOrder > bOrder){
                    return 1
                }
                return 0
            }) 
            
            for (const categoryId of orderedSelectedCategories){
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
        if (sourceRowState){
            const serverSources = await getServerSources(this.stateManager);
            const selectedSources = await getSelectedSources(this.stateManager);
            
            // Adds popular and latest... there might be a way to handle this better (option) but... thats a lot of sources
            for (const sourceId of selectedSources){
                sections.push({
                    section: App.createHomeSection({
                        id: "popular-" + sourceId,
                        title: getSourceNameFromId(serverSources, sourceId) + " (Popular)" ,
                        containsMoreItems: true,
                        type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType] //Converts String to HomeSectionType
                    }),
                    request: App.createRequest({
                        url: (await getServerAPI(this.stateManager)) + "source/" + sourceId + "/popular/1",
                        method:"GET"
                    }),
                    responseArray: "mangaList" //Refers to array of manga being inside the response's mangaList key
                })

                if (getSourceFromId(serverSources, sourceId).supportsLatest){
                    sections.push({
                        section: App.createHomeSection({
                            id: "latest-" + sourceId,
                            title: getSourceNameFromId(serverSources, sourceId) + " (Latest)" ,
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
        for (const section of sections){
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
                    for (const mangaResponse of data.slice(0,mangaPerRow)){
                        let manga : tachiManga;
                        if (section.responseArray === "page"){
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
        let apiEndpoint : any;
        let response;
        let tileData : any;

        // uses type of source to determine where to get the manga list and the api link
        switch (type) {
            case "updated":
                page = metadata?.page ?? 0
                apiEndpoint = "update/recentChapters/" + page;
                response = (await makeRequest(this.stateManager, this.requestManager, apiEndpoint));
                tileData = response.page
                break
            case "category":
                page = metadata?.page ?? undefined
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
        for (const mangaResponse of tileData){
            let manga : tachiManga;
            if (type === "updated"){
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

    // For now only supports searching sources. I think this has something to do with genres / tags as well but honestly haven't looked into it
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
            for (const manga of mangaResults.mangaList){
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