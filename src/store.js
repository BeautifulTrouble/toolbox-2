import Axios from 'axios'
import Storage from 'local-storage-fallback'
import Vue from 'vue'
import Vuex from 'vuex'

import config from '../bt.config'


// LOCALSTORAGE
// IMPORTANT: We need the ability to delete our large localStorage cache, and want to avoid calling
//            localStorage.clear(), so please DON'T RENAME "bt-tools-??" after launch.
const storageKeyCache = lang => `bt-tools-${lang}`
const storageKeyLang = 'bt-lang'
const storageKeySaved = 'bt-saved'

const storageGetSavedTools = () => {
  return new Set(JSON.parse(Storage.getItem(storageKeySaved) || '[]'))
}
const storageSetSavedTools = tools => {
  Storage.setItem(storageKeySaved, JSON.stringify([...tools.keys()]))
}

const storageSetCache = (lang, data, nestedCall = false) => {
  // TODO: to help fit more data under quota, remove top-level key-modules, document_whatever
  try {
    Storage.setItem(storageKeyCache(lang), JSON.stringify({'timestamp': (new Date).getTime(), data: data}))
  } catch(e) {
    console.debug(e)
    if (!nestedCall) {
      console.debug("Trying to make room for localStorage cache...")
      config.langs.forEach(lang => Storage.removeItem(storageKeyCache(lang)))
      storageSetCache(lang, data, true)
    } else {
      console.debug("Couldn't save cache")
    }
  }
}
const storageGetCache = lang => {
  try {
    let data = JSON.parse(Storage.getItem(storageKeyCache(lang)))
    if (data && data.timestamp && ((new Date).getTime() - data.timestamp < config.cacheLifespan)) {
      return data.data
    }
  } catch(e) {
    console.debug("Removing bad localStorage tools cache...")
    Storage.removeItem(storageKeyCache(lang))
  }
}


// VUEX
Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    lang: null,
    langRequested: null,
    savedTools: storageGetSavedTools(),
    tools: [],
    wordPress: '',
    wordPressRequested: false,
  },
  actions: {
    // SET LANGUAGE AND GET [UNEXPIRED CACHE OF] API DATA
    LANG_SET(context, [lang, forceReload]) {
      // No language was requested, so detect the browser language from storage or navigator.
      if (!lang) {
        lang = Storage.getItem(storageKeyLang) || navigator.language.slice(0,2)
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
              context.commit('setLang', [r.data, lang, true])
            })
            .catch(e => {
              console.error("Couldn't get API tools!", e)
            })
        }
      }
    },
    // TOOL SAVING/UNSAVING
    TOOL_TOGGLE(context, slug) {
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
    // GET WORDPRESS CONTENT
    WP_GET(context, {path, query}) {
      // TODO: Reload WordPress content
      // Look for permalink structure to determine if we should use posts or pages endpoint
      let endpoint = /^\/\d{4}\/\d{2}\/\d{2}\//.test(path) ? 'posts' : 'pages'
      // This is a request for a draft preview (query._wpnonce requires support in functions.php)
      if (query.preview_id && query._wpnonce) {
        context.commit('setWordPressRequested')
        Axios.get(`${config.wpapi}/${endpoint}/${query.preview_id}/revisions?per_page=1&_wpnonce=${query._wpnonce}`)
          .then(r => context.commit('setWordPress', r.data[0].content.rendered))
        return
      }
      // Ensure a trailing slash so paths can be manipulated consistently
      path = path.replace(/([^/])$/, '$1/')

      let lastComponent = path.match('/([^/]+)/$')[1]
      if (lastComponent) {
        context.commit('setWordPressRequested')
        Axios.get(`${config.wpapi}/${endpoint}?slug=${lastComponent}/`)
          .then(r => {
            let foundItem = false
            r.data.forEach(i => {
              if (i.link && i.link.endsWith(path)) {
                context.commit('setWordPress', i.content.rendered)
                foundItem = true
              }
            })
            if (!foundItem && path != config.errorPage) {
              context.dispatch('WP_GET', {path: config.errorPage, query: {}})
            }
          })
      }
    },
  },
  mutations: {
    // API TOOLS
    setLang(state, [tools, lang, cache]) {
      Storage.setItem(storageKeyLang, lang)
      if (cache) {
        storageSetCache(lang, tools)
      }
      state.tools = tools
      state.lang = lang
      state.langRequested = null
      console.debug(`got tools e.g.`, state.tools[1].title)
    },
    setLangRequested(state, lang) {
      state.langRequested = lang
    },
    // WORDPRESS CONTENT
    setWordPressRequested(state) {
      state.wordPress = ''
      state.wordPressRequested = true
    },
    setWordPress(state, html) {
      state.wordPressRequested = false
      state.wordPress = html
    },
    // SAVED TOOLS
    setSavedTools(state, tools) {
      state.savedTools = tools
      storageSetSavedTools(tools)
    },
  },
})


