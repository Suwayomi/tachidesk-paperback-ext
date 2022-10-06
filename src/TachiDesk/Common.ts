import {
    SearchRequest,
    PagedResults,
    SourceStateManager,
    RequestManager,
    Response,
    MangaTile
} from "paperback-extensions-common";

export function getServerUnavailableMangaTiles() {
    // This tile is used as a placeholder when the server is unavailable
    return [
        createMangaTile({
            id: "Tachidesk",
            title: createIconText({ text: "Tachidesk" }),
            image: "",
            subtitleText: createIconText({ text: "unavailable" }),
        }),
    ];
}

export async function searchRequest(
    searchQuery: SearchRequest,
    metadata: any,
    requestManager: RequestManager,
    stateManager: SourceStateManager,
    page_size: number
): Promise<PagedResults> {
    // This function is also called when the user search in an other source. It should not throw if the server is unavailable.
    // We won't use `await this.getTachiAPI()` as we do not want to throw an error
    const tachiAPI = await getTachiAPI(stateManager);
    const { orderResultsAlphabetically } = await getOptions(stateManager);

    if (tachiAPI === null) {
        console.log("searchRequest failed because server settings are unset");
        return createPagedResults({
            results: getServerUnavailableMangaTiles(),
        });
    }

    const page: number = metadata?.page ?? 0;

    const paramsList = [`pageNum=${page}`]; // , `size=${page_size}`]

    if (searchQuery.title !== undefined && searchQuery.title !== "") {
        paramsList.push("searchTerm=" + encodeURIComponent(searchQuery.title));
    }
    if (searchQuery.includedTags !== undefined) {
        searchQuery.includedTags.forEach((tag) => {
            // There are two types of tags: `tag` and `genre`
            if (tag.id.substr(0, 4) == "tag-") {
                paramsList.push("tag=" + encodeURIComponent(tag.id.substring(4)));
            }
            if (tag.id.substr(0, 6) == "genre-") {
                paramsList.push("genre=" + encodeURIComponent(tag.id.substring(6)));
            }
            if (tag.id.substr(0, 11) == "collection-") {
                paramsList.push("collection_id=" + encodeURIComponent(tag.id.substring(11)));
            }
            if (tag.id.substr(0, 8) == "library-") {
                paramsList.push("library_id=" + encodeURIComponent(tag.id.substring(8)));
            }
        });
    }

    // if (orderResultsAlphabetically) {
    //     paramsList.push("sort=titleSort");
    // } else {
    //     paramsList.push("sort=lastModified,desc");
    // }

    let paramsString = "";
    if (paramsList.length > 0) {
        paramsString = "?" + paramsList.join("&");
    }

    const requestSource = createRequestObject({
        // get all Sourceensions 
        url: `${tachiAPI}/source/list`,
        method: "GET",
        param: paramsString,
    });
    let dataSource: Response;
    try {
        dataSource = await requestManager.schedule(requestSource, 1);
    } catch (error) {
        console.log(`searchRequest failed with error: ${error}`);
        return createPagedResults({
            results: getServerUnavailableMangaTiles(),
        });
    }
    const resultSource =
    typeof dataSource.data === "string" ? JSON.parse(dataSource.data) : dataSource.data;
    const tiles = [];

    for (const source of resultSource) {
        if( source.lang != DEFAULT_TACHI_LANG){
            continue;
        }
        const request = createRequestObject({
            // 4215511432986138970 test id
            url: `${tachiAPI}/source/${source.id}/search`,
            method: "GET",
            param: paramsString,
        });

        // We don't want to throw if the server is unavailable
        let data: Response;
        try {
            data = await requestManager.schedule(request, 1);
            if(data.status != 200){
                continue
            }
        } catch (error) {
            console.log(`searchRequest failed with error: ${error}`);
            return createPagedResults({
                results: getServerUnavailableMangaTiles(),
            });
        }
        
        // return createPagedResults({
        //     results: [
        //         createMangaTile({
        //             id: "Tachidesk",
        //             title: createIconText({ text: "Tachidesk" }),
        //             image: "",
        //             subtitleText: createIconText({ text: data.request.url }),
        //         }),
        //     ],
        // });
        // throw new Error(data.data);

        const result =
            typeof data.data === "string" ? JSON.parse(data.data) : data.data;

        for (const serie of result.mangaList) {
            tiles.push(
                createMangaTile({
                    id: String(serie.id),
                    title: createIconText({ text: serie.title }),
                    subtitleText: createIconText({text: source.displayName}),
                    image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                })
            );
        }

    }


    

    
    // If no series were returned we are on the last page
    metadata = tiles.length === 0 ? undefined : { page: page + 1 };

    return createPagedResults({
        results: tiles,
        metadata,
    });
}

// 
// TACHI API STATE METHODS
//

