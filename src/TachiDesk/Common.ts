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

// 
// TACHI API STATE METHODS
//

const DEFAULT_TACHI_SERVER_ADDRESS = 'http://10.0.0.127:4567'
const DEFAULT_TACHI_API = DEFAULT_TACHI_SERVER_ADDRESS + '/api/v1'
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

export interface SearchData {
    mangaList: 
    [
        {
            id: number
            title: string
        }
    ]
    hasNextPage: boolean
}
