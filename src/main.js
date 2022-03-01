import Vue from 'vue'

import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'
import Axios from 'axios'
import Router from 'vue-router'
import Showdown from 'showdown'
import ShowdownTargetBlank from 'showdown-target-blank'
import BackToTop from 'vue-backtotop'
import VueLazyload from 'vue-lazyload'
import VueLazyImageLoading from 'vue-lazy-image-loading'
import VueMeta from 'vue-meta'
import VueScollTo from 'vue-scrollto'

import App from './App'
import All from './All'
import Tool from './Tool'
import Toolbox from './Toolbox'

import config from './config'
import { store } from './store'
import textByLang from './text'


// ROUTER
Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: '/toolbox/',
  routes: [
    {path: '/tool',         redirect: {name: 'toolbox'}},
    {path: '/tool/:slug',   name: 'tool', component: Tool},
    {path: '/all',          name: 'toolbox-all', component: All},
    // Match only the valid collections, and everything else will fall through
    {path: '/:collection(story|tactic|principle|theory|methodology|saved|set)?',
                            name: 'toolbox', component: Toolbox},
    {path: '/*',            redirect: {name: 'toolbox'}},

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
    return savedPosition ? savedPosition : {x: 0, y: 0}
  },
})

const languageSelectionPrefix = new RegExp('^/[^/]{2}(/|$)')
router.beforeEach((to, from, next) => {
  // NAVIGATION GUARD TO PRESERVE OLD FRAGMENT URLS
  if (to.hash) {
    next({path: to.hash.slice(1)})
  }

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

  if (languageSelectionPrefix.test(to.path)) {
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


// EXTEND VUE
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

Vue.config.productionTip = false
Vue.prototype.$http = Axios

// This lazy-loader loads images on scroll (v-lazy directive)
Vue.use(VueLazyload, {
  observer: true,
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1,
  },
})
// This lazy-loader only provides placeholders and image loading transitions (lazy-* components)
Vue.use(VueLazyImageLoading, {
  cache: true, // Don't animate already-loaded images
})

// Smooth scroll to element
Vue.use(VueScollTo)

// Scroll to top button
Vue.use(BackToTop)

Vue.mixin({
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

// autocomplete-vue
Vue.use(Autocomplete)

// VueMeta
Vue.use(VueMeta)


// START VUE
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount(config.mountPoint)
