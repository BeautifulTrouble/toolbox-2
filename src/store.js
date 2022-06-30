import Storage from 'local-storage-fallback'
import { createStore } from 'vuex'

import lunr from 'lunr'
import lunrStemmer from 'lunr-languages/lunr.stemmer.support'
import lunrAR from 'lunr-languages/lunr.ar'
import lunrES from 'lunr-languages/lunr.es'
import lunrFR from 'lunr-languages/lunr.fr'
import lunrIT from 'lunr-languages/lunr.it'
import lunrPT from 'lunr-languages/lunr.pt'

import config from './config'


// LOCALSTORAGE
const keyNameAPICache = lang => `bt-tools-${lang}`
const keyNameLang = 'bt-lang'
const keyNameSaved = 'bt-saved'
const keyNameVersion = 'bt-version'
// Storage versioning allows us to somewhat gracefully retain saved tools while cleaning up language cache problems
const storageVersion = 1

const storageVersionUpgrade = () => {
  // NOTE: future storage upgrades may require this function be called from somewhere other than the setLang mutator
  if (storageVersion > parseInt(Storage.getItem(keyNameVersion) || '0')) {
    console.debug(`Upgrading localStorage to version ${storageVersion}...`)
    try {
      let oldTools = storageGetSavedTools()
      Storage.clear()
      storageSetSavedTools(oldTools)
    } catch(e) {
      console.debug("Couldn't preserve localStorage from previous version")
      Storage.clear()
    }
    Storage.setItem(keyNameVersion, storageVersion.toString())
  }
}
const storageGetSavedTools = () => {
  return new Set(JSON.parse(Storage.getItem(keyNameSaved) || '[]'))
}
const storageSetSavedTools = tools => {
  Storage.setItem(keyNameSaved, JSON.stringify([...tools.keys()]))
}

const storageSetCache = (lang, data, nestedCall = false) => {
  try {
    Storage.setItem(keyNameAPICache(lang), JSON.stringify({'timestamp': (new Date).getTime(), data: data}))
  } catch(e) {
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


// LUNRJS
lunrStemmer(lunr)
lunrAR(lunr)
lunrES(lunr)
lunrFR(lunr)
lunrIT(lunr)
lunrPT(lunr)
const englishNourmalisation = builder => {
  const englishAmericanisms = {
    'theater': 'theatre',
    'color': 'colour',
    'humor': 'humour',
    'labor': 'labour',
  }
  let pipelineFunction = token => {
    let t = englishAmericanisms[token.toString()]
    return t ? token.update(() => t) : token
  }
  lunr.Pipeline.registerFunction(pipelineFunction, 'englishNourmalisation')
  builder.pipeline.before(lunr.stemmer, pipelineFunction)
  builder.searchPipeline.before(lunr.stemmer, pipelineFunction)
}


export const store = createStore({
  state () {
    return {
      debug: 'Ready.',
      lang: null,
      langRequested: null,
      savedTools: storageGetSavedTools(),
      tools: [],
      toolsBySlug: {},
      searchIndices: {},
      searchResults: [],
    }
  },
  actions: {
    // API TOOLS
    LANG_SET(context, [lang, forceReload]) {
      // No language was requested, so detect the browser language from storage or navigator.
      if (!lang) {
        lang = Storage.getItem(keyNameLang) || navigator.language.slice(0,2)
      }
      // CRITICAL! Reject invalid languages!
      if (!config.langs.includes(lang)) {
        lang = 'en'
      }
      // If language isn't already set and there's no outstanding request for this language already
      if (forceReload || context.state.lang != lang && context.state.langRequested != lang) {
        let cache = storageGetCache(lang)
        if (cache && !forceReload) {
          console.debug('using cached tools')
          context.commit('setLang', [cache, lang, false])
        } else {
          console.debug('fetching fresh tools')
          context.commit('setLangRequested', lang)
          window.fetchJSON(`${config.api}/modules?lang=${lang}`)
            .then(json => {
              // TODO: although this clears the search RESULTS after a lang change, the search FIELD
              //       remains populated, and this could be confusing to a user
              context.dispatch('SEARCH_CLEAR')
              context.commit('deleteSearchIndex', lang)
              context.commit('setLang', [json, lang, true])
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
        try {
          if (context.state.lang == 'en') {
            this.use(englishNourmalisation)
          } else {
            this.use(lunr[context.state.lang])
          }
        } catch(e) { console.debug(e) }
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
      // NOTE: future storage upgrades may require moving this call elsewhere
      storageVersionUpgrade()

      Storage.setItem(keyNameLang, lang)
      if (cacheTools) {
        storageSetCache(lang, tools)
      }
      // Preprocess tools into more convenient forms
      state.toolsBySlug = Object.fromEntries(tools.map(t => [t.slug, t]))

      // Sort such that untranslated tools come last
      tools = tools.sort((a, b) => {
        let compareTranslated = (a, b) => {
          let aT = a['module-type-effective']
          let bT = b['module-type-effective']
          if (aT == 'untranslated' && bT != 'untranslated') return 1
          if (bT == 'untranslated' && aT != 'untranslated') return -1
          return 0
        }
        let compareName = (a, b) => {
          let at = a['title']
          let bt = b['title']
          if (at > bt) return 1
          if (bt < at) return -1
          return 0
        }
        return compareTranslated(a, b) || compareName(a, b)
      })

      // Ensure every snapshot has an image
      tools.forEach(t => {
        let image = t.image || `pattern-${t.type}.jpg`
        t['hero-image'] = `${config.imagePrefix}/hero-${image}`
        t['tile-image'] = `${config.imagePrefix}/tile-${image}`
      })

      state.tools = tools
      state.lang = lang
      state.langRequested = null
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


