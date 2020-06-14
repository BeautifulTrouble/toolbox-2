<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <nav>
      <div class="upper">
        <div v-if="btData.menuData" class="links">
          <router-link v-for="(item, i) in btData.menuData[1]"
            :to="getPath(item.url)" :key="i" exact>{{ item.title }}</router-link>
        </div>
        <div class="langs">
          <span v-for="lang in config.langs" :key="lang"
            :class="{'router-link-active': lang == $store.state.lang}"
            @click="$store.dispatch('LANG_SET', [lang, false])">{{ lang.toUpperCase() }}</span>
        </div>
      </div>
      <div class="lower">
        <router-link to="/">
          <img src="./assets/logo-header.png">
        </router-link>
        <div v-if="btData.menuData" class="links">
          <router-link v-for="(item, i) in btData.menuData[0]"
            :to="getPath(item.url)" :key="i" exact>{{ item.title }}</router-link>
        </div>
      </div>
    </nav>
    <div style="position: fixed; padding: 1rem; z-index: 100; background: white; bottom: 0; right: 0;">
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
    <div v-if="$store.state.langRequested">Loading...</div>
  </div>
</template>

<script>
import config from '../bt.config'

export default {
  data: () => ({
    btData: window.btData,
    config: config,
  }),
  methods: {
    getPath(url) {
      return (new URL(url)).pathname
    },
  },
};
</script>

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
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  opacity: .9;

  .upper {
    background: black;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: .5rem .5rem;
    a {
      padding: 0 .75rem;
      text-decoration: none;
      color: white;
      &:hover {
        text-decoration: underline;
      }
    }
    .links a {
      border-left: 1px solid white;
      &:first-of-type {
        border-left: none;
      }
      .rtl & {
        border-left: none;
        border-right: 1px solid white;
        &:first-of-type {
          border-right: none;
        }
      }
    }
    .langs {
      cursor: pointer;
      span {
        padding: 0 .3rem;
        color: white;
        &:hover {
          text-decoration: underline;
        }
        &.router-link-active {
          text-decoration: underline;
        }
      }
    }
  }
  .lower {
    background-image: url('assets/gradient.jpg');
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
