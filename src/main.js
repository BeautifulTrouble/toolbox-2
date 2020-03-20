import Vue from 'vue'

import Router from 'vue-router'
import Showdown from 'showdown'
import ShowdownTargetBlank from 'showdown-target-blank'

import App from './App.vue'
import Home from './views/Home.vue';


const showdown = new Showdown.Converter({
  extensions: [ShowdownTargetBlank]
})


const router = new Router({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
})


Vue.config.productionTip = false


Vue.use(Router)


Vue.mixin({
  methods: {
    markdown(string) {
      return showdown.makeHtml(string)
    },
  },
})


new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

