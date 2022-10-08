import {
    SourceStateManager,
} from "paperback-extensions-common";

export function getServerUnavailableMangaTiles() {
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

export async function getTachiAPI(stateManager: SourceStateManager): Promise<string> {
    return (await stateManager.retrieve('tachiAPI') as string | undefined) ?? DEFAULT_TACHI_API
}


export async function retrieveStateData(stateManager: SourceStateManager) {

    const serverURL = (await stateManager.retrieve('serverAddress') as string) ?? DEFAULT_TACHI_SERVER_ADDRESS

    return { serverURL }
}

export async function setStateData(stateManager: SourceStateManager, data: Record<string, any>) {
    await setTachiServerAddress(
        stateManager,
        data['serverAddress'] ?? DEFAULT_TACHI_SERVER_ADDRESS
    )
    await makeSourcesNull(stateManager)
}

async function setTachiServerAddress(stateManager: SourceStateManager, apiUri: string) {
    await stateManager.store('serverAddress', apiUri)
    await stateManager.store('tachiAPI', createtachiAPI(apiUri))
    
}

async function makeSourcesNull(stateManager: SourceStateManager){
    await stateManager.store('tdsources', null)
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
