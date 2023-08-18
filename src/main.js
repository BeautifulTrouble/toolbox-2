/* eslint-disable */
import { createApp, h } from 'vue'

import { createRouter, createWebHistory } from 'vue-router'
import Showdown from 'showdown'
import ShowdownTargetBlank from 'showdown-target-blank'
import BackToTop from 'vue-backtotop'
import VueLazyload from 'vue3-lazyload'
import VueScollTo from 'vue-scrollto'

import App from './App'
import AllTools from './AllTools'
import ToolPage from './ToolPage'
import ToolboxPage from './ToolboxPage'

import config from './config'
import { store } from './store'
import textByLang from './text'

window.fetchJSON = (url) => {
  return fetch(url, {headers: {"Content-Type": "application/json"}, method: 'GET'})
  .then(async r => {
    if (!r.ok) {
      r.data = await r.json()
      throw new Error(r.statusText)
    }
    return r
  })
  .then(r => r.json())
}

const app = createApp({
  render: () => h(App)
})

const router = createRouter({
  history: createWebHistory('/toolbox/'),
  routes: [
    // Tool pages
    {path: '/:lang([a-z]{2})/tool/:slug',     name: 'tool-langswitch', component: ToolPage},
    {path: '/tool/:slug',     name: 'tool', component: ToolPage},
    {path: '/tool',           redirect: {name: 'toolbox'}},
    // Internal use
    {path: '/all',            name: 'toolbox-all', component: AllTools},
    // Match only the valid collections, and everything else will fall through
    {path: '/:lang([a-z]{2})/:collection(story|tactic|principle|theory|methodology|saved|set)?', name: 'toolbox-langswitch', component: ToolboxPage},
    {path: '/:collection(story|tactic|principle|theory|methodology|saved|set)?', name: 'toolbox', component: ToolboxPage},
    // Catch-all
    {path: '/:pathMatch(.*)', redirect: {name: 'toolbox'}},


    /* Routes to be merged
    {path: '/story',        name: 'toolbox-story', component: Toolbox},
    {path: '/tactic',       name: 'toolbox-tactic', component: Toolbox},
    {path: '/principle',    name: 'toolbox-principle', component: Toolbox},
    {path: '/theory',       name: 'toolbox-theory', component: Toolbox},
    {path: '/methodology',  name: 'toolbox-methodology', component: Toolbox},
    {path: '/saved',        name: 'toolbox-saved', component: Toolbox},
    {path: '/set',          name: 'toolbox-set', component: Toolbox},
    */

    //{path: '/search/:query?',       name: 'toolbox-search', component: Toolbox},
    //{path: '/:query?',      name: 'toolbox', component: Toolbox},
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise(
        resolve => setTimeout(() => resolve({selector: to.hash}), 250)
      )
    }
    // TODO: https://forum.vuejs.org/t/vue-router-page-position-when-navigating-pages/32885/4
    if (to.name == 'toolbox' && from.name == 'toolbox') return
    return savedPosition ? savedPosition : {left: 0, top: 0}
  },
})
app.use(router)

const languageSelectionPrefix = new RegExp('^/[^/]{2}(/|$)')
router.beforeEach((to, from, next) => {
  // NAVIGATION GUARD TO PRESERVE OLD FRAGMENT URLS
  if (to.hash) {
    next({path: to.hash.slice(1)})
  }

  // TODO 2022: REVISIT THIS RATIONALE NOW THAT WE ARE USING SIMPLER ROUTES AND PUSHSTATE
  // NAVIGATION GUARD TO SELECT A LANGUAGE FOR THE USER
  //
  // Capture language prefixes like /en and /ar/tool/civil-disobedience, remove them, and set the
  // site language.
  //
  // While we're at it, set a language if one isn't already set. You might think such logic goes
  // somewhere more general, like site initialization in a lifecycle hook of the App component. I'd
  // agree with that, but getting the language detection heuristic right is tricky, and easier to
  // reason about when it's all in one place.
  //
  // Why not a route like... `/:lang(${config.langs.join("|")})/`... I couldn't find a way to match
  // arbitrary paths against a prefix without a lot of extra boilerplate (extra paths and aliases).


  console.log(to, to.redirectedFrom)
  if (to && languageSelectionPrefix.test(to.path)) {
    console.log('lang detected')
    let lang = to.path.slice(1,3)
    store.dispatch('LANG_SET', [lang, false])
    next({path: to.path.slice(3)})
  } else if (!store.state.lang) {
    store.dispatch('LANG_SET', [null, false])
    next()
  } else {
    next()
  }
})

// Ensure Google Analytics' global ga exists
window.ga = window.ga || (() => null)
router.afterEach((to) => {
  // Containing site will do this already
  if (to.path == '/') return
  window.ga('set', 'page', `${config.linkPrefix}${to.path}`)
  window.ga('send', 'pageview')
})



const showdown = new Showdown.Converter({
  noHeaderId: true,
  simpleLineBreaks: true,
  strikethrough: true,
  extensions: [
    ShowdownTargetBlank,
    { // Replace inline images with prefixed urls
      type: 'lang',
      regex: /!\[(.*)\]\((.+)\.(png|jpg|gif|svg)\)/gi,
      replace: `![$1](${config.imagePrefix}/medium-$2.$3)`,
    },
    { // Replace single newlines (these occur in a lot of "originally published in..." pieces
      type: 'lang',
      regex: /([^\n])\n([^\n])/gm,
      replace: '$1\n\n$2',
    }
  ],
})

app.mixin({
  data: () => ({
    config,
    textByLang,
  }),
  computed: {
    text() {
      return this.textByLang[this.$store.state.lang] || {}
    },
  },
  methods: {
    downloadPDF(tools) {
      tools = typeof(tools) == "string" ? [tools] : tools
      this.openTab(`${config.pdf}/download?tools=${[...tools].join(',')}&lang=${this.$store.state.lang}`)
    },
    markdown(string) {
      // TODO: Ensure newlines get transformed into line breaks
      // Regex from https://github.com/showdownjs/showdown/issues/206
      //string = string.replace(/^[\w'<][^\n]*\n+/gm, s => s.match(/\n{2}/) ? s : s.trim() + "\n\n")
      return showdown.makeHtml(string)
    },
    openTab(url) {
      window.open(url, '_blank')
    },
    slugify(string) {
      return string.toLowerCase().replace(/\s/ig, '-').replace(/[^-\w]/ig, '');
    },
  },
})

// This lazy-loader loads images on scroll (v-lazy directive)
app.use(VueLazyload, {
  observer: true,
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1,
  },
})

// Smooth scroll to element
app.use(VueScollTo)

// Scroll to top button
app.use(BackToTop)

//app.use(Autocomplete)

app.use(store)

app.mount('#page')
