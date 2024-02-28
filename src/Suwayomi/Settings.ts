import {
    DUIButton,
    DUIForm,
    DUINavigationButton,
    DUISection,
    DUISelect,
    HomeSectionType,
    RequestManager,
    SourceStateManager
} from "@paperback/types"

import {
    State,
    States,
    TrackerStates
} from "./common/States"

import {
    makeRequest,
    queryGraphQL
} from "./common/Common"

import {
    ABOUT_QUERY, MANGA_TRACKER_SETTINGS_DATA, MANGA_TRACKER_SETTINGS_QUERY, MANGA_TRACKER_SETTINGS_VARIABLES, UPDATE_MANGA_QUERY, UPDATE_MANGA_VARIABLES,
} from "./common/Queries"

export const serverSettings = (stateManager: SourceStateManager, requestManager: RequestManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: "serverSettings",
        label: "Server",
        form: App.createDUIForm({
            sections: async () => [
                urlSettings(stateManager, requestManager),
                basicAuthSettings(stateManager)
            ]
        })
    })
}

export const urlSettings = (stateManager: SourceStateManager, requestManager: RequestManager): DUISection => {
    let label = "..."
    return App.createDUISection({
        id: "urlSettings",
        header: "Server Address",
        isHidden: false,
        rows: async () => [
            App.createDUIInputField({
                id: "urlInputField",
                label: "Server URL",
                value: App.createDUIBinding({
                    async get() {
                        return await States.SERVER_URL.get(stateManager)
                    },
                    async set(newValue) {
                        await States.SERVER_URL.set(stateManager, newValue)
                    }
                })
            }),
            App.createDUIButton({
                id: "testServerButton",
                label: "Click Test Server",
                onTap: async () => {
                    const request = await queryGraphQL(stateManager, requestManager, ABOUT_QUERY)

                    if (request instanceof Error) {
                        label = request.message
                    }
                    else {
                        label = JSON.stringify(request)
                    }
                }
            }),
            App.createDUILabel({
                id: "testLabel",
                label: label
            })
        ]
    })
}

export const basicAuthSettings = (stateManager: SourceStateManager): DUISection => {
    return App.createDUISection({
        id: "basicAuthSettings",
        header: "Basic Authorization",
        isHidden: false,
        rows: async () => [
            App.createDUISwitch({
                id: "basicAuthState",
                label: "Enabled",
                value: App.createDUIBinding({
                    async get() {
                        return await States.AUTH_STATE.get(stateManager)
                    },
                    async set(newValue) {
                        return await States.AUTH_STATE.set(stateManager, newValue)
                    }
                })
            }),
            App.createDUIInputField({
                id: "authUsernameInput",
                label: "Username",
                value: App.createDUIBinding({
                    async get() {
                        return await States.AUTH_USERNAME.get(stateManager)
                    },
                    async set(newValue) {
                        return await States.AUTH_USERNAME.set(stateManager, newValue)
                    }
                })
            }),
            App.createDUISecureInputField({
                id: "authPasswordInput",
                label: "Password",
                value: App.createDUIBinding({
                    async get() {
                        return await States.AUTH_PASSWORD.get(stateManager)
                    },
                    async set(newValue) {
                        return await States.AUTH_PASSWORD.set(stateManager, newValue)
                    }
                })
            })

        ]
    })
}

export const homepageSettings = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: "homepageSettings",
        label: "Homepage Settings",
        form: App.createDUIForm({
            sections: async () => [
                generalHomepageSettings(stateManager),
                homepageRowSettings(stateManager, States.UPDATED_SECTION_STATE, States.UPDATED_SECTION_STYLE, "updated", "Updated Section"),
                homepageRowSettings(stateManager, States.CATEGORY_SECTION_STATE, States.CATEGORY_SECTION_STYLE, "category", "Category Sections"),
                homepageRowSettings(stateManager, States.SOURCE_SECTION_STATE, States.SOURCE_SECTION_STYLE, "source", "Source Sections"),
            ]
        })
    })
}

