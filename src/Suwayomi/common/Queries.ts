export interface HOME_SECTION_METADATA {
    serverUrl: string
    hasNextPage: boolean
};

// ! ----
// ! Test Query
// ! ----

export const ABOUT_QUERY = `
query {
    aboutServer {
        version
    }
}`;

// ! ----
// ! Server Categories Query
// ! ----

export interface Category {
    id: number,
    order: number,
    name: string
};

export const ALL_CATEGORIES_QUERY = `
query {
    categories {
        nodes {
            id
            order
            name
        }
    }
}`;

export interface ALL_CATEGORIES_DATA {
    categories: {
        nodes: Category[]
    }
};

// ! ----
// ! Server Sources Query
// ! ----

export interface Sources {
    id: string,
    displayName: string,
    lang: string,
    supportsLatest: boolean
};

export const ALL_SOURCES_QUERY = `
query {
    sources {
        nodes {
            id
            displayName
            lang
            supportsLatest
        }
    }
}`;

export interface ALL_SOURCES_DATA {
    sources: {
        nodes: Sources[]
    }
};

// ! ----
// ! Updated Homepage Section
// ! ----

export interface UpdatedSectionMetadata extends HOME_SECTION_METADATA {
    first: number
    offset: number
};

export interface UPDATED_SECTION_VARIABLES {
    first: number
    offset: number
};

export const UPDATED_SECTION_QUERY = `
query ($first: Int!, $offset: Int!){
	chapters
    (
		orderBy: FETCHED_AT
		orderByType: DESC
		filter: {inLibrary: {equalTo: true}}
        first: $first
        offset: $offset
	) 
    {
		nodes {
			name
			manga {
				id
                title
                thumbnailUrl
			}
		}
        pageInfo {
            hasNextPage
        }
	}
}`;

export interface UPDATED_SECTION_DATA {
    chapters: {
        nodes: {
            name: string,
            manga: {
                id: number,
                title: string,
                thumbnailUrl: string
            }
        }[],
        pageInfo: {
            hasNextPage: boolean
        }
    }
};

// ! ----
// ! Category Homepage Section
// ! ----

export interface CategorySectionMetadata extends HOME_SECTION_METADATA {
    first: number
    offset: number
};

export interface CATEGORY_SECTION_VARIABLES {
    categoryIds: number[]
    first: number,
    offset: number
};

export const CATEGORY_SECTION_QUERY = `
query ($categoryIds: [Int!], $first: Int!, $offset: Int!) {
	mangas(condition: {categoryIds: $categoryIds}, offset: $offset, first: $first) {
		nodes {
			id
			title
			thumbnailUrl
			source {
				displayName
			}
		}
		pageInfo {
			hasNextPage
		}
	}
}`;

export interface CATEGORY_SECTION_DATA {
    mangas: {
        nodes: {
            id: number,
            title: string,
            thumbnailUrl: string,
            source: {
                displayName: string
            }
        }[],
        pageInfo: {
            hasNextPage: boolean
        }
    }
};

// ! ----
// ! Source Homepage Section
// ! ----

export interface SourceSectionMetadata extends HOME_SECTION_METADATA {
    query: string,
    page: number,
    length: number
    starting: number,
    type: string,
};

export interface SOURCE_SECTION_VARIABLES {
    page: number
    source: string
    type: string,
    query: string
};

export const SOURCE_SECTION_QUERY = `
mutation ($page: Int!, $source: LongString!, $type: FetchSourceMangaType!, $query: String!) {
	fetchSourceManga(
		input: {source: $source, page: $page, type: $type, query: $query}
	) 
    {
		mangas {
			id
			title
			thumbnailUrl
			source {
				displayName
			}
		}
		hasNextPage
	}
}`;

export interface SOURCE_SECTION_DATA {
    fetchSourceManga: {
        mangas: {
            id: number
            title: string
            thumbnailUrl: string
            source: {
                displayName: string
            }
        }[]
        hasNextPage: boolean
    }
};

// ! ----
// ! Manga Search
// ! ----

export interface MANGA_SEARCH_METADATA extends HOME_SECTION_METADATA {
    query: string,
    first: number,
    offset: number,
}

export interface MANGA_SEARCH_VARIABLES {
    includes: string,
    first: number,
    offset: number
}

export const MANGA_SEARCH_QUERY = `
query ($includes: String!, $first: Int!, $offset: Int!) {
	mangas(
		filter: {title: {includesInsensitive: $includes}}
		first: $first
		offset: $offset
		orderBy: IN_LIBRARY_AT
		orderByType: DESC
	) {
		nodes {
			id
			title
			thumbnailUrl
			source {
				displayName
			}
		}
		pageInfo {
			hasNextPage
		}
	}
}`;

