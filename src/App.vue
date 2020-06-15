<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <nav>
      <div class="upper">
        <div v-if="btData.menuData" class="links">
          <router-link v-for="(item, i) in btData.menuData[1]"
            :to="getMenuPath(item.url)" :key="i" exact>{{ item.title }}</router-link>
        </div>
        <div class="langs">
          <span v-for="lang in config.langs" :key="lang"
            :class="{'router-link-active': lang == $store.state.lang}"
            @click="$store.dispatch('LANG_SET', [lang, false])">{{ lang.toUpperCase() }}</span>
        </div>
      </div>
      <div class="lower">
        <div class="links">
          <router-link to="/"><img src="./assets/logo-header.png"></router-link>
          <div v-if="btData.menuData">
            <router-link v-for="(item, i) in btData.menuData[0]" class="link"
              :to="getMenuPath(item.url)" :key="i" exact>{{ item.title }}</router-link>
          </div>
        </div>
        <div class="resources">
          foo
        </div>
      </div>
    </nav>
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
    <div v-if="$store.state.langRequested">Loading...</div>
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
    <footer>
        // TODO: remove #nav
    </footer>
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
    getMenuPath(url) {
      return url.startsWith('/') ? url : (new URL(url)).pathname
    },
  },
};
</script>

<style lang="scss">
@import 'common.scss';

nav {
  position: fixed;
  top: 0; left: 0;
  right: 0;
  z-index: $ztop;
  .upper {
    height: $uppermenu;
    background: black;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: .7rem .5rem;
    a {
      padding: 0 .75rem;
      text-decoration: none;
      color: white;
      &:hover {
        text-decoration: underline;
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
    height: $lowermenu;
    background-image: url('assets/gradient.jpg');
    background-size: contain;
    padding: 1rem 2rem;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    &::after {
      z-index: 0; // Place a transparent white rectangle below the menu items
      top: 0; bottom: 0;
      left: 0; right: 0;
      background: rgba(255,255,255,.1);
      content: "";
      position: absolute;
    }
    .links {
      z-index: 1;
      position: relative;
      display: flex;
      align-items: center;
      a.link {
        padding: 0 1rem;
        text-decoration: none;
        text-transform: uppercase;
        font-size: 1.75rem;
        font-weight: 300;
        color: white;
        &.router-link-active {
          color: $dark;
        }
      }
    }
    .resources {
      z-index: 1;
      position: relative;

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
}
footer {
  height: 20rem;
  background-image: url('assets/gradient.jpg');
  background-size: contain;
}
</style>