export const generalHomepageSettings = (stateManager: SourceStateManager): DUISection => {
    return App.createDUISection({
        id: "generalHomepageSettings",
        header: "General",
        isHidden: false,
        rows: async () => [
            App.createDUISwitch({
                id: "recentlyUpdatedDuplicatesSwitch",
                label: "Allow Duplicates",
                value: App.createDUIBinding({
                    async get() { return await States.RECENTLY_UPDATED_DUPLICATES.get(stateManager) },
                    async set(newValue) { await States.RECENTLY_UPDATED_DUPLICATES.set(stateManager, newValue) }
                })
            }),
            App.createDUIStepper({
                id: "mangaPerSectionStepper",
                label: "Manga Per Homepage Section",
                min: 0,
                value: App.createDUIBinding({
                    async get() {
                        return await States.MANGA_PER_SECTION.get(stateManager)
                    },
                    async set(newValue: number) {
                        await States.MANGA_PER_SECTION.set(stateManager, newValue)
                    },
                })
            }),
        ]
    })
}

export const homepageRowSettings = (stateManager: SourceStateManager, switchState: State<any>, selectState: State<any>, id: string, label: string): DUISection => {
    let options = Object.keys(HomeSectionType)
    let labels = options.map((option) => {
        let optionArray = option.split(/(?=[A-Z])/).map((optionPart) => {
            return optionPart.toUpperCase().slice(0, 1) + optionPart.slice(1)
        })

        return optionArray.join(" ")
    })

    return App.createDUISection({
        id: `${id}RowSection`,
        header: label,
        isHidden: false,
        rows: async () => [
            App.createDUISwitch({
                id: `${id}RowStateSwitch`,
                label: "Show",
                value: App.createDUIBinding({
                    async get() {
                        return await switchState.get(stateManager)
                    },
                    async set(newValue) {
                        await switchState.set(stateManager, newValue)
                    }
                })
            }),
            App.createDUISelect({
                id: `${id}RowStyleSelect`,
                label: "Style",
                options: options,
                allowsMultiselect: false,
                value: App.createDUIBinding({
                    async get() {
                        return await selectState.get(stateManager)
                    },
                    async set(newValue) {
                        await selectState.set(stateManager, newValue)
                    }
                }),
                labelResolver: async (option) => {
                    return labels[options.indexOf(option)]!
                }
            })
        ]
    })
}

export const sourcesSettings = async (stateManager: SourceStateManager): Promise<DUISelect> => {
    let serverSources = await States.SERVER_SOURCES.get(stateManager)
    let options = serverSources.map((source) => { return source.id })

    let currentlySelected = await States.SELECTED_SOURCES.get(stateManager)
    currentlySelected.forEach((id) => {
        if (!(options.includes(id))) {
            options.push(id)
        }
    })

    return App.createDUISelect({
        id: "SourcesSelection",
        label: "Sources",
        allowsMultiselect: true,
        options: options,
        labelResolver: async (option) => {
            const index = options.indexOf(option)
            return Promise.resolve(serverSources[index]!.displayName ?? "#OLD ENTRY#")
        },
        value: App.createDUIBinding({
            async get() {
                return await States.SELECTED_SOURCES.get(stateManager)
            },
            async set(newValue: string[]) {
                await States.SELECTED_SOURCES.set(stateManager, newValue)
            }
        })
    })
}

export const categoriesSettings = async (stateManager: SourceStateManager): Promise<DUISelect> => {
    let serverCategories = await States.SERVER_CATEGORIES.get(stateManager)
    let options = serverCategories.map((category) => { return category.id.toString() })

    let currentlySelected = await States.SELECTED_CATEGORIES.get(stateManager)
    currentlySelected.forEach((id) => {
        if (!(options.includes(id))) {
            options.push(id)
        }
    })

    return App.createDUISelect({
        id: "CategoriesSelection",
        label: "Categories",
        allowsMultiselect: true,
        options: options,
        labelResolver: async (option) => {
            const index = options.indexOf(option)
            return Promise.resolve(serverCategories[index]!.name ?? "#OLD ENTRY#")
        },
        value: App.createDUIBinding({
            async get() { return await States.SELECTED_CATEGORIES.get(stateManager) },
            async set(newValue: string[]) { await States.SELECTED_CATEGORIES.set(stateManager, newValue) }
        })
    })
}

