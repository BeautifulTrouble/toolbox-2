import Vue from 'vue'

// TODO: Axios requires promise polyfill for IE11
import Axios from 'axios'
import Router from 'vue-router'
import Showdown from 'showdown'
import ShowdownTargetBlank from 'showdown-target-blank'
import VueLazyload from 'vue-lazyload'
import VueLazyImageLoading from 'vue-lazy-image-loading'
import VueScollTo from 'vue-scrollto'

import App from './App'
import Tool from './Tool'
import Toolbox from './Toolbox'

import { store } from './store'
import config from './config'


// ROUTER
Vue.use(Router)

const router = new Router({
  //mode: 'history',
  base: '/',
  routes: [
    // Legacy redirects
    {path: '/story/:slug',        redirect: {name: 'tool'}},
    {path: '/tactic/:slug',       redirect: {name: 'tool'}},
    {path: '/principle/:slug',    redirect: {name: 'tool'}},
    {path: '/theory/:slug',       redirect: {name: 'tool'}},
    {path: '/methodology/:slug',  redirect: {name: 'tool'}},
    // Tool pages
    {path: '/tool',               redirect: {name: 'toolbox'}},
    {path: '/tool/:slug',         name: 'tool', component: Tool},
    // Toolbox filtering
    {path: '/toolbox/story/:region?/:tag?', name: 'toolbox-story', component: Toolbox},
    {path: '/toolbox/tactic/:tag?',         name: 'toolbox-tactic', component: Toolbox},
    {path: '/toolbox/principle/:tag?',      name: 'toolbox-principle', component: Toolbox},
    {path: '/toolbox/theory/:tag?',         name: 'toolbox-theory', component: Toolbox},
    {path: '/toolbox/methodology/:tag?',    name: 'toolbox-methodology', component: Toolbox},
    {path: '/toolbox/saved',                name: 'toolbox-saved', component: Toolbox},
    {path: '/toolbox/search/:query',        name: 'toolbox-search', component: Toolbox},
    {path: '/toolbox/set/:set?',            name: 'toolbox-set', component: Toolbox},
    {path: '/toolbox/:tag?',                name: 'toolbox', component: Toolbox},
    {path: '/toolbox/*',                    redirect: {name: 'toolbox'}},
    // Catch-all
    {path: '/*',                  redirect: {name: 'toolbox'}},
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise(
        resolve => setTimeout(() => resolve({selector: to.hash}), 250)
      )
    }
    // TODO: https://forum.vuejs.org/t/vue-router-page-position-when-navigating-pages/32885/4
    return savedPosition ? savedPosition : {x: 0, y: 0}
  },
})

const languageSelectionPrefix = new RegExp(`^/(${config.langs.join("|")})(/|$)`)
router.beforeEach((to, from, next) => {
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
    // TODO
    console.log('A')
    let lang = to.path.slice(1,3)
    store.dispatch('LANG_SET', [lang, false])
    next({path: to.path.slice(3)})
  } else if (!store.state.lang) {
    console.log('B')
    store.dispatch('LANG_SET', [null, false])
    next()
  } else {
    console.log('C')
    next()
  }
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

// TODO: Use IE shim for Intersection Observer API
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

Vue.mixin({
  data: () => ({
    config,
  }),
  methods: {
    capitalize([first, ...rest], locale = navigator.language) {
      return [first.toLocaleUpperCase(locale), ...rest].join('')
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



// START VUE
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#page')
/*
document.addEventListener("DOMContentLoaded", () => {
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#page')
})
*/
