import Axios from 'axios'
import Storage from 'local-storage-fallback'
import Vue from 'vue'
import Vuex from 'vuex'

import config from '../bt.config'


// TODO: to help fit more data in localStorage, remove top-level key-whatever, document_whatever
const cachePrefix = 'bt-content'

const setCache = (key, value, nestedCall = false) => {
  try {
    Storage.setItem(key, JSON.stringify({'timestamp': (new Date).getTime(), data: value}))
  } catch(e) {
    if (!nestedCall) { // eslint-disable-next-line
      console.warn('Trying to make room for localStorage cache...')
      config.langs.forEach(lang => Storage.removeItem(`${cachePrefix}-${lang}`))
      setCache(key, value, true)
    }
  }
}

const getCache = (key) => {
  try {
    let value = JSON.parse(Storage.getItem(key))
    if (value && value.timestamp && ((new Date).getTime() - value.timestamp < config.cacheLifespan)) {
      return value.data
    }
  } catch(e) { // eslint-disable-next-line
    console.warn('Removing bad localStorage cache...')
    Storage.removeItem(key)
  }
}


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    lang: null,
    langRequested: null,
    content: {},
  },
  actions: {
    // This action can be used directly to force a content load
    FETCH_CONTENT(context, payload) {
      let lang = payload
      Axios.get(`${config.api}/modules?lang=${payload}`)
        .then(r => {
          context.commit('setContent', [r.data, lang])
        })
        .catch(e => { // eslint-disable-next-line
          console.error("Couldn't get API content!", e)
        })
    },
    // Set language and get (cached) API data
    SET_LANG(context, payload) {
      let lang = payload
      let cache = getCache(`${cachePrefix}-${lang}`)
      if (cache) {
        // eslint-disable-next-line
        console.log('using cached content')
        context.commit('setContent', [cache, lang])
      } else if (![context.state.lang, context.state.langRequested].includes(lang)) {
        // If language is already set, or there's an outstanding request, don't FETCH_CONTENT
        context.commit('setLangRequested', lang)
        context.dispatch('FETCH_CONTENT', lang)
      }
    },
  },
  mutations: {
    setContent(state, payload) {
      let [content, lang] = payload
      state.content = content
      state.lang = lang
      state.langRequested = null
      setCache(`${cachePrefix}-${lang}`, content)

      // eslint-disable-next-line
      console.log(`got content e.g.`, state.content[1].title)
    },
    setLangRequested(state, payload) {
      state.langRequested = payload
    },
  },
})

