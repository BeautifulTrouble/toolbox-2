import Vue from 'vue'

// TODO: Axios requires promise polyfill for IE11
import Axios from 'axios'
import Router from 'vue-router'
import Showdown from 'showdown'
import ShowdownTargetBlank from 'showdown-target-blank'

import App from './App'
import Home from './views/Home'
import WordPress from './WordPress'

import { store } from './store'
import config from '../bt.config'


// ROUTER
Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: '/',
  routes: [
    {path: '/', name: 'home', component: Home},
    {path: '/about', name: 'about', component: () => import(/* webpackChunkName: "about" */ './views/About.vue')},
    {path: '/tool/:slug', name: 'tool', component: Home},
    {path: '/*', name: 'wordpress', component: WordPress},
  ],
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
    let lang = to.path.slice(1,3)
    store.dispatch('SET_LANG', [lang, false])
    next({path: to.path.slice(3)})
  } else if (!store.state.lang) {
    store.dispatch('SET_LANG', [null, false])
    next()
  } else {
    next()
  }
})


// EXTEND VUE
const showdown = new Showdown.Converter({
  extensions: [ShowdownTargetBlank],
})

Vue.prototype.$http = Axios

Vue.mixin({
  methods: {
    renderMarkdown(string) {
      return showdown.makeHtml(string)
    },
  },
})


// START VUE
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