export const mangaTrackerForm = async (stateManager: SourceStateManager, requestManager: RequestManager, mangaId: string): Promise<DUIForm> => {
    const response = await queryGraphQL(stateManager, requestManager, MANGA_TRACKER_SETTINGS_QUERY, { id: parseInt(mangaId) } as MANGA_TRACKER_SETTINGS_VARIABLES) as MANGA_TRACKER_SETTINGS_DATA

    const selectedCategories: string[] = response.manga.categories.nodes.map(category => { return category.id.toString() })

    await TrackerStates.IN_LIBRARY.set(stateManager, response.manga.inLibrary)
    await TrackerStates.SERVER_CATEGORIES.set(stateManager, response.categories.nodes)
    await TrackerStates.SELECTED_CATEGORIES.set(stateManager, selectedCategories)
    await TrackerStates.OLD_SELECTED_CATEGORIES.set(stateManager, selectedCategories)
    return App.createDUIForm({
        sections: async () => {
            return [
                App.createDUISection({
                    id: "mangaTrackerLibrarySection",
                    isHidden: false,
                    rows: async () => [
                        App.createDUISwitch({
                            id: "mangaTrackerLibrarySwitch",
                            label: "In Library",
                            value: App.createDUIBinding({
                                async get() {
                                    console.log("GETTING: " + JSON.stringify(await TrackerStates.IN_LIBRARY.get(stateManager)))
                                    return await TrackerStates.IN_LIBRARY.get(stateManager)
                                },
                                async set(newValue: boolean) {
                                    console.log("SETTING: " + JSON.stringify(newValue))
                                    await TrackerStates.IN_LIBRARY.set(stateManager, newValue)
                                    console.log("AFTER SETTING: " + JSON.stringify(await TrackerStates.IN_LIBRARY.get(stateManager)))

                                }
                            })
                        }),
                        App.createDUISelect({
                            id: "mangaTrackerCategoriesSelection",
                            label: "Categories",
                            allowsMultiselect: true,
                            options: (await TrackerStates.SERVER_CATEGORIES.get(stateManager)).map(category => {
                                return category.id.toString()
                            }),
                            labelResolver: async (option: string) => {
                                const optionsAll = (await TrackerStates.SERVER_CATEGORIES.get(stateManager))
                                const options: string[] = optionsAll.map(category => { return category.id.toString() })
                                return Promise.resolve(optionsAll[options.indexOf(option)]!.name)
                            },
                            value: App.createDUIBinding({
                                async get() {
                                    return await TrackerStates.SELECTED_CATEGORIES.get(stateManager)
                                },
                                async set(newValue) {
                                    await TrackerStates.SELECTED_CATEGORIES.set(stateManager, newValue)
                                }
                            }),
                        })
                    ]
                })
            ]
        },
        onSubmit: async () => {
            console.log(JSON.stringify("HELLLOOO"))
            const inLibrary = await TrackerStates.IN_LIBRARY.get(stateManager)
            const selectedCategories = await TrackerStates.SELECTED_CATEGORIES.get(stateManager)
            const oldSelectedCategories = await TrackerStates.OLD_SELECTED_CATEGORIES.get(stateManager)

            const addToCategories: number[] = []
            const removeFromCategories: number[] = []

            selectedCategories.forEach(categoryId => {
                console.log(`ADD: ${categoryId} - ${JSON.stringify(oldSelectedCategories.indexOf(categoryId))}`)
                if (oldSelectedCategories.indexOf(categoryId) == -1) {
                    addToCategories.push(parseInt(categoryId))
                }

            })
            oldSelectedCategories.forEach(categoryId => {
                console.log(`SUBTRACT: ${categoryId} - ${JSON.stringify(selectedCategories.indexOf(categoryId))}`)
                if (selectedCategories.indexOf(categoryId) == -1) {
                    removeFromCategories.push(parseInt(categoryId))
                }
            })

            await queryGraphQL(stateManager, requestManager, UPDATE_MANGA_QUERY, {
                id: parseInt(mangaId),
                inLibrary,
                addToCategories,
                removeFromCategories
            } as UPDATE_MANGA_VARIABLES)
        }
    })
}

export const resetSettingsButton = async (stateManager: SourceStateManager): Promise<DUIButton> => {
    return App.createDUIButton({
        id: "resetSettingsButton",
        label: "Reset Settings",
        onTap: async () => {
            Object.values(States).forEach(async (state) => {
                await state.set(stateManager)
            })
        }
    })
}