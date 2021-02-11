import Axios from 'axios'
import Storage from 'local-storage-fallback'
import Vue from 'vue'
import Vuex from 'vuex'

import lunr from 'lunr'

import config from './config'


// LOCALSTORAGE
// IMPORTANT: We need the ability to delete our large localStorage cache, and want to avoid calling
//            localStorage.clear(), so please DON'T RENAME "bt-tools-??" after launch.
const keyNameAPICache = lang => `bt-tools-${lang}`
const keyNameLang = 'bt-lang'
const keyNameSaved = 'bt-saved'

const storageGetSavedTools = () => {
  return new Set(JSON.parse(Storage.getItem(keyNameSaved) || '[]'))
}
const storageSetSavedTools = tools => {
  Storage.setItem(keyNameSaved, JSON.stringify([...tools.keys()]))
}

const storageSetCache = (lang, data, nestedCall = false) => {
  // TODO: to help fit more data under quota, remove top-level key-modules, document_whatever
  try {
    Storage.setItem(keyNameAPICache(lang), JSON.stringify({'timestamp': (new Date).getTime(), data: data}))
  } catch(e) {
    console.debug(e)
    if (!nestedCall) {
      console.debug("Trying to make room for localStorage cache...")
      config.langs.forEach(lang => Storage.removeItem(keyNameAPICache(lang)))
      storageSetCache(lang, data, true)
    } else {
      console.debug("Couldn't save cache")
    }
  }
}
const storageGetCache = lang => {
  try {
    let data = JSON.parse(Storage.getItem(keyNameAPICache(lang)))
    if (data && data.timestamp && ((new Date).getTime() - data.timestamp < config.cacheLifespan)) {
      return data.data
    }
  } catch(e) {
    console.debug("Removing bad localStorage tools cache...")
    Storage.removeItem(keyNameAPICache(lang))
  }
}


// VUEX
Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    debug: 'Ready.',
    lang: null,
    langRequested: null,
    savedTools: storageGetSavedTools(),
    tools: [],
    toolsBySlug: {},
    searchIndices: {},
    searchResults: [],
  },
  actions: {
    // API TOOLS
    LANG_SET(context, [lang, forceReload]) {
      // No language was requested, so detect the browser language from storage or navigator.
      if (!lang) {
        lang = Storage.getItem(keyNameLang) || navigator.language.slice(0,2)
      }
      // If language isn't already set and there's no outstanding request for this language already
      if (context.state.lang != lang && context.state.langRequested != lang) {
        let cache = storageGetCache(lang)
        if (cache && !forceReload) {
          console.debug('using cached tools')
          context.commit('setLang', [cache, lang, false])
        } else {
          // TODO: When not on a toolbox page, maybe defer this.
          console.debug('fetching fresh tools')
          context.commit('setLangRequested', lang)
          Axios.get(`${config.api}/modules?lang=${lang}`)
            .then(r => {
              context.commit('deleteSearchIndex', lang)
              context.commit('setLang', [r.data, lang, true])
            })
            .catch(e => {
              console.error("Couldn't get API tools!", e)
            })
        }
      }
    },
    // SAVED TOOLS
    TOOL_SAVE_TOGGLE(context, slug) {
      context.commit('setDebug', `${context.state.savedTools.has(slug) ? 'TOOL_UNSAVE' : 'TOOL_SAVE'}: ${slug}`)
      context.dispatch(context.state.savedTools.has(slug) ? 'TOOL_UNSAVE' : 'TOOL_SAVE', slug)
    },
    TOOL_SAVE(context, slug) {
      let tools = new Set([...storageGetSavedTools(), slug])
      context.commit('setSavedTools', tools)
    },
    TOOL_UNSAVE(context, slug) {
      let tools = storageGetSavedTools()
      tools.delete(slug)
      context.commit('setSavedTools', tools)
    },
    // SEARCH
    SEARCH_CLEAR(context) {
      context.commit('setSearch', [])
    },
    SEARCH_INDEX(context) {
      context.commit('setDebug', `Building search index for ${context.state.lang}`)
      context.commit('setSearchIndex', lunr(function() {
        this.ref('slug')
        this.field('title', {boost: 10})
        this.field('byline', {boost: 5})
        this.field('snapshot')
        this.field('short-write-up')
        this.field('full-write-up')
        context.state.tools.forEach(t => this.add(t))
      }))
    },
    SEARCH(context, query) {
      if (!context.state.searchIndices[context.state.lang]) context.dispatch('SEARCH_INDEX')

      // Remove query-breaking dots
      query = query.replace(/\./g, '')

      // Preprocess byline queries "@Joe Schmoe" => "+byline:Joe +byline:Schmoe"
      if (/^@/.test(query)) {
        let words = query.slice(1)
        query = words.split(/\s/).map(word => `+byline:${word}`).join(' ')
      }

      context.commit('setDebug', `Searching: ${query}`)
      context.commit('setSearch',
        context.state.searchIndices[context.state.lang]
          .search(query)
          .map(r => r.ref))
    },
  },
  mutations: {
    // DEBUG
    setDebug(state, s) {
      console.warn(`Debug: ${s}`)
      state.debug = s
    },
    // API TOOLS
    setLang(state, [tools, lang, cacheTools]) {
      Storage.setItem(keyNameLang, lang)
      if (cacheTools) {
        storageSetCache(lang, tools)
      }
      // Preprocess tools into more convenient forms
      state.toolsBySlug = Object.fromEntries(tools.map(t => [t.slug, t]))

      state.tools = tools
      state.lang = lang
      state.langRequested = null
      console.debug(`got tools e.g.`, state.tools[1].title)
    },
    setLangRequested(state, lang) {
      state.langRequested = lang
    },
    // SAVED TOOLS
    setSavedTools(state, tools) {
      state.savedTools = tools
      storageSetSavedTools(tools)
    },
    // SEARCH
    setSearch(state, results) {
      state.searchResults = results
    },
    setSearchIndex(state, index) {
      state.searchIndices[state.lang] = index
    },
    deleteSearchIndex(state, lang) {
      delete state.searchIndices[lang]
    },
  },
})


