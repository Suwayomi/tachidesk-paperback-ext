import {
    DUIButton,
    DUINavigationButton,
    DUISelect,
    RequestManager,
    SourceStateManager
} from "@paperback/types"

import {
    DEFAULT_SERVER_URL,
    fetchServerCategories,
    fetchServerSources,
    getAuthState,
    getCategoriesIds,
    getCategoryNameFromId,
    getCategoryRowState,
    getCategoryRowStyle,
    getMangaPerRow,
    getPassword,
    getSelectedCategories,
    getSelectedSources,
    getServerCategories,
    getServerSources,
    getServerURL,
    getSourceNameFromId,
    getSourceRowState,
    getSourceRowStyle,
    getSourcesIds,
    getUpdatedRowState,
    getUpdatedRowStyle,
    getUsername,
    resetSettings,
    rowStyles,
    setAuthState,
    setCategoryRowState,
    setCategoryRowStyle,
    setMangaPerRow,
    setPassword,
    setSelectedCategories,
    setSelectedSources,
    setServerCategories,
    setServerSources,
    setServerURL,
    setSourceRowState,
    setSourceRowStyle,
    setUpdatedRowState,
    setUpdatedRowStyle,
    setUsername,
    styleResolver,
    testRequest
} from "./Common"

// 2 Sections -> 1 for server url, another for auth
export const serverAddressSettings = (stateManager: SourceStateManager, requestManager: RequestManager): DUINavigationButton => {
    // Label that shows test response
    let label = "Click on the button!"

    return App.createDUINavigationButton({
        id: "serverSettings",
        label: "Server Settings",
        form: App.createDUIForm({
            sections: async () => {
                return [
                    App.createDUISection({
                        id: "urlSection",
                        header: "Server Address",
                        isHidden: false,
                        rows: async () => [
                            App.createDUIInputField({
                                id: "urlInputField",
                                label: "Server URL",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getServerURL(stateManager)
                                    },
                                    async set(newValue) {

                                        await setServerURL(stateManager, newValue)
                                    }
                                })
                            }),
                            App.createDUIButton({
                                id: "testServerButton",
                                label: "Test Server",
                                onTap: async () => {
                                    const value = await testRequest(stateManager, requestManager)

                                    label = value instanceof Error ? value.message : JSON.stringify(value)
                                }
                            }),
                            App.createDUILabel({
                                id: "test_label",
                                label: label,
                            })
                        ]
                    }),
                    App.createDUISection({
                        id: "authSettings",
                        header: "Authorization",
                        isHidden: false,
                        rows: async () => [
                            // Auth Switch
                            App.createDUISwitch({
                                id: "authStateSwitch",
                                label: "Enabled",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getAuthState(stateManager)
                                    },
                                    async set(newValue) {
                                        await setAuthState(stateManager, newValue as boolean)
                                    }
                                })
                            }),
                            // Username
                            App.createDUIInputField({
                                id: "UsernameInputField",
                                label: "Username",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getUsername(stateManager)
                                    },
                                    async set(newValue) {
                                        await setUsername(stateManager, newValue as string)
                                    }
                                })
                            }),
                            // Password
                            App.createDUISecureInputField({
                                id: "passwordInputField",
                                label: "Password",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getPassword(stateManager)
                                    },
                                    async set(newValue) {
                                        await setPassword(stateManager, newValue as string)
                                    }
                                })
                            })
                        ]
                    })
                ]
            }
        })
    })
}