const DEFAULT_TACHI_SERVER_ADDRESS = 'http://10.0.0.127:4567'
const DEFAULT_TACHI_API = DEFAULT_TACHI_SERVER_ADDRESS + '/api/v1'
const DEFAULT_TACHI_LANG = "en"
const DEFAULT_TACHI_USERNAME = ''
const DEFAULT_TACHI_PASSWORD = ''
const DEFAULT_SHOW_ON_DECK = false
const DEFAULT_SORT_RESULTS_ALPHABETICALLY = true
const DEFAULT_SHOW_CONTINUE_READING = false

export async function getAuthorizationString(stateManager: SourceStateManager): Promise<string> {
    return (await stateManager.keychain.retrieve('authorization') as string | undefined) ?? ''
}

export async function getTachiAPI(stateManager: SourceStateManager): Promise<string> {
    return (await stateManager.retrieve('tachiAPI') as string | undefined) ?? DEFAULT_TACHI_API
}

export async function getOptions(stateManager: SourceStateManager): Promise<{ showOnDeck: boolean; orderResultsAlphabetically: boolean; showContinueReading: boolean; }> {
    const showOnDeck = (await stateManager.retrieve('showOnDeck') as boolean) ?? DEFAULT_SHOW_ON_DECK
    const orderResultsAlphabetically = (await stateManager.retrieve('orderResultsAlphabetically') as boolean) ?? DEFAULT_SORT_RESULTS_ALPHABETICALLY
    const showContinueReading = (await stateManager.retrieve('showContinueReading') as boolean) ?? DEFAULT_SHOW_CONTINUE_READING

    return { showOnDeck, orderResultsAlphabetically, showContinueReading }
}

export async function retrieveStateData(stateManager: SourceStateManager) {
    // Return serverURL, serverUsername and serverPassword saved in the source.
    // Used to show already saved data in settings

    const serverURL = (await stateManager.retrieve('serverAddress') as string) ?? DEFAULT_TACHI_SERVER_ADDRESS
    const serverUsername = (await stateManager.keychain.retrieve('serverUsername') as string) ?? DEFAULT_TACHI_USERNAME
    const serverPassword = (await stateManager.keychain.retrieve('serverPassword') as string) ?? DEFAULT_TACHI_PASSWORD
    const showOnDeck = (await stateManager.retrieve('showOnDeck') as boolean) ?? DEFAULT_SHOW_ON_DECK
    const orderResultsAlphabetically = (await stateManager.retrieve('orderResultsAlphabetically') as boolean) ?? DEFAULT_SORT_RESULTS_ALPHABETICALLY
    const showContinueReading = (await stateManager.retrieve('showContinueReading') as boolean) ?? DEFAULT_SHOW_CONTINUE_READING

    return { serverURL, serverUsername, serverPassword, showOnDeck, orderResultsAlphabetically, showContinueReading }
}

export async function setStateData(stateManager: SourceStateManager, data: Record<string, any>) {
    await setTachiServerAddress(
        stateManager,
        data['serverAddress'] ?? DEFAULT_TACHI_SERVER_ADDRESS
    )
    await setCredentials(
        stateManager,
        data['serverUsername'] ?? DEFAULT_TACHI_USERNAME,
        data['serverPassword'] ?? DEFAULT_TACHI_PASSWORD
    )
    await setOptions(
        stateManager,
        data['showOnDeck'] ?? DEFAULT_SHOW_ON_DECK,
        data['orderResultsAlphabetically'] ?? DEFAULT_SORT_RESULTS_ALPHABETICALLY,
        data['showContinueReading'] ?? DEFAULT_SHOW_CONTINUE_READING,
    )
}

async function setTachiServerAddress(stateManager: SourceStateManager, apiUri: string) {
    await stateManager.store('serverAddress', apiUri)
    await stateManager.store('tachiAPI', createtachiAPI(apiUri))
}

async function setCredentials(stateManager: SourceStateManager, username: string, password: string) {
    await stateManager.keychain.store('serverUsername', username)
    await stateManager.keychain.store('serverPassword', password)
    await stateManager.keychain.store('authorization', createAuthorizationString(username, password))
}

async function setOptions(stateManager: SourceStateManager, showOnDeck: boolean, orderResultsAlphabetically: boolean, showContinueReading: boolean) {
    await stateManager.store('showOnDeck', showOnDeck)
    await stateManager.store('orderResultsAlphabetically', orderResultsAlphabetically)
    await stateManager.store('showContinueReading', showContinueReading)
}

function createAuthorizationString(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password, 'binary').toString('base64')
}

function createtachiAPI(serverAddress: string): string {
    return serverAddress + (serverAddress.slice(-1) === '/' ? 'api/v1' : '/api/v1')
}

export interface HomePageData {
    mangaList: 
    [
        {
            id: number
            title: string
        }
    ];
}

export const parseHomePage = (data: HomePageData, tachiAPI: string, displayName: string): MangaTile[] => {
    const results: MangaTile[] = []

    for (const manga of data.mangaList) {
        const id = manga.id.toString()
        const title = manga.title
        const image = `${tachiAPI}/manga/${manga.id}/thumbnail`
        const subtitle = displayName

        if (!id) continue

        results.push(createMangaTile({
            id,
            image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle })
        }))

    }

    return results
}