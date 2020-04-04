import Axios from 'axios'
import Storage from 'local-storage-fallback'
import Vue from 'vue'
import Vuex from 'vuex'

import config from '../bt.config'


// TODO: to help fit more data in localStorage, remove top-level key-modules, document_whatever
const setCache = (lang, data, nestedCall = false) => {
  let name = `bt-content-${lang}`
  try {
    Storage.setItem(name, JSON.stringify({'timestamp': (new Date).getTime(), data: data}))
  } catch(e) {
    if (!nestedCall) { // eslint-disable-next-line
      console.warn("Trying to make room for localStorage cache...")
      config.langs.forEach(lang => Storage.removeItem(name))
      setCache(lang, data, true)
    } else { // eslint-disable-next-line
      console.warn("Couldn't save cache")
    }
  }
}
const getCache = (lang) => {
  try {
    let name = `bt-content-${lang}`
    let data = JSON.parse(Storage.getItem(name))
    if (data && data.timestamp && ((new Date).getTime() - data.timestamp < config.cacheLifespan)) {
      return data.data
    }
  } catch(e) { // eslint-disable-next-line
    console.warn("Removing bad localStorage content cache...")
    Storage.removeItem(name)
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
    // Set language and get (cached) API data
    SET_LANG(context, [lang, reload]) {
      // No language was requested, so detect the browser language from storage or navigator.
      if (!lang) {
        lang = Storage.getItem('bt-lang') || navigator.language.slice(0,2)
      }
      // If language isn't already set and there's no outstanding request for this language already
      if (![context.state.lang, context.state.langRequested].includes(lang)) {
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

