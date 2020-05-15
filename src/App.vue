<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <div style="position: fixed; padding: 1rem; z-index: 100; background: white; top: 0; right: 0;">
      <span v-for="lang in ['en', 'es', 'ar', 'pt']" :key="lang"
        :style="{fontWeight: lang == $store.state.lang ? 'bold' : 'normal'}"
        @click="$store.dispatch('LANG_SET', [lang, false])">{{ lang }} &nbsp;</span>
    </div>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/en/about">En About</router-link> |
      <router-link to="/es/about">Sp About</router-link> |
      <router-link to="/ar/about">Ar About</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/privacy-policy">pp</router-link> |
      <router-link to="/privacy-policy/another">pp another</router-link> |
      <router-link to="/top">top</router-link> |
      <router-link to="/top/">top/</router-link> |
      <router-link to="/top/another">top another</router-link> |
      <router-link to="/does/not/exist">404</router-link> |
      <router-link to="/tool/action-logic">tool (real)</router-link> |
      <router-link to="/tool/not-real">tool (fake)</router-link> |
      <router-link to="/toolbox">toolbox</router-link>
    </div>
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
    <!--
    <router-view/>
    -->
    <div v-if="$store.state.langRequested">
      Loading...</div>
  </div>
</template>

<style lang="scss">
@import 'common.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //color: #2c3e50;
  &.rtl {
    direction: rtl;
  }
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
