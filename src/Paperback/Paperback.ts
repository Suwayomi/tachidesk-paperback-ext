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

import {resetSettingsButton, serverSettingsMenu, testServerSettingsMenu,} from "./Settings";

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

export const PaperbackInfo: SourceInfo = {
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

export class TachiRequestInterceptor implements RequestInterceptor {
    /*
        Requests made to Tachi must use a Basic Authentication.
        This interceptor adds an authorization header to the requests.

        NOTE: The authorization header can be overridden by the request
        */

    stateManager: SourceStateManager;
    constructor(stateManager: SourceStateManager) {
        this.stateManager = stateManager;
    }

    async interceptResponse(response: Response): Promise<Response> {
        return response;
    }

    async interceptRequest(request: Request): Promise<Request> {
        if (request.headers === undefined) {
            request.headers = {};
        }

        // We mustn't call this.getAuthorizationString() for the stateful submission request.
        // This procedure indeed catchs the request used to check user credentials
        // which can happen before an authorizationString is saved,
        // raising an error in getAuthorizationString when we check for its existence
        // Thus we only inject an authorizationString if none are defined in the request
        if (request.headers.authorization === undefined) {
            request.headers.authorization = await getAuthorizationString(
                this.stateManager
            );
        }

        return request;
    }
}

export class Paperback extends Source {
    stateManager = createSourceStateManager({});

    requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
        interceptor: new TachiRequestInterceptor(this.stateManager),
    });

    override async getSourceMenu(): Promise<Section> {
        return createSection({
            id: "main",
            header: "Source Settings",
            rows: async () => [
                serverSettingsMenu(this.stateManager),
                testServerSettingsMenu(this.stateManager, this.requestManager),
                resetSettingsButton(this.stateManager),
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

        const chaptersResponse = await this.requestManager.schedule(chapterRequest, 1);
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
                    langCode: languageCode,
                    name: `${chapter.title}`,
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

        // We won't use `await this.getTachiAPI()` as we do not want to throw an error on
        // the homepage when server settings are not set

        // const tachiAPI = await getTachiAPI(this.stateManager);
        const tachiAPI = null; // we do not ha a proper 'homepage' in tachidesk, could print default reading list in the future

        const { showOnDeck, showContinueReading } = await getOptions(this.stateManager);


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

        if (showOnDeck) {
            sections.push(createHomeSection({
                id: 'ondeck',
                title: 'On Deck',
                view_more: false,
            }));
        }

        if (showContinueReading) {
            sections.push(createHomeSection({
                id: 'continue',
                title: 'Continue Reading',
                view_more: false,
            }));
        }

        sections.push(createHomeSection({
            id: 'new',
            title: 'Recently added series',
            //type: showRecentFeatured ? HomeSectionType.featured : HomeSectionType.singleRowNormal,
            view_more: true,
        }));
        sections.push(createHomeSection({
            id: 'updated',
            title: 'Recently updated series',
            view_more: true,
        }));
        const promises: Promise<void>[] = [];

        for (const section of sections) {
            // Let the app load empty tagSections
            sectionCallback(section);

            let apiPath: string, thumbPath: string, params: string, idProp: string;
            switch (section.id) {
                case 'ondeck':
                    apiPath = `${tachiAPI}/books/${section.id}`;
                    thumbPath = `${tachiAPI}/books`;
                    params = '?page=0&size=20&deleted=false';
                    idProp = 'seriesId';
                    break;
                case 'continue':
                    apiPath = `${tachiAPI}/books`;
                    thumbPath = `${tachiAPI}/books`;
                    params = '?sort=readProgress.readDate,desc&read_status=IN_PROGRESS&page=0&size=20&deleted=false';
                    idProp = 'seriesId';
                    break;
                default:
                    apiPath = `${tachiAPI}/series/${section.id}`;
                    thumbPath = `${tachiAPI}/series`;
                    params = '?page=0&size=20&deleted=false';
                    idProp = 'id';
                    break;
            }

            const request = createRequestObject({
                url: apiPath,
                param: params,
                method: "GET",
            });

            // Get the section data
            promises.push(
                this.requestManager.schedule(request, 1).then((data) => {
                    const result =
                        typeof data.data === "string" ? JSON.parse(data.data) : data.data;

                    const tiles = [];

                    for (const serie of result.content) {
                        tiles.push(
                            createMangaTile({
                                id: serie[idProp],
                                title: createIconText({ text: serie.metadata.title }),
                                image: `${thumbPath}/${serie.id}/thumbnail`,
                            })
                        );
                    }
                    section.items = tiles;
                    sectionCallback(section);
                })
            );
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
