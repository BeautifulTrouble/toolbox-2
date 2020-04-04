import Axios from 'axios'
import Storage from 'local-storage-fallback'
import Vue from 'vue'
import Vuex from 'vuex'

import config from '../bt.config'


const storedCacheKey = lang => `bt-content-${lang}`
const storedLangKey = 'bt-lang'

// TODO: to help fit more data in localStorage, remove top-level key-modules, document_whatever
const setCache = (lang, data, nestedCall = false) => {
  try {
    Storage.setItem(storedCacheKey(lang), JSON.stringify({'timestamp': (new Date).getTime(), data: data}))
  } catch(e) {
    console.log(e)
    if (!nestedCall) { // eslint-disable-next-line
      console.warn("Trying to make room for localStorage cache...")
      config.langs.forEach(lang => Storage.removeItem(storedCacheKey(lang)))
      setCache(lang, data, true)
    } else { // eslint-disable-next-line
      console.warn("Couldn't save cache")
    }
  }
}
const getCache = (lang) => {
  try {
    let data = JSON.parse(Storage.getItem(storedCacheKey(lang)))
    if (data && data.timestamp && ((new Date).getTime() - data.timestamp < config.cacheLifespan)) {
      return data.data
    }
  } catch(e) { // eslint-disable-next-line
    console.warn("Removing bad localStorage content cache...")
    Storage.removeItem(storedCacheKey(lang))
  }
}


Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    lang: null,
    langRequested: null,
    content: {},
    wordPress: '',
    wordPressRequested: true,
  },
  actions: {
    // SET LANGUAGE AND GET [UNEXPIRED CACHE OF] API DATA
    SET_LANG(context, [lang, reload]) {
      // No language was requested, so detect the browser language from storage or navigator.
      if (!lang) {
        lang = Storage.getItem(storedLangKey) || navigator.language.slice(0,2)
      }
      // If language isn't already set and there's no outstanding request for this language already
      if (context.state.lang != lang && context.state.langRequested != lang) {
        let cache = getCache(lang)
        if (cache && !reload) {
          console.log('using cached content')
          context.commit('setContent', [cache, lang, false])
        } else {
          console.log('fetching fresh content')
          context.commit('setLangRequested', lang)
          Axios.get(`${config.api}/modules?lang=${lang}`)
            .then(r => {
              context.commit('setContent', [r.data, lang, true])
            })
            .catch(e => {
              console.error("Couldn't get API content!", e)
            })
        }
      }
    },

    // GET WORDPRESS CONTENT
    GET_WP(context, { path, query }) {
      if (query.preview_id && query._wpnonce) {
        // A page preview has been requested
        context.commit('setWordPressRequested')
        Axios.get(`${config.wpapi}/pages/${query.preview_id}/revisions?per_page=1&_wpnonce=${query._wpnonce}`)
          .then(r => {
            console.log('...', r)
            context.commit('setWordPress', r.data[0].content.rendered)
          })
      } else {
        // Ensure a trailing slash so paths can be manipulated consistently
        path = path.replace(/([^/])$/, '$1/')
        let lastComponent = path.match('/([^/]+)/$')[1]
        if (lastComponent) {
          context.commit('setWordPressRequested')
          Axios.get(`${config.wpapi}/pages?slug=${lastComponent}/`)
            .then(r => {
              let pages = r.data
              let foundPage = false
              if (pages.length) {
                pages.forEach(p => {
                  if (p.link && p.link.endsWith(path)) {
                    // XXX: ensure there are no corner cases with overlapping link endings
                    context.commit('setWordPress', p.content.rendered)
                    foundPage = true
                  }
                })
              }
              if (!foundPage && path != config.errorPage) {
                context.dispatch('GET_WP', {path: config.errorPage, query: {}})
              }
            })
            .catch(e => { // eslint-disable-next-line
              console.error("WordPress API Unavailable", e)
            })
        }
      }
    }
  },
  mutations: {
    // STORE API CONTENT
    setContent(state, [content, lang, cache]) {
      Storage.setItem(storedLangKey, lang)
      if (cache) {
        setCache(lang, content)
      }
      state.content = content
      state.lang = lang
      state.langRequested = null

      console.log(`got content e.g.`, state.content[1].title)
    },
    setLangRequested(state, lang) {
      state.langRequested = lang
    },
    // STORE WORDPRESS CONTENT
    setWordPressRequested(state) {
      state.wordPress = ''
      state.wordPressRequested = true
    },
    setWordPress(state, html) {
      state.wordPressRequested = false
      state.wordPress = html
    }
  },
})

