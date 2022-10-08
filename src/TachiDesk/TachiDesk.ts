import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    Manga,
    MangaStatus,
    MangaTile,
    MangaUpdates,
    PagedResults,
    Response,
    SearchRequest,
    Section,
    Source,
    SourceInfo,
    TagSection,
    TagType,
} from "paperback-extensions-common";

import {parseLangCode} from "./Languages";

import {getSources, getSourcesList, resetSettingsButton, serverSettingsMenu, TDSettings, TDSource, TDSources, testServerSettingsMenu,} from "./Settings";

import {
    getAuthorizationString,
    getTachiAPI,
    getOptions,
    getServerUnavailableMangaTiles,
    SearchData
} from "./Common";

// This source use Tachi REST API
// https://tachiurl/api/swagger-u

// Manga are represented by `series`
// Chapters are represented by `books`

// The Basic Authentication is handled by the interceptor

// Code and method used by both the source and the tracker are defined in the duplicated `TachiCommon.ts` file

// Due to the self hosted nature of Tachi, this source requires the user to enter its server credentials in the source settings menu
// Some methods are known to throw errors without specific actions from the user. They try to prevent this behavior when server settings are not set.
// This include:
//  - homepage sections
//  - getTags() which is called on the homepage
//  - search method which is called even if the user search in an other source

export const TachiDeskInfo: SourceInfo = {
    version: "0.0.1",
    name: "Tachidesk",
    icon: "icon.png",
    author: "Alles",
    authorWebsite: "https://github.com/AlexZorzi",
    description: "Tachidesk extension",
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    sourceTags: [
        {
            text: "Tachiyomi Magic",
            type: TagType.RED,
        },
    ],
};


export const parseMangaStatus = (tachiStatus: string): MangaStatus => {
    switch (tachiStatus) {
        case "ENDED":
            return MangaStatus.COMPLETED;
        case "ONGOING":
            return MangaStatus.ONGOING;
        case "ABANDONED":
            return MangaStatus.ONGOING;
        case "HIATUS":
            return MangaStatus.ONGOING;
    }
    return MangaStatus.ONGOING;
};

export const capitalize = (tag: string): string => {
    return tag.replace(/^\w/, (c) => c.toUpperCase());
};


export class TachiDesk extends Source {
    stateManager = createSourceStateManager({});

    requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
    });

    override async getSourceMenu(): Promise<Section> {
        return createSection({
            id: "main",
            header: "Source Settings",
            rows: async () => [
                serverSettingsMenu(this.stateManager),
                testServerSettingsMenu(this.stateManager, this.requestManager),
                resetSettingsButton(this.stateManager),
                TDSettings(this.stateManager)
            ],
        });
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {    
        const tachiAPI = await getTachiAPI(this.stateManager);

        const request = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/`,
            method: "GET",
        });

        const response = await this.requestManager.schedule(request, 1);
        const result =
            typeof response.data === "string"
                ? JSON.parse(response.data)
                : response.data;
        const tagSections: [TagSection] = [
            createTagSection({ id: "0", label: "genres", tags: [] }),
        ];
        // For each tag, we append a type identifier to its id and capitalize its label
        tagSections[0].tags = result.genre.map((elem: string) =>
            createTag({ id: "genre-" + elem, label: capitalize(elem) })
        );

        const authors: string[] = [result.author];
        const artists: string[] = [result.artist];

        

        return createManga({
            id: mangaId,
            titles: [result.title],
            image: `${tachiAPI}/manga/${mangaId}/thumbnail`,
            status: parseMangaStatus(result.status),
            // langFlag: metadata.language,
            langFlag: "Todo",
            // Unused: langName

            artist: artists.join(", "),
            author: authors.join(", "),

            desc: result.description ? result.description : "No summary",
            tags: tagSections,
            // lastUpdate: result.lastModified,
            lastUpdate: new Date(),

        });
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {

        const tachiAPI = await getTachiAPI(this.stateManager);

        const chapterRequest = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/chapters`,
            param: "",
            method: "GET",
        });

        const chaptersResponse = await this.requestManager.schedule(chapterRequest, 2);
        const chaptersResult =
            typeof chaptersResponse.data === "string"
                ? JSON.parse(chaptersResponse.data)
                : chaptersResponse.data;

        const chapters: Chapter[] = [];

        const languageCode = parseLangCode("Todo");

        for (const chapter of chaptersResult) {

            chapters.push(
                createChapter({
                    id: String(chapter.index),
                    mangaId: mangaId,
                    chapNum: parseFloat(chapter.chapterNumber),
                    //langCode: languageCode,
                    name: `${chapter.name}`,
                    time: new Date(chapter.uploadDate),
                    // @ts-ignore
                    sortingIndex: chapter.index
                })
            );
        }

        return chapters;
    }

    async getChapterDetails(
        mangaId: string,
        chapterId: string
    ): Promise<ChapterDetails> {
        const tachiAPI = await getTachiAPI(this.stateManager);

        const request = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/chapter/${chapterId}`,
            method: "GET",
        });

        const data = await this.requestManager.schedule(request, 1);
        const result =
            typeof data.data === "string" ? JSON.parse(data.data) : data.data;

        const pages: string[] = [];
        
        for (const pageindex of Array(result.pageCount - 1).keys()) {
            pages.push(`${tachiAPI}/manga/${mangaId}/chapter/${chapterId}/page/${pageindex}`);
        }

        return createChapterDetails({
            id: chapterId,
            longStrip: true,
            mangaId: mangaId,
            pages: pages,
        });
    }

    
    override async getSearchResults(
        searchQuery: SearchRequest,
        metadata: any
    ): Promise<PagedResults> {
    const tachiAPI = await getTachiAPI(this.stateManager);
    const SourcesList = await getSourcesList(this.stateManager)
    const SelectedSources = TDSources.getSelectedSources(SourcesList)

    if (tachiAPI === null) {
        console.log("searchRequest failed because server settings are unset");
        return createPagedResults({
            results: getServerUnavailableMangaTiles(),
        });
    }

    const page: number = metadata?.page ?? 1;
    const meta_sources: {[key:string]: boolean} = metadata?.sources ?? {}

    const paramsList = [`pageNum=${page}`];

    if (searchQuery.title !== undefined && searchQuery.title !== "") {
        paramsList.push("searchTerm=" + encodeURIComponent(searchQuery.title));
    }

    let paramsString = "";
    if (paramsList.length > 0) {
        paramsString = "?" + paramsList.join("&");
    }

    const tiles = [];
    for (const source of SelectedSources) {

        if(page !== 1){
            if(!meta_sources[source.id]) continue
        }

        const request = createRequestObject({
            url: `${tachiAPI}/source/${source.id}/search${paramsString}`,
            method: "GET",
        });

        let response: Response;
        try {
            response = await this.requestManager.schedule(request, 1);
            if(response.status != 200){
                continue
            }
        } catch (error) {
            console.log(`searchRequest failed with error: ${error}`);
            return createPagedResults({
                results: getServerUnavailableMangaTiles(),
            });
        }

        let data: SearchData
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }
        for (const serie of data.mangaList) {
            tiles.push(
                createMangaTile({
                    id: String(serie.id),
                    title: createIconText({ text: serie.title }),
                    subtitleText: createIconText({text: source.displayName}),
                    image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                })
            );
        }
        meta_sources[source.id] = data.hasNextPage
    }

    metadata = tiles.length !== 0 ? { page: page + 1, sources: meta_sources } : undefined

    return createPagedResults({
        results: tiles,
        metadata,
    });
    }

    override async getHomePageSections(
        sectionCallback: (section: HomeSection) => void
    ): Promise<void> {
        getSources(this.stateManager)

        const tachiAPI = await getTachiAPI(this.stateManager);
        const SourcesList = await getSourcesList(this.stateManager)
        const SelectedSources = TDSources.getSelectedSources(SourcesList)
        
        if (tachiAPI === null) {
            console.log("searchRequest failed because server settings are unset");
            const section = createHomeSection({
                id: "unset",
                title: "Go to source settings to set your Tachi server credentials.",
                view_more: false,
                items: getServerUnavailableMangaTiles(),
            });
            sectionCallback(section);
            return;
        }

        const sections = [];


        for(const source of SelectedSources){
            sections.push({
                section: createHomeSection({
                    id: `popular-${source.id}`,
                    title: `${source.displayName} Popular`,
                    view_more: true,
                }),
                request: createRequestObject({
                    url: encodeURI(`${tachiAPI}/source/${source.id}/popular/1`),
                    method: 'GET',
                }),
                subtitle: source.displayName
            })

            if(source.supportsLatest){
                sections.push({
                    section: createHomeSection({
                        id: `latest-${source.id}`,
                        title: `${source.displayName} Latest`,
                        view_more: true,
                    }),
                    request: createRequestObject({
                        url: encodeURI(`${tachiAPI}/source/${source.id}/latest/1`),
                        method: 'GET',
                    }),
                    subtitle: source.displayName
                })
            }
        }


        const promises: Promise<void>[] = [];

        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    let data: SearchData

                    try {
                        data = JSON.parse(response.data)
                    } catch (e) {
                        throw new Error(`${e}`)
                    }

                    const tiles = [];

                    for (const serie of data.mangaList) {
                        tiles.push(
                            createMangaTile({
                                id: serie.id.toString(),
                                title: createIconText({ text: serie.title }),
                                image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                                subtitleText: createIconText({ text: section.subtitle })
                            })
                        );
                    }
                    section.section.items = tiles
                    sectionCallback(section.section);
                }),
            )
        }

        // Make sure the function completes
        await Promise.all(promises);
    }

    override async getViewMoreItems(
        homepageSectionId: string,
        metadata: any
    ): Promise<PagedResults> {
        const tachiAPI = await getTachiAPI(this.stateManager);
        const page: number = metadata?.page ?? 1;
        const sourceId = homepageSectionId.split('-')?.pop() ?? ''

        const SelectedSources: TDSource[] = TDSources.getSelectedSources([sourceId]) ?? []

        const request = createRequestObject({
            url: `${tachiAPI}/source/${sourceId}/${homepageSectionId.includes('latest-') ? 'latest' : 'popular'}/${page}`,
            method: "GET",
        });

        const response = await this.requestManager.schedule(request, 1);
        let data: SearchData

        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }
        const tiles: MangaTile[] = [];
        for (const serie of data.mangaList) {
            tiles.push(
                createMangaTile({
                    id: serie.id.toString(),
                    title: createIconText({ text: serie.title }),
                    image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                    subtitleText: createIconText({ text: SelectedSources.map(x => x.displayName)[0] ?? '' })
                })
            );
        }

        metadata = data.hasNextPage ? {page: page + 1} : undefined

        return createPagedResults({
            results: tiles,
            metadata: metadata,
        });
    }

    /*override async filterUpdatedManga(
        mangaUpdatesFoundCallback: (updates: MangaUpdates) => void,
        time: Date,
        ids: string[]
    ): Promise<void> {
        const tachiAPI = await getTachiAPI(this.stateManager);

        // We make requests of PAGE_SIZE titles to `series/updated/` until we got every titles
        // or we got a title which `lastModified` metadata is older than `time`
        let page = 0;
        const foundIds: string[] = [];
        let loadMore = true;

        while (loadMore) {
            const request = createRequestObject({
                url: `${tachiAPI}/series/updated/`,
                param: `?page=${page}&size=${PAGE_SIZE}&deleted=false`,
                method: "GET",
            });

            const data = await this.requestManager.schedule(request, 1);
            const result =
                typeof data.data === "string" ? JSON.parse(data.data) : data.data;

            for (const serie of result.content) {
                const serieUpdated = new Date(serie.metadata.lastModified);

                if (serieUpdated >= time) {
                    if (ids.includes(serie)) {
                        foundIds.push(serie);
                    }
                } else {
                    loadMore = false;
                    break;
                }
            }

            // If no series were returned we are on the last page
            if (result.content.length === 0) {
                loadMore = false;
            }

            page = page + 1;

            if (foundIds.length > 0) {
                mangaUpdatesFoundCallback(
                    createMangaUpdates({
                        ids: foundIds,
                    })
                );
            }
        }
    }*/
}


