import Axios from 'axios'
import Storage from 'local-storage-fallback'
import Vue from 'vue'
import Vuex from 'vuex'

import config from '../bt.config'


// TODO: to help fit more data in localStorage, remove top-level key-modules, document_whatever
const setCache = (lang, data, nestedCall = false) => {
  try {
    Storage.setItem(`bt-content-${lang}`, JSON.stringify({'timestamp': (new Date).getTime(), data: data}))
  } catch(e) {
    if (!nestedCall) { // eslint-disable-next-line
      console.warn('Trying to make room for localStorage cache...')
      config.langs.forEach(lang => Storage.removeItem(`bt-content-${lang}`))
      setCache(lang, data, true)
    }
  }
}
const getCache = (lang) => {
  try {
    let data = JSON.parse(Storage.getItem(`bt-content-${lang}`))
    if (data && data.timestamp && ((new Date).getTime() - data.timestamp < config.cacheLifespan)) {
      return data.data
    }
  } catch(e) { // eslint-disable-next-line
    console.warn('Removing bad localStorage content cache...')
    Storage.removeItem(`bt-content-${lang}`)
  }
}


Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    lang: null,
    langRequested: null,
    content: {},
    wpHTML: '',
  },
  actions: {
    // This action can be used directly to force a content load
    FETCH_CONTENT(context, lang) {
      Axios.get(`${config.api}/modules?lang=${lang}`)
        .then(r => {
          context.commit('setContent', [r.data, lang, true])
        })
        .catch(e => { // eslint-disable-next-line
          console.error("Couldn't get API content!", e)
        })
    },
    // Set language and get (cached) API data
    SET_LANG(context, lang) {
      if (!lang) {
        lang = Storage.getItem('bt-lang') || navigator.language.slice(0,2)
      }
      let cache = getCache(lang)
      if (cache) {
        // eslint-disable-next-line
        console.log('using cached content')
        context.commit('setContent', [cache, lang, false])
      } else if (![context.state.lang, context.state.langRequested].includes(lang)) {
        // If language is already set, or there's an outstanding request, don't FETCH_CONTENT
        context.commit('setLangRequested', lang)
        context.dispatch('FETCH_CONTENT', lang)
      }
    },

    // Get WordPress page
    GET_WP(context, path) {
      let slug =
      Axios.get(`${config.wpapi}/pages?slug=${slug}`)
        .then(r => {
          console.log(r.data)
          context.commit('setWP', r.data.content.rendered)
        })
        .catch(e => { // eslint-disable-next-line
          console.error("WordPress 404", e)
        })
    }
  },
  mutations: {
    setContent(state, [content, lang, cache]) {
      Storage.setItem('bt-lang', lang)
      if (cache) {
        setCache(lang, content)
      }
      state.content = content
      state.lang = lang
      state.langRequested = null

      // eslint-disable-next-line
      console.log(`got content e.g.`, state.content[1].title)
    },
    setLangRequested(state, lang) {
      state.langRequested = lang
    },
    setWP(state, html) {
      state.wpHTML = html
    }

  },
})

