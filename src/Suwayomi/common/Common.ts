import { SourceStateManager, RequestManager, HomeSection } from "@paperback/types";
import { States } from "./States";
import { ALL_SOURCES_QUERY } from "./Queries";

export interface HomepageSectionDetails {
    section: HomeSection,
    query: string,
    variables?: {}
}



export const serverUnavailableMangaTiles = () => {
    return [
        App.createPartialSourceManga({
            title: "Server",
            image: "",
            mangaId: "placeholder-id",
            subtitle: "Unavailable"
        })
    ]
}

export const makeRequest = async (stateManager: SourceStateManager, requestManager: RequestManager, url: string, method = "GET", data: Record<string, string> = {}, headers: Record<string, string> = {}) => {
    const authEnabled = await States.AUTH_STATE.get(stateManager)

    if (authEnabled) {
        const username = await States.AUTH_USERNAME.get(stateManager)
        const password = await States.AUTH_PASSWORD.get(stateManager)

        headers = {
            ...headers,
            authorization: `Basic ${Buffer.from(username + ':' + password, 'binary').toString('base64')}`
        }
    }

    const request = App.createRequest({
        url,
        method,
        data,
        headers
    })

    let response;
    let responseStatus;
    let responseData;

    // Checks if the request actually went out
    try {
        response = await requestManager.schedule(request, 0);
    }
    catch (error: any) {
        return new Error(url)
    }

    // Checks if we got a response, then checks if we got a good response
    try {
        responseStatus = response?.status
    }
    catch (error: any) {
        return Error("Couldn't connect to server.")
    }
    if (responseStatus == 401) {
        return Error("Unauthorized")
    }

    if (responseStatus != 200) {
        return Error(`Your query is invalid. ${JSON.stringify(response?.status)}`)
    }

    // Checks for garbage data
    try {
        responseData = JSON.parse(response.data ?? "")
    }
    catch (error: any) {
        return Error(url)
    }

    return responseData
}

export const queryGraphQL = async (stateManager: SourceStateManager, requestManager: RequestManager, query: string, variables: any = {}) => {
    let url = (await States.SERVER_URL.get(stateManager))
    url = url == "" ? "http://127.0.0.1:4567" : url;
    url = url.slice(-1) === '/' ? url.slice(0, -1) : url;
    url += "/api/graphql"

    let data = {
        "query": query,
        "variables": variables,
    }

    let headers = {
        "Content-Type": "application/json"
    }

    let request = await makeRequest(stateManager, requestManager, url, "POST", data, headers)

    if (request instanceof Error) {
        return request
    }

    if ("errors" in request) {
        return Error("Invalid Query")
    }

    return request.data
}

export const fetchServerInfo = async (stateManager: SourceStateManager, requestManager: RequestManager) => {
    const request = await queryGraphQL(stateManager, requestManager, ALL_SOURCES_QUERY)

    if (!(request instanceof Error)) {
        const fetchedSources = await States.SERVER_SOURCES.fetch(stateManager, requestManager)
        const fetchedCategories = await States.SERVER_CATEGORIES.fetch(stateManager, requestManager)
        await States.SERVER_SOURCES.set(stateManager, fetchedSources)
        await States.SERVER_CATEGORIES.set(stateManager, fetchedCategories)
    }

    return request
}