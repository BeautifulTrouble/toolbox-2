import Vue from 'vue'

// TODO: Axios requires promise polyfill for IE11
import Axios from 'axios'
import Router from 'vue-router'
import Showdown from 'showdown'
import ShowdownTargetBlank from 'showdown-target-blank'

import App from './App'
import Home from './views/Home'
import WordPress from './WordPress'

import store from './store'
import config from '../bt.config'


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

const languageUrlPrefix = new RegExp(`^/(${config.langs.join("|")})/`)
router.beforeEach((to, from, next) => {
  // Capture language-specific urls and set the site language
  if (languageUrlPrefix.test(to.path)) {
    store.dispatch('SET_LANG', to.path.slice(1,3))
    next({path: to.path.slice(3)})
  } else {
    next()
  }
})


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


new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

