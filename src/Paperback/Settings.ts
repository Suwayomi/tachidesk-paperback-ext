import {
    Button,
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

    const komgaAPI = await getTachiAPI(stateManager)
    const authorization = await getAuthorizationString(stateManager)

    // We check credentials are set in server settings
    if (komgaAPI === null || authorization === null) {
        return "Impossible: Unset credentials in server settings";
    }

    // To test these information, we try to make a connection to the server
    // We could use a better endpoint to test the connection
    const request = createRequestObject({
        url: `${komgaAPI}/libraries/`,
        method: "GET",
        incognito: true, // We don't want the authorization to be cached
        headers: { authorization: authorization },
    });

    let responseStatus = undefined;

    try {
        const response = await requestManager.schedule(request, 1);
        responseStatus = response.status;
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
                    id: "information",
                    header: undefined,
                    rows: async () => [
                        createMultilineLabel({
                            label: "Demo Server",
                            value: "Server URL: https://demo.komga.org\nUsername: demo@komga.org\nPassword: komga-demo\n\nNote: Values are case-sensitive.",
                            id: "description",
                        }),
                    ],
                }),
                createSection({
                    id: "serverSettings",
                    header: "Server Settings",
                    footer: "Minimal Komga version: v0.100.0",
                    rows: async () => retrieveStateData(stateManager).then((values) => [
                        createInputField({
                            id: "serverAddress",
                            label: "Server URL",
                            placeholder: "http://127.0.0.1:8080",
                            value: values.serverURL,
                            maskInput: false,
                        }),
                        createInputField({
                            id: "serverUsername",
                            label: "Email",
                            placeholder: "demo@komga.org",
                            value: values.serverUsername,
                            maskInput: false,
                        }),
                        // TS-Ignoring because this isnt documented yet
                        // Fallback to default input field if the app version doesnt support
                        // SecureInputField
                        // @ts-ignore
                        (typeof createSecureInputField == 'undefined' ? createInputField : createSecureInputField)({
                            id: "serverPassword",
                            label: "Password",
                            placeholder: "Some Super Secret Password",
                            value: values.serverPassword
                        }),
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
                    header: "Connection to Komga server:",
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