export interface MANGA_SEARCH_DATA {
    mangas: {
        nodes: {
            id: number
            title: string
            thumbnailUrl: string
            source: {
                displayName: string
            }
        }[]
        hasNextPage: boolean
    }
}

// ! ----
// ! Get and Fetch Manga
// ! ----

export interface Manga {
    id: number,
    title: string,
    description: string,
    artist: string,
    author: string,
    status: string,
    thumbnailUrl: string,
    lastFetchedAt: string,
    genre: [
        string
    ]
}

export interface MANGA_DETAILS_VARIABLES {
    id: number
};

export const GET_MANGA_DETAILS_QUERY = `
query ($id: Int!) {
    manga(id: $id) {
        id
        title
        description
        artist
        author
        status
        thumbnailUrl
        lastFetchedAt
        genre
    }
}`;

export const FETCH_MANGA_DETAILS_QUERY = `
mutation ($id: Int!) {
    fetchManga(input: {id: $id}) {
        manga {
            id
            title
            description
            artist
            author
            status
            thumbnailUrl
            lastFetchedAt
            genre
        }
    }
}`;

export interface GET_MANGA_DETAILS_DATA {
    manga: Manga
};

export interface FETCH_MANGA_DETAILS_DATA {
    fetchManga: {
        manga: Manga
    }
}

// ! ----
// ! Chapter
// ! ---

export interface Chapter {
    id: number,
    chapterNumber: number,
    sourceOrder: number,
    uploadDate: string,
    name: string
    pageCount: number
}

export interface CHAPTER_LIST_VARIABLES {
    id: number
};

export const GET_CHAPTER_LIST_QUERY = `
query MyQuery($id: Int!) {
    manga(id: $id) {
        chaptersLastFetchedAt
    }
    chapters(condition: {mangaId: $id}) {
        nodes {
            id
            chapterNumber
            sourceOrder
            uploadDate
            name
        }
    }
}`;

export const FETCH_CHAPTER_LIST_QUERY = `
mutation ($id: Int!) {
    fetchChapters(input: {mangaId: $id}) {
        chapters {
            id
            chapterNumber
            sourceOrder
            uploadDate
            name
        }
    }
}`;

export interface GET_CHAPTER_LIST_DATA {
    manga: {
        chaptersLastFetchedAt: string
    }
    chapters: {
        nodes: Chapter[]
    }
};

export interface FETCH_CHAPTER_LIST_DATA {
    fetchChapters: {
        chapters: Chapter[]
    }
};

export interface UPDATE_CHAPTER_VARIABLES {
    id: number
}

export const UPDATE_CHAPTER_QUERY = `
mutation ($id: Int!) {
	updateChapter(input: {id: $id, patch: {isRead: true}}) {
		chapter {
			id
		}
	}
}
`

// ! ----
// ! CHAPTER_PAGES
// ! ---

export interface CHAPTER_PAGES_VARIABLES {
    id: number
}

export const FETCH_CHAPTER_PAGES_QUERY = `
mutation MyMutation($id: Int!) {
    fetchChapterPages(input: {chapterId: $id}) {
        pages
    }
}`

export interface FETCH_CHAPTER_DATA {
    fetchChapterPages: {
        pages: string[]
    }
}

// ! ----
// ! Tracker
// ! ----

export interface MANGA_TRACKER_SETTINGS_VARIABLES {
    id: number
}

export const MANGA_TRACKER_SETTINGS_QUERY = `
query ($id: Int!) {
	manga(id: $id) {
		inLibrary
		categories {
			nodes {
				id
                name
			}
		}
	}
	categories {
		nodes {
			id
			order
            name
		}
	}
}
`
export interface MANGA_TRACKER_SETTINGS_DATA {
    manga: {
        inLibrary: boolean
        categories: {
            nodes: {
                id: number
                name: string
            }[]
        }
    }
    categories: {
        nodes: {
            id: number
            order: number
            name: string
        }[]
    }
}

export interface UPDATE_MANGA_VARIABLES {
    id: number
    inLibrary: boolean
    addToCategories: number[]
    removeFromCategories: number[]
}

export const UPDATE_MANGA_QUERY = `
mutation MyMutation($addToCategories: [Int!] = [10], $removeFromCategories: [Int!] = 10, $inLibrary: Boolean = false, $id: Int = 10) {
    updateManga(input: {id: $id, patch: {inLibrary: $inLibrary}}) {
      manga {
        id
        inLibrary
        title
      }
    }
    updateMangaCategories(
      input: {id: $id, patch: {addToCategories: $addToCategories, removeFromCategories: $removeFromCategories}}
    ) {
      manga {
        id
      }
    }
  }
` 