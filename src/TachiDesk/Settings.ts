import {
    Button,
    MangaTile,
    NavigationButton,
    RequestManager,
    SourceStateManager,
} from "paperback-extensions-common";
import {
    retrieveStateData,
    setStateData,
    getTachiAPI,
    getAuthorizationString,
} from "./Common";

/* Helper functions */

export const testServerSettings = async (
    stateManager: SourceStateManager,
    requestManager: RequestManager
): Promise<string> => {
    // Try to establish a connection with the server. Return an human readable string containing the test result

    const tachiAPI = await getTachiAPI(stateManager)
    const authorization = await getAuthorizationString(stateManager)

    // We check credentials are set in server settings
    if (tachiAPI === null || authorization === null) {
        return "Impossible: Unset credentials in server settings";
    }

    // To test these information, we try to make a connection to the server
    // We could use a better endpoint to test the connection
    const request = createRequestObject({
        url: `${tachiAPI}/settings/about`,
        method: "GET",
        incognito: true, // We don't want the authorization to be cached
        headers: { authorization: authorization },
    });

    let responseStatus = undefined;

    try {
        const response = await requestManager.schedule(request, 1);
        responseStatus = response.status;
        JSON.parse(response.data); // throws error if an non json is found

    } catch (error: any) {
        // If the server is unavailable error.message will be 'AsyncOperationTimedOutError'
        return `Failed: Could not connect to server - ${error.message}`;
    }
    
    switch (responseStatus) {
        case 200: {
            return "Successful connection!";
        }
        case 401: {
            return "Error 401 Unauthorized: Invalid credentials";
        }
        default: {
            return `Error ${responseStatus}`;
        }
    }
};

/* UI definition */

// NOTE: Submitted data won't be tested
export const serverSettingsMenu = (
    stateManager: SourceStateManager
): NavigationButton => {
    return createNavigationButton({
        id: "server_settings",
        value: "",
        label: "Server Settings",
        form: createForm({
            onSubmit: async (values: any) => setStateData(stateManager, values),
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "serverSettings",
                    header: "Server Settings",
                    footer: "Tested on Tachidesk Server version: v0.6.5 r1125",
                    rows: async () => retrieveStateData(stateManager).then((values) => [
                        createInputField({
                            id: "serverAddress",
                            label: "Server URL",
                            placeholder: "http://127.0.0.1:8080",
                            value: values.serverURL,
                            maskInput: false,
                        }),
                        // createInputField({
                        //     id: "serverUsername",
                        //     label: "Email",
                        //     placeholder: "demo@komga.org",
                        //     value: values.serverUsername,
                        //     maskInput: false,
                        // }),
                        // TS-Ignoring because this isnt documented yet
                        // Fallback to default input field if the app version doesnt support
                        // SecureInputField
                        // @ts-ignore
                        // (typeof createSecureInputField == 'undefined' ? createInputField : createSecureInputField)({
                        //     id: "serverPassword",
                        //     label: "Password",
                        //     placeholder: "Some Super Secret Password",
                        //     value: values.serverPassword
                        // }),
                    ]),
                }),
                createSection({
                    id: "sourceOptions",
                    header: "Source Options",
                    footer: "",
                    rows: async () => retrieveStateData(stateManager).then((values) => [
                        createSwitch({
                            id: 'showOnDeck',
                            label: 'Show On Deck',
                            value: values.showOnDeck,
                        }),
                        createSwitch({
                            id: 'showContinueReading',
                            label: 'Show Continue Reading',
                            value: values.showContinueReading,
                        }),
                        createSwitch({
                            id: 'orderResultsAlphabetically',
                            label: 'Sort results alphabetically',
                            value: values.orderResultsAlphabetically,
                        }),
                    ]),
                }),
            ],
        }),
    });
};

export const testServerSettingsMenu = (
    stateManager: SourceStateManager,
    requestManager: RequestManager
): NavigationButton => {
    return createNavigationButton({
        id: "test_settings",
        value: "",
        label: "Try settings",
        form: createForm({
            onSubmit: async () => { },
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "information",
                    header: "Connection to Tachidesk server:",
                    rows: () => testServerSettings(stateManager, requestManager).then(async (value) => [
                        createLabel({
                            label: value,
                            value: "",
                            id: "description",
                        }),
                    ]),
                }),
            ],
        }),
    });
};

interface TDSource {
    id:             string;
    name:           string;
    lang:           string;
    iconUrl:        string;
    supportsLatest: boolean;
    isConfigurable: boolean;
    isNsfw:         boolean;
    displayName:    string;
    default?:        boolean;
}


class SourceClass {
    Sources: TDSource[] = []

    constructor() {
        this.Sources = this.Sources.sort((a, b) => a.displayName > b.displayName ? 1 : -1)
    }

    getIDList(): string[] {
        return this.Sources.map(Sources => Sources.id)
    }

    getSelectedSources(sources: string[]): TDSource[] {
        const FilteredSources: TDSource[] = []

        for(const source of sources){
            const fSources: TDSource[] = this.Sources.filter(MSources => MSources.id === source)

            if(fSources && fSources[0]){
                FilteredSources.push(fSources[0])
            }
        }

        const SortedSources: TDSource[] = FilteredSources.sort((a, b) => a.displayName > b.displayName ? 1 : -1)

        return SortedSources
    }

    getNameFromID(id: string): string {
        return this.Sources.filter(Sources => Sources.id == id)[0]?.displayName ?? 'Unknown'
    }

    getDefault(): string[] {
        return this.Sources.filter(Sources => Sources.default).map(Sources => Sources.id)
    }

}

export const TDSources = new SourceClass

export const getSourcesList = async (stateManager: SourceStateManager): Promise<string[]> => {
    return (await stateManager.retrieve('tdsources') as string[]) ?? [
        {
            id: "0",
            name: "Local source",
            displayName: "Local source"
          },
    ]
}


export const getSources = async (stateManager: SourceStateManager) =>{
    const tachiAPI = await getTachiAPI(stateManager);

    const requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
    });

    const request = createRequestObject({
        url: `${tachiAPI}/source/list`,
        method: "GET",
    })
    const response = await requestManager.schedule(request, 1)

    let data: TDSource[]
    try {
        data = JSON.parse(response.data)
    } catch (e) {
        throw new Error(`${e}`)
    }
    if(data.length === 0) throw Error('Could not Find any sources avaliable in the api')    
    
    TDSources.Sources = data
}
export const TDSettings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'tdsource_settings',
        value: '',
        label: 'TachiDesk Source Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('tdsources', values.tdsources),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'tachidesk_sources',
                        footer: '',
                        rows: () => {
                            return Promise.all([
                                getSourcesList(stateManager),
                            ]).then(async values => {
                                return [
                                    createSelect({
                                        id: 'tdsources',
                                        label: 'Sources',
                                        options: TDSources.getIDList(),
                                        displayLabel: option => TDSources.getNameFromID(option),
                                        value: values[0],
                                        allowsMultiselect: true,
                                        minimumOptionCount: 1,
                                    })
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}


export const resetSettingsButton = (
    stateManager: SourceStateManager
): Button => {
    return createButton({
        id: "reset",
        label: "Reset to Default",
        value: "",
        onTap: () => setStateData(stateManager, {}),
    });
};
