import {
    DUIButton,
    DUINavigationButton,
    DUISelect,
    RequestManager,
    SourceStateManager
} from "@paperback/types"

import {
    TachiAPIClass,
    TachiCategoriesClass,
    TachiSourcesClass
} from "./Common"

export const serverAddressSettings = (stateManager: SourceStateManager, requestManager: RequestManager, tachiAPI: TachiAPIClass): DUINavigationButton => {
    let label = "Click on the button!";

    // Provides an input field, a button which sends a test request, and a label showing us the result of said request.
    return App.createDUINavigationButton({
        id: "server_settings",
        label: "Server Settings",
        form: App.createDUIForm({
            sections: async () => {
                return [
                    App.createDUISection({
                        id: "server_address_section",
                        isHidden: false,
                        rows: async () => [
                            App.createDUIInputField({
                                id: "server_address_input",
                                label: "Server URL",
                                value: App.createDUIBinding({
                                    async get() {
                                        return await tachiAPI.getServerAddress(stateManager);
                                    },
                                    async set(newValue) {
                                        await tachiAPI.setServerAddress(stateManager, newValue)
                                    }
                                })
                            }),
                            App.createDUIButton({
                                id: "test_server_button",
                                label: "Test Server",
                                onTap: async () => {
                                    const value = await tachiAPI.testRequest(requestManager);

                                    label = value instanceof Error ? value.message : JSON.stringify(value)

                                }
                            }),
                            App.createDUILabel({
                                id: "testing_button",
                                label: label
                            })
                        ]
                    })
                ]
            }
        })
    })
}

export const selectedSourcesSettings = async (stateManager: SourceStateManager, requestManager: RequestManager, tachiAPI: TachiAPIClass, tachiSources: TachiSourcesClass): Promise<DUISelect> => {
    try {
        const tachiSourcesInitResponse = await tachiSources.init(stateManager, requestManager, tachiAPI)
        if (tachiSourcesInitResponse instanceof Error) {
            throw tachiSourcesInitResponse;
        }

        tachiSources = tachiSourcesInitResponse
    }
    catch (error: any) { }

    // Provides a multiselectable list of sources
    return App.createDUISelect({
        id: "selected_sources_settings",
        label: "Sources",
        allowsMultiselect: true,
        options: Object.keys(tachiSources.getAllSources()),
        labelResolver: async (option) => tachiSources.getAllSources()[option]["displayName"],
        value: App.createDUIBinding({
            async get() {
                return (await tachiSources.getSelectedSources(stateManager));
            },
            async set(newValue) {
                await tachiSources.setSelectedSources(stateManager, newValue)
            }
        })
    })
}


export const selectedCategoriesSettings = async (stateManager: SourceStateManager, requestManager: RequestManager, tachiAPI: TachiAPIClass, tachiCategories: TachiCategoriesClass): Promise<DUISelect> => {
    try {
        const tachiCategoriesInitResponse = await tachiCategories.init(stateManager, requestManager, tachiAPI)

        if (tachiCategoriesInitResponse instanceof Error) {
            throw tachiCategoriesInitResponse;
        }

        tachiCategories = tachiCategoriesInitResponse
    }
    catch (error) {

    }

    // Provides a multiselectable list of categories
    return App.createDUISelect({
        id: "selected_categories_settings",
        label: "Categories",
        allowsMultiselect: true,
        options: Object.keys(tachiCategories.getAllCategories()),
        labelResolver: async (option) => tachiCategories.getSelectedCategoryFromId(option),
        value: App.createDUIBinding({
            async get() {
                return await tachiCategories.getSelectedCategories(stateManager);
            },
            async set(newValue) {
                await tachiCategories.setSelectedCategories(stateManager, newValue);
            }
        })
    })
}

// Button that's supposed to reset all settings.
// Seems to be currently broken (8-1-23) [m/d/yyyy].
export const resetSettingsButton = async (stateManager: SourceStateManager, tachiAPI: TachiAPIClass, tachiSources: TachiSourcesClass, tachiCategories: TachiCategoriesClass): Promise<DUIButton> => {
    return App.createDUIButton({
        id: "reset_button",
        label: "Reset to Default",
        onTap: async () => {
                await tachiAPI.setServerAddress(stateManager, undefined)
                await tachiSources.setSelectedSources(stateManager, undefined)
                await tachiCategories.setSelectedCategories(stateManager, undefined)
                await tachiSources.setAllSources(stateManager, undefined)
        }
    })
}