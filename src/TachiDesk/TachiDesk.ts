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
    CATEGORY_ROW_STATE_KEY,
    CATEGORY_ROW_STYLE_KEY, 
    MANGA_PER_ROW_KEY, 
    SELECTED_CATEGORIES_KEY, 
    SOURCE_ROW_STATE_KEY, 
    SOURCE_ROW_STYLE_KEY, 
    UPDATED_ROW_STATE_KEY, 
    UPDATED_ROW_STYLE_KEY, 
    fetchServerCategories, 
    getCategoryFromId, 
    getCategoryNameFromId, 
    getSelectedSources, 
    getServerAPI, 
    getServerSources, 
    getServerURL, 
    getSourceFromId, 
    getSourceNameFromId, 
    makeRequest, 
    serverUnavailableMangaTiles, 
    tachiChapter, 
    tachiManga,
    testRequest } from "./Common";

// * New 2.0 Version is a rewrite due to it being broken on the new 0.8.7 Builds
// ! It's broken cause of iOS, gg me and not having an https server
// ! Atleast this is smoother than last version (other than the settings, all my homies hate JSManagedValue)
export const TachiDeskInfo: SourceInfo = {
    author: 'ofelizestevez & Alles',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Tachidesk',
    version: '2.0-beta',
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

    serverAddress = ""

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

    getMangaShareUrl(mangaId: string): string {
        if (this.serverAddress != ""){
            return this.serverAddress + "manga/" + mangaId
        }
        return ""
    }

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
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const apiURL = await getServerAPI(this.stateManager)
        const chapterData : tachiChapter = await makeRequest(this.stateManager, this.requestManager, "manga/" + mangaId + "/chapter/" + chapterId)
        await makeRequest(this.stateManager,this.requestManager, "manga/" + mangaId + "/chapter/" + chapterId, "PUT", 
        {
            "read": "true",
            "bookmarked": "",
            "markPrevRead": "",
            "lastPageRead": ""
        },
        {
            "Content-Type": "application/json",
        })

        const pages : string[] = []

        for ( const pageIndex of Array(chapterData.pageCount).keys()){
            pages.push(apiURL + "manga/" + mangaId + "/chapter/" + chapterId + "/page/" + pageIndex)
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

        const mangaPerRow = await this.stateManager.retrieve(MANGA_PER_ROW_KEY);
        const updatedRowState = await this.stateManager.retrieve(UPDATED_ROW_STATE_KEY);
        const categoryRowState = await this.stateManager.retrieve(CATEGORY_ROW_STATE_KEY);
        const sourceRowState = await this.stateManager.retrieve(SOURCE_ROW_STATE_KEY);
        
        const updatedRowStyle = await this.stateManager.retrieve(UPDATED_ROW_STYLE_KEY);
        const categoryRowStyle = await this.stateManager.retrieve(CATEGORY_ROW_STYLE_KEY);
        const sourceRowStyle = await this.stateManager.retrieve(SOURCE_ROW_STYLE_KEY);
        // Push Sections
        // First point where we could break, depending on if the type comes out correctly or not.
        if (updatedRowState){
            sections.push({
                section: App.createHomeSection({
                    id: "updated",
                    title: "Last Updated",
                    containsMoreItems: true,
                    type: HomeSectionType[updatedRowStyle as keyof typeof HomeSectionType]
                }),
                request: App.createRequest({
                    url: (await getServerAPI(this.stateManager)) + "update/recentChapters/0",
                    method: "GET"
                }),
                responseArray: "page",
            })
        }
        if (categoryRowState){
            const serverCategories = await fetchServerCategories(this.stateManager, this.requestManager)
            const selectedCategories : Array<string>= await this.stateManager.retrieve(SELECTED_CATEGORIES_KEY)

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
                        type: HomeSectionType[categoryRowStyle as keyof typeof HomeSectionType]
                    }),
                    request: App.createRequest({
                        url: (await getServerAPI(this.stateManager)) + "category/" + categoryId,
                        method: "GET"
                    }),
                    responseArray: "root"
                })
            }
        }
        if (sourceRowState){
            const serverSources = await getServerSources(this.stateManager);
            const selectedSources = await getSelectedSources(this.stateManager);
            
            for (const sourceId of selectedSources){
                sections.push({
                    section: App.createHomeSection({
                        id: "popular-" + sourceId,
                        title: getSourceNameFromId(serverSources, sourceId) + " (Popular)" ,
                        containsMoreItems: true,
                        type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType]
                    }),
                    request: App.createRequest({
                        url: (await getServerAPI(this.stateManager)) + "source/" + sourceId + "/popular/1",
                        method:"GET"
                    }),
                    responseArray: "mangaList"
                })

                if (getSourceFromId(serverSources, sourceId).supportsLatest){
                    sections.push({
                        section: App.createHomeSection({
                            id: "latest-" + sourceId,
                            title: getSourceNameFromId(serverSources, sourceId) + " (Latest)" ,
                            containsMoreItems: true,
                            type: HomeSectionType[sourceRowStyle as keyof typeof HomeSectionType]
                        }),
                        request: App.createRequest({
                            url: (await getServerAPI(this.stateManager)) + "source/" + sourceId + "/latest/1",
                            method: "GET"
                        }),
                        responseArray: "mangaList"
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

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const sourceId = homepageSectionId.split('-').pop() ?? ""
        const type = homepageSectionId.split("-")[0]

        const tiles = [];
        let page;
        let apiEndpoint : any;
        let response;
        let tileData : any;

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

        metadata = response.hasNextPage ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: tiles,
            metadata: metadata
        })

    }

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