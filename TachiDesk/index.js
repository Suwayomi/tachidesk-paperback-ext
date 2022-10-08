(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
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

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);

},{"./Source":1,"./Tracker":2}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);

},{"./base":3,"./models":47}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],6:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],7:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],8:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],9:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],10:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],11:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],12:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],13:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],14:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],15:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],16:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],17:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],18:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],19:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],20:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],21:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],22:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],23:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);
__exportStar(require("./Stepper"), exports);

},{"./Button":8,"./Form":9,"./FormRow":10,"./Header":11,"./InputField":12,"./Label":13,"./Link":14,"./MultilineLabel":15,"./NavigationButton":16,"./OAuthButton":17,"./Section":18,"./Select":19,"./Stepper":20,"./Switch":21,"./WebViewButton":22}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],27:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],28:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],29:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],30:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],31:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],32:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],33:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],34:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],35:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],36:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],37:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],40:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],41:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],43:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],44:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],45:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],46:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],47:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./DynamicUI"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./TrackedManga"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./TrackedMangaChapterReadAction"), exports);
__exportStar(require("./TrackerActionQueue"), exports);
__exportStar(require("./SearchField"), exports);
__exportStar(require("./RawData"), exports);
__exportStar(require("./SearchFilter"), exports);

},{"./Chapter":5,"./ChapterDetails":6,"./Constants":7,"./DynamicUI":23,"./HomeSection":24,"./Languages":25,"./Manga":26,"./MangaTile":27,"./MangaUpdate":28,"./PagedResults":29,"./RawData":30,"./RequestHeaders":31,"./RequestInterceptor":32,"./RequestManager":33,"./RequestObject":34,"./ResponseObject":35,"./SearchField":36,"./SearchFilter":37,"./SearchRequest":38,"./SourceInfo":39,"./SourceManga":40,"./SourceStateManager":41,"./SourceTag":42,"./TagSection":43,"./TrackedManga":44,"./TrackedMangaChapterReadAction":45,"./TrackerActionQueue":46}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStateData = exports.retrieveStateData = exports.getTachiAPI = exports.getServerUnavailableMangaTiles = void 0;
function getServerUnavailableMangaTiles() {
    return [
        createMangaTile({
            id: "Tachidesk",
            title: createIconText({ text: "Tachidesk" }),
            image: "",
            subtitleText: createIconText({ text: "unavailable" }),
        }),
    ];
}
exports.getServerUnavailableMangaTiles = getServerUnavailableMangaTiles;
// 
// TACHI API STATE METHODS
//
const DEFAULT_TACHI_SERVER_ADDRESS = 'http://127.0.0.1:4567';
const DEFAULT_TACHI_API = DEFAULT_TACHI_SERVER_ADDRESS + '/api/v1';
async function getTachiAPI(stateManager) {
    return await stateManager.retrieve('tachiAPI') ?? DEFAULT_TACHI_API;
}
exports.getTachiAPI = getTachiAPI;
async function retrieveStateData(stateManager) {
    const serverURL = await stateManager.retrieve('serverAddress') ?? DEFAULT_TACHI_SERVER_ADDRESS;
    return { serverURL };
}
exports.retrieveStateData = retrieveStateData;
async function setStateData(stateManager, data) {
    await setTachiServerAddress(stateManager, data['serverAddress'] ?? DEFAULT_TACHI_SERVER_ADDRESS);
}
exports.setStateData = setStateData;
async function setTachiServerAddress(stateManager, apiUri) {
    await stateManager.store('serverAddress', apiUri);
    await stateManager.store('tachiAPI', createtachiAPI(apiUri));
}
function createtachiAPI(serverAddress) {
    return serverAddress + (serverAddress.slice(-1) === '/' ? 'api/v1' : '/api/v1');
}

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettingsButton = exports.TDSettings = exports.getSources = exports.getSourcesList = exports.TDSources = exports.testServerSettingsMenu = exports.serverSettingsMenu = exports.testServerSettings = void 0;
const Common_1 = require("./Common");
/* Helper functions */
const testServerSettings = async (stateManager, requestManager) => {
    // Try to establish a connection with the server. Return an human readable string containing the test result
    const tachiAPI = await (0, Common_1.getTachiAPI)(stateManager);
    // We check credentials are set in server settings
    if (tachiAPI === null) {
        return "Impossible: Unset credentials in server settings";
    }
    // To test these information, we try to make a connection to the server
    // We could use a better endpoint to test the connection
    const request = createRequestObject({
        url: `${tachiAPI}/settings/about`,
        method: "GET",
        incognito: true, // We don't want the authorization to be cached
    });
    let responseStatus = undefined;
    try {
        const response = await requestManager.schedule(request, 1);
        responseStatus = response.status;
        JSON.parse(response.data); // throws error if an non json is found
    }
    catch (error) {
        // If the server is unavailable error.message will be 'AsyncOperationTimedOutError'
        return `Failed: Could not connect to server - ${error.message}`;
    }
    switch (responseStatus) {
        case 200: {
            return "Successful connection!";
        }
        default: {
            return `Error ${responseStatus}`;
        }
    }
};
exports.testServerSettings = testServerSettings;
/* UI definition */
// NOTE: Submitted data won't be tested
const serverSettingsMenu = (stateManager) => {
    return createNavigationButton({
        id: "server_settings",
        value: "",
        label: "Server Settings",
        form: createForm({
            onSubmit: async (values) => (0, Common_1.setStateData)(stateManager, values),
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "serverSettings",
                    header: "Server Settings",
                    footer: "Tested on Tachidesk Server version: v0.6.5 r1125",
                    rows: async () => (0, Common_1.retrieveStateData)(stateManager).then((values) => [
                        createInputField({
                            id: "serverAddress",
                            label: "Server URL",
                            placeholder: "http://127.0.0.1:4567",
                            value: values.serverURL,
                            maskInput: false,
                        }),
                    ]),
                }),
            ],
        }),
    });
};
exports.serverSettingsMenu = serverSettingsMenu;
const testServerSettingsMenu = (stateManager, requestManager) => {
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
                    rows: () => (0, exports.testServerSettings)(stateManager, requestManager).then(async (value) => [
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
exports.testServerSettingsMenu = testServerSettingsMenu;
class SourceClass {
    constructor() {
        this.Sources = [];
        this.Sources = this.Sources.sort((a, b) => a.displayName > b.displayName ? 1 : -1);
    }
    getIDList() {
        return this.Sources.map(Sources => Sources.id);
    }
    getSelectedSources(sources) {
        const FilteredSources = [];
        for (const source of sources) {
            const fSources = this.Sources.filter(MSources => MSources.id === source);
            if (fSources && fSources[0]) {
                FilteredSources.push(fSources[0]);
            }
        }
        const SortedSources = FilteredSources.sort((a, b) => a.displayName > b.displayName ? 1 : -1);
        return SortedSources;
    }
    getNameFromID(id) {
        return this.Sources.filter(Sources => Sources.id == id)[0]?.displayName ?? 'Unknown';
    }
    getDefault() {
        return this.Sources.filter(Sources => Sources.default).map(Sources => Sources.id);
    }
}
exports.TDSources = new SourceClass;
const getSourcesList = async (stateManager) => {
    return await stateManager.retrieve('tdsources') ?? [
        {
            id: "0",
            name: "Local source",
            displayName: "Local source"
        },
    ];
};
exports.getSourcesList = getSourcesList;
const getSources = async (stateManager) => {
    const tachiAPI = await (0, Common_1.getTachiAPI)(stateManager);
    const requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
    });
    const request = createRequestObject({
        url: `${tachiAPI}/source/list`,
        method: "GET",
    });
    const response = await requestManager.schedule(request, 1);
    let data;
    try {
        data = JSON.parse(response.data);
    }
    catch (e) {
        throw new Error(`${e}`);
    }
    if (data.length === 0)
        throw Error('Could not Find any sources avaliable in the api');
    exports.TDSources.Sources = data;
};
exports.getSources = getSources;
const TDSettings = (stateManager) => {
    return createNavigationButton({
        id: 'tdsource_settings',
        value: '',
        label: 'TachiDesk Source Settings',
        form: createForm({
            onSubmit: (values) => {
                return Promise.all([
                    stateManager.store('tdsources', values.tdsources),
                ]).then();
            },
            validate: () => {
                return Promise.resolve(true);
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'tachidesk_sources',
                        footer: '',
                        rows: () => {
                            return Promise.all([
                                (0, exports.getSourcesList)(stateManager),
                            ]).then(async (values) => {
                                return [
                                    createSelect({
                                        id: 'tdsources',
                                        label: 'Sources',
                                        options: exports.TDSources.getIDList(),
                                        displayLabel: option => exports.TDSources.getNameFromID(option),
                                        value: values[0],
                                        allowsMultiselect: true,
                                        minimumOptionCount: 1,
                                    })
                                ];
                            });
                        }
                    })
                ]);
            }
        })
    });
};
exports.TDSettings = TDSettings;
const resetSettingsButton = (stateManager) => {
    return createButton({
        id: "reset",
        label: "Reset to Default",
        value: "",
        onTap: async () => {
            await Promise.all([
                await (0, Common_1.setStateData)(stateManager, {}),
                await stateManager.store('tdsources', null),
            ]);
        }
    });
};
exports.resetSettingsButton = resetSettingsButton;

},{"./Common":48}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TachiDesk = exports.capitalize = exports.parseMangaStatus = exports.TachiDeskInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Settings_1 = require("./Settings");
const Common_1 = require("./Common");
// This source use Tachi REST API
// https://tachiurl/api/swagger-u
// Manga are represented by `series`
// Chapters are represented by `books`
// The Basic Authentication is handled by the interceptor
// Code and method used by both the source and the tracker are defined in the duplicated `TachiCommon.ts` file
// Due to the self hosted nature of Tachi, this source requires the user to enter its server credentials in the source settings menu
// Some methods are known to throw errors without specific actions from the user. They try to prevent this behavior when server settings are not set.
// This include:
//  - homepage sections
//  - getTags() which is called on the homepage
//  - search method which is called even if the user search in an other source
exports.TachiDeskInfo = {
    version: "0.0.1",
    name: "Tachidesk",
    icon: "icon.png",
    author: "Alles",
    authorWebsite: "https://github.com/AlexZorzi",
    description: "Tachidesk extension",
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    sourceTags: [
        {
            text: "Tachiyomi Magic",
            type: paperback_extensions_common_1.TagType.RED,
        },
    ],
};
const parseMangaStatus = (tachiStatus) => {
    switch (tachiStatus) {
        case "ENDED":
            return paperback_extensions_common_1.MangaStatus.COMPLETED;
        case "ONGOING":
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        case "ABANDONED":
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        case "HIATUS":
            return paperback_extensions_common_1.MangaStatus.ONGOING;
    }
    return paperback_extensions_common_1.MangaStatus.ONGOING;
};
exports.parseMangaStatus = parseMangaStatus;
const capitalize = (tag) => {
    return tag.replace(/^\w/, (c) => c.toUpperCase());
};
exports.capitalize = capitalize;
class TachiDesk extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.stateManager = createSourceStateManager({});
        this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 20000,
        });
        /*override async filterUpdatedManga(
            mangaUpdatesFoundCallback: (updates: MangaUpdates) => void,
            time: Date,
            ids: string[]
        ): Promise<void> {
            const tachiAPI = await getTachiAPI(this.stateManager);
    
            // We make requests of PAGE_SIZE titles to `series/updated/` until we got every titles
            // or we got a title which `lastModified` metadata is older than `time`
            let page = 0;
            const foundIds: string[] = [];
            let loadMore = true;
    
            while (loadMore) {
                const request = createRequestObject({
                    url: `${tachiAPI}/series/updated/`,
                    param: `?page=${page}&size=${PAGE_SIZE}&deleted=false`,
                    method: "GET",
                });
    
                const data = await this.requestManager.schedule(request, 1);
                const result =
                    typeof data.data === "string" ? JSON.parse(data.data) : data.data;
    
                for (const serie of result.content) {
                    const serieUpdated = new Date(serie.metadata.lastModified);
    
                    if (serieUpdated >= time) {
                        if (ids.includes(serie)) {
                            foundIds.push(serie);
                        }
                    } else {
                        loadMore = false;
                        break;
                    }
                }
    
                // If no series were returned we are on the last page
                if (result.content.length === 0) {
                    loadMore = false;
                }
    
                page = page + 1;
    
                if (foundIds.length > 0) {
                    mangaUpdatesFoundCallback(
                        createMangaUpdates({
                            ids: foundIds,
                        })
                    );
                }
            }
        }*/
    }
    async getSourceMenu() {
        return createSection({
            id: "main",
            header: "Source Settings",
            rows: async () => [
                (0, Settings_1.TDSettings)(this.stateManager),
                (0, Settings_1.serverSettingsMenu)(this.stateManager),
                (0, Settings_1.testServerSettingsMenu)(this.stateManager, this.requestManager),
                (0, Settings_1.resetSettingsButton)(this.stateManager)
            ],
        });
    }
    async getMangaDetails(mangaId) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const request = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/`,
            method: "GET",
        });
        const response = await this.requestManager.schedule(request, 1);
        let result;
        try {
            result = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const tagSections = [
            createTagSection({ id: "0", label: "genres", tags: [] }),
        ];
        // For each tag, we append a type identifier to its id and capitalize its label
        tagSections[0].tags = result.genre.map((elem) => createTag({ id: "genre-" + elem, label: (0, exports.capitalize)(elem) }));
        const authors = [result.author];
        const artists = [result.artist];
        return createManga({
            id: mangaId,
            titles: [result.title],
            image: `${tachiAPI}/manga/${mangaId}/thumbnail`,
            status: (0, exports.parseMangaStatus)(result.status),
            // langFlag: metadata.language,
            langFlag: "Todo",
            // Unused: langName
            artist: artists.join(", "),
            author: authors.join(", "),
            desc: result.description ? result.description : "No summary",
            tags: tagSections,
            // lastUpdate: result.lastModified,
            lastUpdate: new Date(),
        });
    }
    async getChapters(mangaId) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const chapterRequest = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/chapters`,
            param: "",
            method: "GET",
        });
        const chaptersResponse = await this.requestManager.schedule(chapterRequest, 2);
        let chaptersResult;
        try {
            chaptersResult = JSON.parse(chaptersResponse.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const chapters = [];
        //const languageCode = parseLangCode("Todo");
        for (const chapter of chaptersResult) {
            chapters.push(createChapter({
                id: String(chapter.index),
                mangaId: mangaId,
                chapNum: parseFloat(chapter.chapterNumber),
                //langCode: languageCode,
                name: `${chapter.name}`,
                time: new Date(chapter.uploadDate),
                // @ts-ignore
                sortingIndex: chapter.index
            }));
        }
        return chapters;
    }
    async getChapterDetails(mangaId, chapterId) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const request = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/chapter/${chapterId}`,
            method: "GET",
        });
        const data = await this.requestManager.schedule(request, 1);
        let result;
        try {
            result = JSON.parse(data.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const pages = [];
        for (const pageindex of Array(result.pageCount - 1).keys()) {
            pages.push(`${tachiAPI}/manga/${mangaId}/chapter/${chapterId}/page/${pageindex}`);
        }
        return createChapterDetails({
            id: chapterId,
            longStrip: true,
            mangaId: mangaId,
            pages: pages,
        });
    }
    async getSearchResults(searchQuery, metadata) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const SourcesList = await (0, Settings_1.getSourcesList)(this.stateManager);
        const SelectedSources = Settings_1.TDSources.getSelectedSources(SourcesList);
        if (tachiAPI === null) {
            console.log("searchRequest failed because server settings are unset");
            return createPagedResults({
                results: (0, Common_1.getServerUnavailableMangaTiles)(),
            });
        }
        const page = metadata?.page ?? 1;
        const meta_sources = metadata?.sources ?? {};
        const paramsList = [`pageNum=${page}`];
        if (searchQuery.title !== undefined && searchQuery.title !== "") {
            paramsList.push("searchTerm=" + encodeURIComponent(searchQuery.title));
        }
        let paramsString = "";
        if (paramsList.length > 0) {
            paramsString = "?" + paramsList.join("&");
        }
        const tiles = [];
        for (const source of SelectedSources) {
            if (page !== 1) {
                if (!meta_sources[source.id])
                    continue;
            }
            const request = createRequestObject({
                url: `${tachiAPI}/source/${source.id}/search${paramsString}`,
                method: "GET",
            });
            let response;
            try {
                response = await this.requestManager.schedule(request, 1);
                if (response.status != 200) {
                    continue;
                }
            }
            catch (error) {
                console.log(`searchRequest failed with error: ${error}`);
                return createPagedResults({
                    results: (0, Common_1.getServerUnavailableMangaTiles)(),
                });
            }
            let data;
            try {
                data = JSON.parse(response.data);
            }
            catch (e) {
                throw new Error(`${e}`);
            }
            for (const serie of data.mangaList) {
                tiles.push(createMangaTile({
                    id: String(serie.id),
                    title: createIconText({ text: serie.title }),
                    subtitleText: createIconText({ text: source.displayName }),
                    image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                }));
            }
            meta_sources[source.id] = data.hasNextPage;
        }
        metadata = tiles.length !== 0 ? { page: page + 1, sources: meta_sources } : undefined;
        return createPagedResults({
            results: tiles,
            metadata,
        });
    }
    async getHomePageSections(sectionCallback) {
        (0, Settings_1.getSources)(this.stateManager);
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const SourcesList = await (0, Settings_1.getSourcesList)(this.stateManager);
        const SelectedSources = Settings_1.TDSources.getSelectedSources(SourcesList);
        if (tachiAPI === null) {
            console.log("searchRequest failed because server settings are unset");
            const section = createHomeSection({
                id: "unset",
                title: "Go to source settings to set your Tachi server credentials.",
                view_more: false,
                items: (0, Common_1.getServerUnavailableMangaTiles)(),
            });
            sectionCallback(section);
            return;
        }
        const sections = [];
        for (const source of SelectedSources) {
            sections.push({
                section: createHomeSection({
                    id: `popular-${source.id}`,
                    title: `${source.displayName} Popular`,
                    view_more: true,
                }),
                request: createRequestObject({
                    url: encodeURI(`${tachiAPI}/source/${source.id}/popular/1`),
                    method: 'GET',
                }),
                subtitle: source.displayName
            });
            if (source.supportsLatest) {
                sections.push({
                    section: createHomeSection({
                        id: `latest-${source.id}`,
                        title: `${source.displayName} Latest`,
                        view_more: true,
                    }),
                    request: createRequestObject({
                        url: encodeURI(`${tachiAPI}/source/${source.id}/latest/1`),
                        method: 'GET',
                    }),
                    subtitle: source.displayName
                });
            }
        }
        const promises = [];
        for (const section of sections) {
            sectionCallback(section.section);
            promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                let data;
                try {
                    data = JSON.parse(response.data);
                }
                catch (e) {
                    throw new Error(`${e}`);
                }
                const tiles = [];
                for (const serie of data.mangaList) {
                    tiles.push(createMangaTile({
                        id: serie.id.toString(),
                        title: createIconText({ text: serie.title }),
                        image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                        subtitleText: createIconText({ text: section.subtitle })
                    }));
                }
                section.section.items = tiles;
                sectionCallback(section.section);
            }));
        }
        // Make sure the function completes
        await Promise.all(promises);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const page = metadata?.page ?? 1;
        const sourceId = homepageSectionId.split('-')?.pop() ?? '';
        const SelectedSources = Settings_1.TDSources.getSelectedSources([sourceId]) ?? [];
        const request = createRequestObject({
            url: `${tachiAPI}/source/${sourceId}/${homepageSectionId.includes('latest-') ? 'latest' : 'popular'}/${page}`,
            method: "GET",
        });
        const response = await this.requestManager.schedule(request, 1);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const tiles = [];
        for (const serie of data.mangaList) {
            tiles.push(createMangaTile({
                id: serie.id.toString(),
                title: createIconText({ text: serie.title }),
                image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                subtitleText: createIconText({ text: SelectedSources.map(x => x.displayName)[0] ?? '' })
            }));
        }
        metadata = data.hasNextPage ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: tiles,
            metadata: metadata,
        });
    }
}
exports.TachiDesk = TachiDesk;

},{"./Common":48,"./Settings":49,"paperback-extensions-common":4}]},{},[50])(50)
});