// Houses settings for Manga Per Row, and settings for each type of homepage section (recently updated, library category, and source )
// for sections -> You can toggle them, change their style, change their content (which category/source)
export const HomepageSettings = (stateManager:SourceStateManager, requestManager: RequestManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: "homepageSettings",
        label: "Homepage Settings",
        form: App.createDUIForm({
            sections: async () => {
                return [
                    App.createDUISection({
                        id: "mangaPerRowSection",
                        header: "Manga Per Row",
                        isHidden: false,
                        rows: async () => [
                            App.createDUIStepper({
                                id: "mangaPerRowStepper",
                                label: "",
                                min: 0,
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getMangaPerRow(stateManager)
                                    },
                                    async set(newValue) {
                                        await setMangaPerRow(stateManager, newValue)
                                    }
                                })
                            })
                        ]
                    }),
                    App.createDUISection({
                        id: "updatedRowSection",
                        header: "Updated Feed",
                        isHidden: false,
                        rows: async () => [
                            App.createDUISwitch({
                                id: "updatedRowStateSwitch",
                                label: "Show",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getUpdatedRowState(stateManager)
                                    },
                                    async set(newValue) {
                                        await setUpdatedRowState(stateManager, newValue)
                                    }
                                })
                            }),
                            App.createDUISelect({
                                id: "updatedRowStyleSelect",
                                label: "Style",
                                options: rowStyles,
                                allowsMultiselect: false,
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getUpdatedRowStyle(stateManager)
                                    },
                                    async set(newValue) {
                                        await setUpdatedRowStyle(stateManager, newValue)
                                    }
                                }),
                                labelResolver: async (option) => {
                                    return styleResolver(option); 
                                },
                            })
                        ]
                    }),
                    App.createDUISection({
                        id: "categoryRowSection",
                        header: "Library Categories",
                        isHidden: false,
                        rows: async () => [
                            App.createDUISwitch({
                                id: "categoryRowStateSwitch",
                                label: "Show",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getCategoryRowState(stateManager)
                                    },
                                    async set(newValue) {
                                        await setCategoryRowState(stateManager, newValue)
                                    }
                                })
                            }),
                            App.createDUISelect({
                                id: "categoryRowStyleSelect",
                                label: "Style",
                                options: rowStyles,
                                allowsMultiselect: false,
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getCategoryRowStyle(stateManager)
                                    },
                                    async set(newValue) {
                                        await setCategoryRowStyle(stateManager, newValue)
                                    }
                                }),
                                labelResolver: async (option) => {
                                    return styleResolver(option); 
                                },
                            }),
                            await categoriesSettings(stateManager,requestManager)
                        ]
                    }),
                    App.createDUISection({
                        id: "sourceRowSection",
                        header: "Sources",
                        isHidden: false,
                        rows: async () => [
                            App.createDUISwitch({
                                id: "sourceRowStateSwitch",
                                label: "Show",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getSourceRowState(stateManager)
                                    },
                                    async set(newValue) {
                                        await setSourceRowState(stateManager, newValue)
                                    }
                                })
                            }),
                            App.createDUISelect({
                                id: "sourceRowStyleSelect",
                                label: "Style",
                                options: rowStyles,
                                allowsMultiselect: false,
                                value: App.createDUIBinding({
                                    async get() {
                                        return await getSourceRowStyle(stateManager)
                                    },
                                    async set(newValue) {
                                        await setSourceRowStyle(stateManager, newValue)
                                    }
                                }),
                                labelResolver: async (option) => {
                                    return styleResolver(option); 
                                },
                            }),
                            await sourceSettings(stateManager,requestManager)
                        ]
                    })
                ]
            }
        })
    })
}

// Category selection
export const categoriesSettings = async (stateManager: SourceStateManager, requestManager: RequestManager): Promise<DUISelect> => {
    let serverCategories = await getServerCategories(stateManager);
    const serverURL = await getServerURL(stateManager);

    // fetch categories only when the URL has been set
    if (serverURL !== DEFAULT_SERVER_URL){
        serverCategories = await fetchServerCategories(stateManager,requestManager)
        setServerCategories(stateManager, serverCategories)
    }

    return App.createDUISelect({
        id: "CategoriesSelection",
        label: "Categories",
        allowsMultiselect: true,
        options: getCategoriesIds(serverCategories),
        labelResolver: async (option) => {
            return getCategoryNameFromId(serverCategories, option) ?? ""
        },
        value: App.createDUIBinding({
            async get() {
                return (await getSelectedCategories(stateManager))
            },
            async set(newValue) {
                await setSelectedCategories(stateManager, newValue)
            }
        }),
    })
}

// Source selection
export const sourceSettings = async (stateManager : SourceStateManager, requestManager : RequestManager) : Promise<DUISelect> => {
    let serverSources = await getServerSources(stateManager);
    const serverURL = await getServerURL(stateManager);

    // only fetches when url has been set
    if (serverURL !== DEFAULT_SERVER_URL){
        serverSources = await fetchServerSources(stateManager, requestManager)
        setServerSources(stateManager, serverSources)
    }

    return App.createDUISelect({
        id: "SourcesSelection",
        label: "Sources",
        allowsMultiselect: true,
        options: getSourcesIds(serverSources),
        labelResolver: async (option) => {
            return getSourceNameFromId(serverSources, option)
        },
        value: App.createDUIBinding({
            async get() {
                return await getSelectedSources(stateManager)
            },
            async set(newValue) {
                await setSelectedSources(stateManager, newValue)
            }
        })
    })
}

export const resetSettingsButton = async (stateManager : SourceStateManager) : Promise<DUIButton> => {
    return App.createDUIButton({
        id: "resetSettingsButton",
        label: "Reset Settings",
        onTap:async () => {
            await resetSettings(stateManager)
        }
    })
}