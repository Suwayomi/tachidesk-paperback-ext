(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TachiSourcesClass = exports.TachiCategoriesClass = exports.TachiAPIClass = exports.serverUnavailableMangaTiles = void 0;
function serverUnavailableMangaTiles() {
    return [
        App.createPartialSourceManga({
            title: "Server",
            image: "",
            mangaId: "placeholder-id",
            subtitle: "Unavailable"
        })
    ];
}
exports.serverUnavailableMangaTiles = serverUnavailableMangaTiles;
class TachiAPIClass {
    constructor() {
        this.serverAddress = "http://127.0.0.1:4567";
        this.baseEndpoint = "/api/v1";
        this.serverKey = "server_address";
        // Initialize function by getting server address and returns itself
        this.init = async (stateManager) => {
            this.serverAddress = await this.getServerAddress(stateManager);
            return this;
        };
        // Gets server address, and removes the slash from the end of the server (if there)
        this.getServerAddress = async (stateManager) => {
            let serverAddress = await stateManager.retrieve(this.serverKey) ?? this.serverAddress;
            serverAddress = serverAddress.slice(-1) === '/' ? serverAddress.slice(0, -1) : serverAddress;
            return serverAddress;
        };
        // Sets server address with statemanager and saves the values
        this.setServerAddress = async (stateManager, serverAddress) => {
            serverAddress = serverAddress.slice(-1) === '/' ? serverAddress.slice(0, -1) : serverAddress;
            await stateManager.store(this.serverKey, serverAddress);
            this.serverAddress = serverAddress;
        };
        this.getBaseURL = () => {
            return this.serverAddress + this.baseEndpoint;
        };
        // Packages all the request processing.
        // Creates request, checks if request reaches, if the request was good, and if response is JSON.
        this.makeRequest = async (requestManager, apiEndpoint, method = "GET", data = {}, headers = {}) => {
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
            catch (error) {
                return new Error(this.getBaseURL() + apiEndpoint);
            }
            try {
                responseStatus = response?.status;
            }
            catch (error) {
                return Error("Couldn't connect to server.");
            }
            if (responseStatus != 200) {
                return Error("Your query is invalid.");
            }
            try {
                responseData = JSON.parse(response.data ?? "");
            }
            catch (error) {
                return Error(apiEndpoint);
            }
            return responseData;
        };
        // Test request (for test server settings)
        this.testRequest = async (requestManager) => {
            return await this.makeRequest(requestManager, "/settings/about/");
        };
    }
}
exports.TachiAPIClass = TachiAPIClass;
class TachiCategoriesClass {
    constructor() {
        // Categories are sent in order, so there's no point in me saving them
        this.DEFAULT_CATEGORIES = {
            "0": "Default"
        };
        this.DEFAULT_API_ENDPOINT = "/category/";
        this.allCategories = this.DEFAULT_CATEGORIES;
        this.selectedCategories = Object.keys(this.allCategories);
        this.selectedCategoryKey = "selected_category";
        // Initialize by getting AllCategories and selectedCategories
        this.init = async (stateManager, requestManager, tachiAPI) => {
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
        this.getAllCategories = () => {
            return this.allCategories;
        };
        this.getSelectedCategories = async (stateManager) => {
            return await stateManager.retrieve(this.selectedCategoryKey) ?? this.selectedCategories;
        };
        this.setSelectedCategories = async (stateManager, categories) => {
            await stateManager.store(this.selectedCategoryKey, categories);
            this.selectedCategories = categories;
        };
        // allCategories == {id: name}, thus allcategories[id] == name.
        // Used by label resolver
        this.getSelectedCategoryFromId = (categoryId) => {
            return this.allCategories[categoryId] ?? "";
        };
    }
}
exports.TachiCategoriesClass = TachiCategoriesClass;
class TachiSourcesClass {
    constructor() {
        this.DEFAULT_SOURCES = {
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
        this.allSources = this.DEFAULT_SOURCES;
        this.selectedSources = Object.keys(this.allSources);
        this.DEFAULT_API_ENDPOINT = "/source/list";
        this.allSourcesKey = "all_sources";
        this.selectedSourceKey = "selected_sources";
        // Initializes by getting selected sources and set all sources
        this.init = async (stateManager, requestManager, tachiAPI) => {
            this.selectedSources = await stateManager.retrieve(this.selectedSourceKey) ?? this.selectedSources;
            const requestedSources = await tachiAPI.makeRequest(requestManager, this.DEFAULT_API_ENDPOINT);
            if (requestedSources instanceof Error) {
                return requestedSources;
            }
            this.setAllSources(stateManager, requestedSources);
            return this;
        };
        this.getAllSources = () => {
            return this.allSources ?? this.DEFAULT_SOURCES;
        };
        this.setAllSources = async (stateManager, allSources) => {
            for (const source of allSources) {
                this.allSources[source.id] = {
                    "name": source.name,
                    "lang": source.lang,
                    "iconUrl": source.iconUrl,
                    "supportsLatest": source.supportsLatest,
                    "isConfigurable": source.isConfigurable,
                    "isNsfw": source.isNsfw,
                    "displayName": source.displayName
                };
            }
            await stateManager.store(this.allSourcesKey, this.allSources);
        };
        this.getSelectedSources = async (stateManager) => {
            return await stateManager.retrieve(this.selectedSourceKey) ?? this.selectedSources;
        };
        this.setSelectedSources = async (stateManager, sources) => {
            await stateManager.store(this.selectedSourceKey, sources);
            this.selectedSources = sources;
        };
        this.getSourceNameFromId = (sourceId) => {
            return this.allSources[sourceId]["displayName"] ?? "";
        };
    }
}
exports.TachiSourcesClass = TachiSourcesClass;

},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettingsButton = exports.selectedCategoriesSettings = exports.selectedSourcesSettings = exports.serverAddressSettings = void 0;
const serverAddressSettings = (stateManager, requestManager, tachiAPI) => {
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
                                        await tachiAPI.setServerAddress(stateManager, newValue);
                                    }
                                })
                            }),
                            App.createDUIButton({
                                id: "test_server_button",
                                label: "Test Server",
                                onTap: async () => {
                                    const value = await tachiAPI.testRequest(requestManager);
                                    label = value instanceof Error ? value.message : JSON.stringify(value);
                                }
                            }),
                            App.createDUILabel({
                                id: "testing_button",
                                label: label
                            })
                        ]
                    })
                ];
            }
        })
    });
};
exports.serverAddressSettings = serverAddressSettings;
const selectedSourcesSettings = async (stateManager, requestManager, tachiAPI, tachiSources) => {
    try {
        const tachiSourcesInitResponse = await tachiSources.init(stateManager, requestManager, tachiAPI);
        if (tachiSourcesInitResponse instanceof Error) {
            throw tachiSourcesInitResponse;
        }
        tachiSources = tachiSourcesInitResponse;
    }
    catch (error) { }
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
                await tachiSources.setSelectedSources(stateManager, newValue);
            }
        })
    });
};
exports.selectedSourcesSettings = selectedSourcesSettings;
const selectedCategoriesSettings = async (stateManager, requestManager, tachiAPI, tachiCategories) => {
    try {
        const tachiCategoriesInitResponse = await tachiCategories.init(stateManager, requestManager, tachiAPI);
        if (tachiCategoriesInitResponse instanceof Error) {
            throw tachiCategoriesInitResponse;
        }
        tachiCategories = tachiCategoriesInitResponse;
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
    });
};
exports.selectedCategoriesSettings = selectedCategoriesSettings;
// Button that's supposed to reset all settings.
// Seems to be currently broken (8-1-23) [m/d/yyyy].
const resetSettingsButton = async (stateManager, tachiAPI, tachiSources, tachiCategories) => {
    return App.createDUIButton({
        id: "reset_button",
        label: "Reset to Default",
        onTap: async () => {
            await tachiAPI.setServerAddress(stateManager, "http://127.0.0.1:4567");
            await tachiSources.setSelectedSources(stateManager, ["0"]);
            await tachiCategories.setSelectedCategories(stateManager, ["0"]);
            await tachiSources.setAllSources(stateManager, {
                "0": {
                    "name": "Local source",
                    "lang": "localsourcelang",
                    "iconUrl": "/api/v1/extension/icon/localSource",
                    "supportsLatest": true,
                    "isConfigurable": false,
                    "isNsfw": false,
                    "displayName": "Local source"
                }
            });
        }
    });
};
exports.resetSettingsButton = resetSettingsButton;

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TachiDesk = exports.TachiDeskInfo = void 0;
const types_1 = require("@paperback/types");
const Common_1 = require("./Common");
const Settings_1 = require("./Settings");
exports.TachiDeskInfo = {
    author: 'ofelizestevez & Alles',
    description: 'Paperback extension which aims to bridge all of Tachidesks features and the Paperback App.',
    icon: 'icon.png',
    name: 'Tachidesk',
    version: '1.1',
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    contentRating: types_1.ContentRating.EVERYONE,
    sourceTags: [
        {
            text: "Self-hosted",
            type: types_1.BadgeColor.GREY
        }
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.SETTINGS_UI | types_1.SourceIntents.HOMEPAGE_SECTIONS
};
class TachiDesk {
    constructor() {
        // Paperback required defaults
        // Statemanager saves states for the extension (like localstorage api)
        // Request manager makes HTTP requests
        this.stateManager = App.createSourceStateManager();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 20000,
        });
        // Tachidesk essentials. Packages up code neatly so it could be used in multiple places cleanly
        // TachiAPI handles the server address and making requests
        // TachiSources and TachiCategories handle library items (sources, categories)
        this.tachiAPI = new Common_1.TachiAPIClass().init(this.stateManager);
        this.tachiSources = new Common_1.TachiSourcesClass();
        this.tachiCategories = new Common_1.TachiCategoriesClass();
        // Variable used for getMangaShareUrl. Updated by getChapters, meaning that it updates the server address everytime the user opens a manga
        // Technically it doesn't have to be updated this often, thus it has room for improvement
        this.serverAddress = "";
    }
    // Provides the settings for the extension
    async getSourceMenu() {
        const tachiAPI = await this.tachiAPI;
        return App.createDUISection({
            id: "main",
            header: "Source Settings",
            isHidden: false,
            rows: async () => [
                (0, Settings_1.serverAddressSettings)(this.stateManager, this.requestManager, tachiAPI),
                await (0, Settings_1.selectedSourcesSettings)(this.stateManager, this.requestManager, tachiAPI, this.tachiSources),
                await (0, Settings_1.selectedCategoriesSettings)(this.stateManager, this.requestManager, tachiAPI, this.tachiCategories),
                await (0, Settings_1.resetSettingsButton)(this.stateManager, tachiAPI, this.tachiSources, this.tachiCategories),
            ]
        });
    }
    // Provides share url for manga share button, if statement seems to not work
    getMangaShareUrl(mangaId) {
        if (this.serverAddress != "") {
            return this.serverAddress + "/manga/" + mangaId;
        }
        return "";
    }
    // Provides paperback with all of the details of the manga
    async getMangaDetails(mangaId) {
        const tachiAPI = await this.tachiAPI;
        const manga = await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId);
        // throw new Error(this.serverAddress)
        const image = await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl;
        const artist = manga.artist;
        const author = manga.author;
        const desc = manga.description;
        const status = manga.status;
        const titles = [manga.title];
        const tags = [
            App.createTagSection({
                id: "0", label: "genres", tags: manga.genre.map((tag) => App.createTag({
                    id: tag,
                    label: tag
                }))
            }),
        ];
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                image,
                author,
                artist,
                desc,
                status,
                tags
            })
        });
    }
    // Provides paperback with list of chapters, updates this.serverAddress
    async getChapters(mangaId) {
        const tachiAPI = await this.tachiAPI;
        const chaptersData = await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId + "/chapters");
        this.serverAddress = await tachiAPI.getServerAddress(this.stateManager);
        const chapters = [];
        for (const chapter of chaptersData) {
            const id = String(chapter.index);
            const chapNum = parseFloat(chapter.chapterNumber);
            const name = chapter.name;
            const time = new Date(chapter.uploadDate);
            const sortingIndex = chapter.index;
            chapters.push(App.createChapter({
                id,
                name,
                chapNum,
                time,
                sortingIndex
            }));
        }
        return chapters;
    }
    // Called when user opens a manga. It's used to get the page links
    async getChapterDetails(mangaId, chapterId) {
        const tachiAPI = await this.tachiAPI;
        const chapterResponse = await tachiAPI.makeRequest(this.requestManager, "/manga/" + mangaId + "/chapter/" + chapterId);
        const pages = [];
        for (const pageIndex of Array(chapterResponse.pageCount).keys()) {
            pages.push(tachiAPI.getBaseURL() + "/manga/" + mangaId + "/chapter/" + chapterId + "/page/" + pageIndex);
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages
        });
    }
    // Builds the homepage sections. It handles "Updated", "Categories", and "Sources" all by itself.
    // Could be divided into multiple functions.
    async getHomePageSections(sectionCallback) {
        const promises = [];
        const sections = [];
        const tachiAPI = await this.tachiAPI;
        const tachiSources = await this.tachiSources.init(this.stateManager, this.requestManager, tachiAPI);
        const tachiCategories = await this.tachiCategories.init(this.stateManager, this.requestManager, tachiAPI);
        // If we get a bad request, it will give us a server error manga tile.
        if (tachiSources instanceof Error) {
            const section = App.createHomeSection({
                id: "unset",
                title: "Server Error",
                containsMoreItems: false,
                type: types_1.HomeSectionType.singleRowNormal,
                items: (0, Common_1.serverUnavailableMangaTiles)()
            });
            sectionCallback(section);
            return;
        }
        if (tachiCategories instanceof Error) {
            const section = App.createHomeSection({
                id: "unset",
                title: "Server Error",
                containsMoreItems: false,
                type: types_1.HomeSectionType.singleRowNormal,
                items: (0, Common_1.serverUnavailableMangaTiles)()
            });
            sectionCallback(section);
            return;
        }
        // Last test to ensure that we can connect to the server
        if ((await this.tachiAPI).makeRequest(this.requestManager, "/settings/about") instanceof Error) {
            const section = App.createHomeSection({
                id: "unset",
                title: "Server Error",
                containsMoreItems: false,
                type: types_1.HomeSectionType.singleRowNormal,
                items: (0, Common_1.serverUnavailableMangaTiles)()
            });
            sectionCallback(section);
            return;
        }
        // Updated featured Section
        sections.push({
            section: App.createHomeSection({
                id: "updated",
                title: "Last Updated",
                containsMoreItems: true,
                type: types_1.HomeSectionType.singleRowNormal
            }),
            request: App.createRequest({
                url: tachiAPI.getBaseURL() + "/update/recentChapters/0",
                method: "GET"
            }),
            subtitle: "",
            type: "update"
        });
        // Category Sections
        for (const categoryId of await tachiCategories.getSelectedCategories(this.stateManager)) {
            sections.push({
                section: App.createHomeSection({
                    id: "category-" + categoryId,
                    title: tachiCategories.getSelectedCategoryFromId(categoryId.toString()),
                    containsMoreItems: true,
                    type: types_1.HomeSectionType.singleRowNormal
                }),
                request: App.createRequest({
                    url: tachiAPI.getBaseURL() + "/category/" + categoryId,
                    method: "GET"
                }),
                subtitle: "",
                type: "category"
            });
        }
        // Source Sections
        for (const sourceId of await tachiSources.getSelectedSources(this.stateManager)) {
            sections.push({
                section: App.createHomeSection({
                    id: "popular-" + sourceId,
                    title: tachiSources.getSourceNameFromId(sourceId) + " Popular",
                    containsMoreItems: true,
                    type: types_1.HomeSectionType.singleRowNormal
                }),
                request: App.createRequest({
                    url: tachiAPI.getBaseURL() + "/source/" + sourceId + "/popular/1",
                    method: "GET"
                }),
                subtitle: tachiSources.getSourceNameFromId(sourceId),
                type: "source"
            });
            if (tachiSources.getAllSources()[sourceId]["supportsLatest"]) {
                sections.push({
                    section: App.createHomeSection({
                        id: "latest-" + sourceId,
                        title: tachiSources.getSourceNameFromId(sourceId) + " Latest",
                        containsMoreItems: true,
                        type: types_1.HomeSectionType.singleRowNormal
                    }),
                    request: App.createRequest({
                        url: tachiAPI.getBaseURL() + "/source/" + sourceId + "/latest/1",
                        method: "GET"
                    }),
                    subtitle: tachiSources.getSourceNameFromId(sourceId),
                    type: "source"
                });
            }
        }
        // run promises
        for (const section of sections) {
            sectionCallback(section.section);
            promises.push(this.requestManager.schedule(section.request, 1).then(async (response) => {
                const json = JSON.parse(response.data ?? "");
                const tiles = [];
                if (section.type == "update") {
                    for (const manga of json.page.slice(0, 10)) {
                        tiles.push(App.createPartialSourceManga({
                            title: manga.manga.title,
                            mangaId: manga.manga.id.toString(),
                            image: await tachiAPI.getServerAddress(this.stateManager) + manga.manga.thumbnailUrl,
                            subtitle: ""
                        }));
                    }
                }
                if (section.type == "category") {
                    for (const manga of json.slice(0, 10)) {
                        tiles.push(App.createPartialSourceManga({
                            title: manga.title,
                            mangaId: manga.id.toString(),
                            image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl
                        }));
                    }
                }
                if (section.type == "source") {
                    for (const manga of json.mangaList.slice(0, 10)) {
                        tiles.push(App.createPartialSourceManga({
                            title: manga.title,
                            mangaId: manga.id.toString(),
                            image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl,
                            subtitle: section.subtitle
                        }));
                    }
                }
                section.section.items = tiles;
                sectionCallback(section.section);
            }));
        }
        // awit promise all
        await Promise.all(promises);
    }
    // Handles when users click on the "more" button in the homepage.
    // Currently only set up to work with sources
    async getViewMoreItems(homepageSectionId, metadata) {
        const sourceId = homepageSectionId.split('-').pop() ?? "";
        const type = homepageSectionId.split("-")[0];
        const tachiAPI = await this.tachiAPI;
        const tachiSources = await this.tachiSources.init(this.stateManager, this.requestManager, tachiAPI);
        if (tachiSources instanceof Error) {
            throw tachiSources;
        }
        const tiles = [];
        let tileData;
        let page;
        // Even if currentpageindex + 10 is bigger than currentpagelength, it will just cut to currentpagelength
        switch (type) {
            case "updated":
                page = metadata?.page ?? 0;
                tileData = await tachiAPI.makeRequest(this.requestManager, "/update/recentChapters/" + page);
                for (const manga of tileData.page) {
                    tiles.push(App.createPartialSourceManga({
                        title: manga.manga.title,
                        mangaId: manga.manga.id.toString(),
                        image: await tachiAPI.getServerAddress(this.stateManager) + manga.manga.thumbnailUrl,
                        subtitle: ""
                    }));
                }
                break;
            case "category":
                page = metadata?.page ?? -1;
                tileData = await tachiAPI.makeRequest(this.requestManager, "/category/" + sourceId);
                for (const manga of tileData) {
                    tiles.push(App.createPartialSourceManga({
                        title: manga.title,
                        mangaId: manga.id.toString(),
                        image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl,
                        subtitle: ""
                    }));
                }
                break;
            default:
                page = metadata?.page ?? 1;
                tileData = await tachiAPI.makeRequest(this.requestManager, "/source/" + sourceId + "/" + type + "/" + page);
                for (const manga of tileData.mangaList) {
                    tiles.push(App.createPartialSourceManga({
                        title: manga.title,
                        mangaId: manga.id.toString(),
                        image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl,
                        subtitle: ""
                    }));
                }
                break;
        }
        metadata = tileData.hasNextPage ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: tiles,
            metadata: metadata
        });
    }
    // Handles search
    async getSearchResults(query, metadata) {
        const tachiAPI = await this.tachiAPI;
        const tachiSources = await this.tachiSources.init(this.stateManager, this.requestManager, tachiAPI);
        if (tachiSources instanceof Error) {
            throw tachiSources;
        }
        const selectedSources = await tachiSources.getSelectedSources(this.stateManager);
        const meta_sources = metadata?.sources ?? {};
        const page = metadata?.page ?? 1;
        const paramsList = [`pageNum=${page}`];
        if (query.title !== undefined && query.title !== "") {
            paramsList.push("searchTerm=" + encodeURIComponent(query.title));
        }
        let paramsString = "";
        if (paramsList.length > 0) {
            paramsString = "?" + paramsList.join("&");
        }
        const tiles = [];
        for (const source of selectedSources) {
            if (page !== 1) {
                if (!meta_sources[source.id])
                    continue;
            }
            const mangaResults = await tachiAPI.makeRequest(this.requestManager, "/source/" + source + "/search" + paramsString);
            for (const manga of mangaResults.mangaList) {
                tiles.push(App.createPartialSourceManga({
                    title: manga.title,
                    mangaId: String(manga.id),
                    image: await tachiAPI.getServerAddress(this.stateManager) + manga.thumbnailUrl,
                    subtitle: tachiSources.getSourceNameFromId(manga.sourceId)
                }));
            }
            meta_sources[source] = mangaResults.hasNextPage;
        }
        metadata = tiles.length !== 0 ? { page: page + 1, sources: meta_sources } : undefined;
        return App.createPagedResults({
            results: tiles,
            metadata
        });
    }
}
exports.TachiDesk = TachiDesk;

},{"./Common":62,"./Settings":63,"@paperback/types":61}]},{},[64])(64)
});
