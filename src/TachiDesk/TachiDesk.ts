import {
    Chapter,
    ChapterDetails,
    PagedResults,
    SourceManga,
    HomeSection,
    SearchRequest,
    SourceInfo,
    ContentRating,
    TagSection,
    HomeSectionType,
    ChapterProviding,
    SourceIntents,
    DUISection,
    SearchResultsProviding,
    HomePageSectionsProviding,
    BadgeColor,
} from '@paperback/types'

import {
    TachiAPIClass,
    TachiCategoriesClass,
    TachiSourcesClass,
    serverUnavailableMangaTiles
} from './Common';

import {
    resetSettingsButton,
    selectedCategoriesSettings,
    selectedSourcesSettings,
    serverAddressSettings
} from './Settings';

export const TachideskInfo: SourceInfo = {
    author: 'ofelizestevez & Alles',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Tachidesk',
    version: '1.0',
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

export class Tachidesk implements HomePageSectionsProviding, ChapterProviding, SearchResultsProviding {

    // Paperback required defaults
    // Statemanager saves states for the extension (like localstorage api)
    // Request manager makes HTTP requests
    stateManager = App.createSourceStateManager();
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
    });

    // Tachidesk essentials. Packages up code neatly so it could be used in multiple places cleanly
    // TachiAPI handles the server address and making requests
    // TachiSources and TachiCategories handle library items (sources, categories)
    tachiAPI = new TachiAPIClass().init(this.stateManager);
    tachiSources = new TachiSourcesClass();
    tachiCategories = new TachiCategoriesClass();

    // Variable used for getMangaShareUrl. Updated by getChapters, meaning that it updates the server address everytime the user opens a manga
    // Technically it doesn't have to be updated this often, thus it has room for improvement
    serverAddress = ""

    // Provides the settings for the extension
    async getSourceMenu(): Promise<DUISection> {
        const tachiAPI = await this.tachiAPI;
        return App.createDUISection({
            id: "main",
            header: "Source Settings",
            isHidden: false,
            rows: async () => [
                serverAddressSettings(this.stateManager, this.requestManager, tachiAPI),
                await selectedSourcesSettings(this.stateManager, this.requestManager, tachiAPI, this.tachiSources),
                await selectedCategoriesSettings(this.stateManager, this.requestManager, tachiAPI, this.tachiCategories),
                resetSettingsButton(this.stateManager, tachiAPI, this.tachiSources, this.tachiCategories),
            ]
        })
    }

    // Provides share url for manga share button, if statement seems to not work
    getMangaShareUrl(mangaId: string): string {
        if (this.serverAddress != "") {
            return this.serverAddress + "/manga/" + mangaId
        }
        return ""
    }

    // Provides paperback with all of the details of the manga
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const tachiAPI = await this.tachiAPI;

        const manga = await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId)
        // throw new Error(this.serverAddress)
        const image = await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl;

        const artist = manga.artist;
        const author = manga.author;
        const desc = manga.description;
        const status = manga.status;
        const titles = [manga.title];
        const tags: [TagSection] = [
            App.createTagSection({
                id: "0", label: "genres", tags:
                    manga.genre.map((tag: string) => App.createTag({
                        id: tag,
                        label: tag
                    }))
            }),
        ];

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                image,
                author,
                artist,
                desc,
                status,
                tags
            })
        })
    }

    // Provides paperback with list of chapters, updates this.serverAddress
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const tachiAPI = await this.tachiAPI

        const chaptersData = await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId + "/chapters")
        this.serverAddress = await tachiAPI.getServerAddress(this.stateManager)

        const chapters: Chapter[] = []


        for (const chapter of chaptersData) {
            const id = String(chapter.index);
            const chapNum = parseFloat(chapter.chapterNumber);
            const name = chapter.name;
            const time = new Date(chapter.uploadDate);
            const sortingIndex = chapter.index;

            chapters.push(
                App.createChapter({
                    id,
                    name,
                    chapNum,
                    time,
                    sortingIndex
                })
            )
        }

        return chapters
    }

    // Called when user opens a manga. It's used to get the page links
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const tachiAPI = await this.tachiAPI

        const chapterResponse = await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId + "/chapter/" + chapterId)
        const pages: string[] = []

        await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId + "/chapter/" + chapterId, "PUT", {
            "read": "true",
            "bookmarked": "",
            "markPrevRead": "",
            "lastPageRead": ""
        }, {
            "Content-Type": "application/json",
        })

        for (const pageIndex of Array(chapterResponse.pageCount).keys()) {
            pages.push(tachiAPI.getBaseURL() + "/manga/" + mangaId + "/chapter/" + chapterId + "/page/" + pageIndex)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages
        })
    }

    // Builds the homepage sections. It handles "Updated", "Categories", and "Sources" all by itself.
    // Could be divided into multiple functions.
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const promises: Promise<void>[] = []
        const sections = []
        const tachiAPI = await this.tachiAPI

        const tachiSources = await this.tachiSources.init(this.stateManager, this.requestManager, tachiAPI)
        const tachiCategories = await this.tachiCategories.init(this.stateManager, this.requestManager, tachiAPI)

        // If we get a bad request, it will give us a server error manga tile.
        if (tachiSources instanceof Error) {
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
        if (tachiCategories instanceof Error) {
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
        // Last test to ensure that we can connect to the server
        if ((await this.tachiAPI).makeRequest(this.requestManager, "/settings/about") instanceof Error) {
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

        // Updated featured Section
        sections.push({
            section: App.createHomeSection({
                id: "updated",
                title: "Last Updated",
                containsMoreItems: true,
                type: HomeSectionType.featured
            }),
            request: App.createRequest({
                url: tachiAPI.getBaseURL() + "/update/recentChapters/0",
                method: "GET"
            }),
            subtitle: "",
            type: "update"
        })

        // Category Sections
        for (const categoryId of await tachiCategories.getSelectedCategories(this.stateManager)) {
            sections.push({
                section: App.createHomeSection({
                    id: "category-" + categoryId,
                    title: tachiCategories.getSelectedCategoryFromId(categoryId as string),
                    containsMoreItems: false,
                    type: HomeSectionType.singleRowLarge
                }),
                request: App.createRequest({
                    url: tachiAPI.getBaseURL() + "/category/" + categoryId,
                    method: "GET"
                }),
                subtitle: "",
                type: "category"
            })
        }

        // Source Sections
        for (const sourceId of await tachiSources.getSelectedSources(this.stateManager)) {
            sections.push({
                section: App.createHomeSection({
                    id: "popular-" + sourceId,
                    title: tachiSources.getSourceNameFromId(sourceId) + " Popular",
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                }),
                request: App.createRequest({
                    url: tachiAPI.getBaseURL() + "/source/" + sourceId + "/popular/1",
                    method: "GET"
                }),
                subtitle: tachiSources.getSourceNameFromId(sourceId as string),
                type: "source"
            })

            if (tachiSources.getAllSources()[sourceId]["supportsLatest"]) {
                sections.push({
                    section: App.createHomeSection({
                        id: "latest-" + sourceId,
                        title: tachiSources.getSourceNameFromId(sourceId) + " Latest",
                        containsMoreItems: true,
                        type: HomeSectionType.singleRowNormal
                    }),
                    request: App.createRequest({
                        url: tachiAPI.getBaseURL() + "/source/" + sourceId + "/latest/1",
                        method: "GET"
                    }),
                    subtitle: tachiSources.getSourceNameFromId(sourceId as string),
                    type: "source"
                })
            }
        }
        // run promises
        for (const section of sections) {
            sectionCallback(section.section)

            promises.push(
                this.requestManager.schedule(section.request, 1).then(async response => {
                    const json = JSON.parse(response.data ?? "")
                    const tiles = []
                    if (section.type == "update") {

                        for (const manga of json.page) {
                            tiles.push(
                                App.createPartialSourceManga({
                                    title: manga.chapter.name,
                                    mangaId: manga.manga.id.toString(),
                                    image: await tachiAPI.getServerAddress(this.stateManager) + manga.manga.thumbnailUrl,
                                    subtitle: ""
                                })
                            )

                        }
                    }

                    if (section.type == "category") {
                        for (const manga of json) {
                            tiles.push(
                                App.createPartialSourceManga({
                                    title: manga.title,
                                    mangaId: manga.id.toString(),
                                    image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl
                                })
                            )
                        }
                    }
                    if (section.type == "source") {
                        for (const manga of json.mangaList) {
                            tiles.push(
                                App.createPartialSourceManga({
                                    title: manga.title,
                                    mangaId: manga.id.toString(),
                                    image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl,
                                    subtitle: section.subtitle
                                })
                            )
                        }
                    }



                    section.section.items = tiles
                    sectionCallback(section.section)
                })
            )
        }
        // awit promise all
        await Promise.all(promises)
    }

    // Handles when users click on the "more" button in the homepage.
    // Currently only set up to work with sources
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;
        const sourceId = homepageSectionId.split('-').pop() ?? ""
        const type = homepageSectionId.split("-")[0]
        const tachiAPI = await this.tachiAPI
        const tachiSources = await this.tachiSources.init(this.stateManager, this.requestManager, tachiAPI)

        if (tachiSources instanceof Error) {
            throw tachiSources;
        }

        const tileData = await tachiAPI.makeRequest(this.requestManager, "/source/" + sourceId + "/" + type + "/" + page)
        const tiles = []

        for (const tile of tileData.mangaList) {
            tiles.push(
                App.createPartialSourceManga({
                    mangaId: tile.id.toString(),
                    title: tile.title,
                    image: await tachiAPI.getServerAddress(this.stateManager) + tile.thumbnailUrl,
                })
            )
        }

        metadata = tileData.hasNextPage ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: tiles,
            metadata: metadata
        })
    }

    // Handles search
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const tachiAPI = await this.tachiAPI
        const tachiSources = await this.tachiSources.init(this.stateManager, this.requestManager, tachiAPI)

        if (tachiSources instanceof Error) {
            throw tachiSources;
        }

        const selectedSources = await tachiSources.getSelectedSources(this.stateManager)
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
                if (!meta_sources[source.id]) continue
            }

            const mangaResults = await tachiAPI.makeRequest(this.requestManager, "/source/" + source + "/search" + paramsString)

            for (const manga of mangaResults.mangaList) {
                tiles.push(
                    App.createPartialSourceManga({
                        title: manga.title,
                        mangaId: String(manga.id),
                        image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl,
                        subtitle: tachiSources.getSourceNameFromId(manga.sourceId)
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