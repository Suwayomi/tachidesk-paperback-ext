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
    Request,
    RequestInterceptor,
    Response,
    SearchRequest,
    Section,
    Source,
    SourceInfo,
    SourceStateManager,
    TagSection,
    TagType,
} from "paperback-extensions-common";

import {parseLangCode} from "./Languages";

import {getSources, getSourcesList, resetSettingsButton, serverSettingsMenu, TDSettings, TDSources, testServerSettingsMenu,} from "./Settings";

import {
    getAuthorizationString,
    getTachiAPI,
    getOptions,
    getServerUnavailableMangaTiles,
    searchRequest,
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
    websiteBaseURL: "https://owlynights.com",
    sourceTags: [
        {
            text: "Tachiyomi Magic",
            type: TagType.RED,
        },
    ],
};

const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
];

// Number of items requested for paged requests
const PAGE_SIZE = 40;

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

    override async getTags(): Promise<TagSection[]> {
        // This function is called on the homepage and should not throw if the server is unavailable
        return [];
        // We define four types of tags:
        // - `genre`
        // - `tag`
        // - `collection`
        // - `library`
        // To be able to make the difference between theses types, we append `genre-` or `tag-` at the beginning of the tag id

        let genresResponse: Response,
            tagsResponse: Response,
            collectionResponse: Response,
            libraryResponse: Response;

        // We try to make the requests. If this fail, we return a placeholder tags list to inform the user and prevent the function from throwing an error
        try {
            const tachiAPI = await getTachiAPI(this.stateManager);

            const genresRequest = createRequestObject({
                url: `${tachiAPI}/genres/`,
                method: "GET",
            });
            genresResponse = await this.requestManager.schedule(genresRequest, 1);

            const tagsRequest = createRequestObject({
                url: `${tachiAPI}/tags/series/`,
                method: "GET",
            });
            tagsResponse = await this.requestManager.schedule(tagsRequest, 1);

            const collectionRequest = createRequestObject({
                url: `${tachiAPI}/collections/`,
                method: "GET",
            });
            collectionResponse = await this.requestManager.schedule(collectionRequest, 1);

            const libraryRequest = createRequestObject({
                url: `${tachiAPI}/libraries/`,
                method: "GET",
            });
            libraryResponse = await this.requestManager.schedule(libraryRequest, 1);
        } catch (error) {
            console.log(`getTags failed with error: ${error}`);
            return [
                createTagSection({ id: "-1", label: "Server unavailable", tags: [] }),
            ];
        }

        // The following part of the function should throw if there is an error and thus is not in the try/catch block

        const genresResult =
            typeof genresResponse.data === "string"
                ? JSON.parse(genresResponse.data)
                : genresResponse.data;

        const tagsResult =
            typeof tagsResponse.data === "string"
                ? JSON.parse(tagsResponse.data)
                : tagsResponse.data;

        const collectionResult =
            typeof collectionResponse.data === "string"
                ? JSON.parse(collectionResponse.data)
                : collectionResponse.data;

        const libraryResult =
            typeof libraryResponse.data === "string"
                ? JSON.parse(libraryResponse.data)
                : libraryResponse.data;

        const tagSections: [TagSection, TagSection, TagSection, TagSection] = [
            createTagSection({ id: "0", label: "genres", tags: [] }),
            createTagSection({ id: "1", label: "tags", tags: [] }),
            createTagSection({ id: "2", label: "collections", tags: [] }),
            createTagSection({ id: "3", label: "libraries", tags: [] }),
        ];

        // For each tag, we append a type identifier to its id and capitalize its label
        tagSections[0].tags = genresResult.map((elem: string) =>
            createTag({ id: "genre-" + elem, label: capitalize(elem) })
        );
        tagSections[1].tags = tagsResult.map((elem: string) =>
            createTag({ id: "tag-" + elem, label: capitalize(elem) })
        );
        tagSections[2].tags = collectionResult.content.map((elem: { name: string; id: string; }) =>
            createTag({id: "collection-" + elem.id, label: capitalize(elem.name)})
        );
        tagSections[3].tags = libraryResult.map((elem: { name: string; id: string; }) =>
            createTag({ id: "library-" + elem.id, label: capitalize(elem.name) })
        );

        if (collectionResult.content.length <= 1) {
            tagSections.splice(2, 1);
        }

        return tagSections;
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        /*
                In Tachi a manga is represented by a `serie`
                */
    
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
            image: `${tachiAPI}/series/${mangaId}/thumbnail`,
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

        // Chapters language is only available on the serie page
        // const serieRequest = createRequestObject({
        //     url: `${tachiAPI}/series/${mangaId}/`,
        //     method: "GET",
        // });
        // const serieResponse = await this.requestManager.schedule(serieRequest, 1);
        // const serieResult =
        //     typeof serieResponse.data === "string"
        //         ? JSON.parse(serieResponse.data)
        //         : serieResponse.data;
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
        console.log("chapter id:"+chapterId);
        console.log("manga id:"+mangaId);
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

            // if (SUPPORTED_IMAGE_TYPES.includes(page.mediaType)) {
            //     pages.push(`${tachiAPI}/manga/${mangaId}/chapter/${chapterId}/page/${page.number}`);
            // } else {
            //     pages.push(
            //         `${tachiAPI}/manga/${mangaId}/chapter/${chapterId}/page/${page.number}?convert=png`
            //     );
            // }
        }

        // Determine the preferred reading direction which is only available in the serie metadata TODO
        // const serieRequest = createRequestObject({
        //     url: `${tachiAPI}/series/${mangaId}/`,
        //     method: "GET",
        // });

        // const serieResponse = await this.requestManager.schedule(serieRequest, 1);
        // const serieResult =
        //     typeof serieResponse.data === "string"
        //         ? JSON.parse(serieResponse.data)
        //         : serieResponse.data;

        // let longStrip = false;
        // if (
        //     ["VERTICAL", "WEBTOON"].includes(serieResult.metadata.readingDirection)
        // ) {
        //     longStrip = true;
        // }
        let longStrip = false;
        return createChapterDetails({
            id: chapterId,
            longStrip: longStrip,
            mangaId: mangaId,
            pages: pages,
        });
    }

    override async getSearchResults(
        searchQuery: SearchRequest,
        metadata: any
    ): Promise<PagedResults> {
        // This function is also called when the user search in an other source. It should not throw if the server is unavailable.

        return searchRequest(
            searchQuery,
            metadata,
            this.requestManager,
            this.stateManager,
            PAGE_SIZE
        );
    }

    override async getHomePageSections(
        sectionCallback: (section: HomeSection) => void
    ): Promise<void> {
        // This function is called on the homepage and should not throw if the server is unavailable
        getSources(this.stateManager)
        // We won't use `await this.getTachiAPI()` as we do not want to throw an error on
        // the homepage when server settings are not set

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

        // The source define two homepage sections: new and latest
        const sections = [];


        for(const source of SelectedSources){
            sections.push({
                section: createHomeSection({
                    id: `${source.id}-popular`,
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
                        id: `${source.id}-latest`,
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
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    let data: HomePageData

                    try {
                        data = JSON.parse(response.data)
                    } catch (e) {
                        throw new Error(`${e}`)
                    }
                    sectionCallback(section.section);

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
                    sectionCallback(section.section)
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
        const page: number = metadata?.page ?? 0;

        const request = createRequestObject({
            url: `${tachiAPI}/series/${homepageSectionId}`,
            param: `?page=${page}&size=${PAGE_SIZE}&deleted=false`,
            method: "GET",
        });

        const data = await this.requestManager.schedule(request, 1);
        const result =
            typeof data.data === "string" ? JSON.parse(data.data) : data.data;

        const tiles: MangaTile[] = [];
        for (const serie of result.content) {
            tiles.push(
                createMangaTile({
                    id: serie.id,
                    title: createIconText({ text: serie.metadata.title }),
                    image: `${tachiAPI}/series/${serie.id}/thumbnail`,
                })
            );
        }

        // If no series were returned we are on the last page
        metadata = tiles.length === 0 ? undefined : { page: page + 1 };

        return createPagedResults({
            results: tiles,
            metadata: metadata,
        });
    }

    override async filterUpdatedManga(
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
    }
}


export interface HomePageData {
    mangaList: 
    [
        {
            id: string
            title: string
        }
    ];
}
