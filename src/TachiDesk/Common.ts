import {
    RequestManager,
    SourceStateManager
} from '@paperback/types'

export function serverUnavailableMangaTiles() {
    return [
        App.createPartialSourceManga({
            title: "Server",
            image: "",
            mangaId: "placeholder-id",
            subtitle: "Unavailable"
        })
    ]
}

export class TachiAPIClass {
    serverAddress = "http://127.0.0.1:4567";
    baseEndpoint = "/api/v1";
    serverKey = "server_address";

    // Initialize function by getting server address and returns itself
    init = async (stateManager: SourceStateManager) => {
        this.serverAddress = await this.getServerAddress(stateManager);
        return this;
    }

    // Gets server address, and removes the slash from the end of the server (if there)
    getServerAddress = async (stateManager: SourceStateManager) => {
        let serverAddress = await stateManager.retrieve(this.serverKey) ?? this.serverAddress;
        serverAddress = serverAddress.slice(-1) === '/' ? serverAddress.slice(0, -1) : serverAddress
        return serverAddress
    }

    // Sets server address with statemanager and saves the values
    setServerAddress = async (stateManager: SourceStateManager, serverAddress: any) => {
        serverAddress = serverAddress.slice(-1) === '/' ? serverAddress.slice(0, -1) : serverAddress

        await stateManager.store(this.serverKey, serverAddress);
        this.serverAddress = serverAddress;
    }

    getBaseURL = () => {
        return this.serverAddress + this.baseEndpoint;
    }

    // Packages all the request processing.
    // Creates request, checks if request reaches, if the request was good, and if response is JSON.
    makeRequest = async (requestManager: RequestManager, apiEndpoint: string, method = "GET", data = {}, headers = {}) => {
        const request = App.createRequest({
            url: this.getBaseURL() + apiEndpoint,
            method,
            data,
            headers
        });

        let response;
        let responseStatus;
        let responseData;
        
        try {
            response = await requestManager.schedule(request, 0);
        }
        catch (error: any) {
            return new Error(this.getBaseURL() + apiEndpoint)
        }

        try {
            responseStatus = response?.status
        }
        catch (error: any) {
            return Error("Couldn't connect to server.")
        }

        if (responseStatus != 200) {
            return Error("Your query is invalid.")
        }

        try {
            responseData = JSON.parse(response.data ?? "")
        }
        catch (error: any) {
            return Error(apiEndpoint)
        }

        return responseData
    }

    // Test request (for test server settings)
    testRequest = async (requestManager: RequestManager) => {
        return await this.makeRequest(requestManager, "/settings/about/")
    }

}

export class TachiCategoriesClass {
    // Categories are sent in order, so there's no point in me saving them
    DEFAULT_CATEGORIES: any = {
        "0": "Default"
    }
    DEFAULT_API_ENDPOINT = "/category/"

    allCategories = this.DEFAULT_CATEGORIES;

    selectedCategories = Object.keys(this.allCategories);

    selectedCategoryKey = "selected_category"

    // Initialize by getting AllCategories and selectedCategories
    init = async (stateManager: SourceStateManager, requestManager: RequestManager, tachiAPI: TachiAPIClass) => {
        this.allCategories = this.DEFAULT_CATEGORIES;
        this.selectedCategories = await stateManager.retrieve(this.selectedCategoryKey) ?? this.selectedCategories;
        const requestedCategories = await tachiAPI.makeRequest(requestManager, this.DEFAULT_API_ENDPOINT);

        if (requestedCategories instanceof Error) {
            return requestedCategories;
        }

        for (const category of requestedCategories) {
            this.allCategories[category.id] = category.name;
        }

        return this;
    };

    // Returns allCategories, could be better for stability to run another stateManager retreive and use allcategories as default value
    getAllCategories = () => {
        return this.allCategories
    };


    getSelectedCategories = async (stateManager: SourceStateManager) => {
        return await stateManager.retrieve(this.selectedCategoryKey) ?? this.selectedCategories;
    };

    setSelectedCategories = async (stateManager: SourceStateManager, categories: any) => {
        await stateManager.store(this.selectedCategoryKey, categories)
        this.selectedCategories = categories
    };

    // allCategories == {id: name}, thus allcategories[id] == name.
    // Used by label resolver
    getSelectedCategoryFromId = (categoryId: string) => {
        return this.allCategories[categoryId] ?? ""
    };
}

export class TachiSourcesClass {
    DEFAULT_SOURCES = {
        "0": {
            "name": "Local source",
            "lang": "localsourcelang",
            "iconUrl": "/api/v1/extension/icon/localSource",
            "supportsLatest": true,
            "isConfigurable": false,
            "isNsfw": false,
            "displayName": "Local source"
        }
    };


    allSources: any = this.DEFAULT_SOURCES;
    selectedSources = Object.keys(this.allSources);

    DEFAULT_API_ENDPOINT = "/source/list";

    allSourcesKey = "all_sources"
    selectedSourceKey = "selected_sources"

    // Initializes by getting selected sources and set all sources
    init = async (stateManager: SourceStateManager, requestManager: RequestManager, tachiAPI: TachiAPIClass) => {
        this.selectedSources = await stateManager.retrieve(this.selectedSourceKey) ?? this.selectedSources;
        const requestedSources = await tachiAPI.makeRequest(requestManager, this.DEFAULT_API_ENDPOINT)

        if (requestedSources instanceof Error) {
            return requestedSources
        }

        this.setAllSources(stateManager, requestedSources)
        return this
    }

    getAllSources = () => {
        return this.allSources ?? this.DEFAULT_SOURCES
    }

    setAllSources = async (stateManager: SourceStateManager, allSources: any) => {
        for (const source of allSources) {
            this.allSources[source.id] = {
                "name": source.name,
                "lang": source.lang,
                "iconUrl": source.iconUrl,
                "supportsLatest": source.supportsLatest,
                "isConfigurable": source.isConfigurable,
                "isNsfw": source.isNsfw,
                "displayName": source.displayName
            }
        }

        await stateManager.store(this.allSourcesKey, this.allSources)
    }

    getSelectedSources = async (stateManager: SourceStateManager) => {
        return await stateManager.retrieve(this.selectedSourceKey) ?? this.selectedSources;
    }

    setSelectedSources = async (stateManager: SourceStateManager, sources: any) => {
        await stateManager.store(this.selectedSourceKey, sources)
        this.selectedSources = sources;
    }

    getSourceNameFromId = (sourceId: string) => {
        return this.allSources[sourceId]["displayName"] ?? "";
    }
}

