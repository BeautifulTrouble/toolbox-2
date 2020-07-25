<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <nav ref="nav">
      <div class="upper">
        <div v-if="btData.menuData" class="links">
          <router-link v-for="(item, i) in btData.menuData[1]" class="link"
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
          <router-link to="/"><img src="./assets/logo-round.png" class="logo logo-small"></router-link>
          <router-link to="/"><img src="./assets/logo-small.png" class="logo logo-large"></router-link>
          <div v-if="btData.menuData">
            <router-link v-for="(item, i) in btData.menuData[0]" class="link"
              :to="getMenuPath(item.url)" :key="i">{{ item.title }}</router-link>
          </div>
        </div>
        <div class="resources">
          <router-link to="/toolbox/saved" class="saved">
            <span>MY TOOLS</span>
            <img svg-inline class="icon favorite" src="./assets/favorite-active.svg">
            <span v-if="$store.state.savedTools.size" class="count">{{ $store.state.savedTools.size }}</span>
          </router-link>
          <img svg-inline @click="showSearch = !showSearch" class="icon search" src="./assets/search.svg">
        </div>
      </div>
      <div v-show="showSearch" class="search-bar">
        <input type="text">SEARCH........
      </div>
    </nav>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
    <div v-if="$store.state.langRequested">Loading...</div>


    <!-- TODO: -->
    <div class="debug-panel">
      <p class="debug">{{ $store.state.debug }}</p>
      <div @click="debugPanel.reset">Reset Settings</div>
      <div @click="debugPanel.clutter = !debugPanel.clutter">Toggle testing clutter</div>
    </div>
    <div id="nav" v-if="debugPanel.clutter">
      BETA LINK TESTING:
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
      <div class="upper">
        <div class="contain">
          <div v-if="btData.menuData" class="links">
            <router-link v-for="(item, i) in btData.menuData[2]" class="link"
              :to="getMenuPath(item.url)" :key="i" exact>{{ item.title }}</router-link>
          </div>
          <div class="social">
            <span>FOLLOW BEAUTIFUL TROUBLE</span>
            <a :href="config.socialInstagram" target="_blank" rel="external">
              <img svg-inline class="icon" src="./assets/instagram.svg">
            </a>
            <a :href="config.socialFacebook" target="_blank" rel="external">
              <img svg-inline class="icon" src="./assets/facebook.svg">
            </a>
            <a :href="config.socialTwitter" target="_blank" rel="external">
              <img svg-inline class="icon" src="./assets/twitter.svg">
            </a>
          </div>
        </div>
      </div>
      <div class="lower">
        <div class="contain">
          <div class="a">
            <router-link to="/">
              <img class="logo" src="./assets/logo-large.png">
            </router-link>
            <span>BeautifulTrouble.org {{ new Date().getFullYear() }}</span>
            <span>Webdesign by <a href="https://rabotnik.coop" target="_blank">Rabotnik.coop</a></span>
          </div>
          <div class="b">
            <a :href="config.trainingForm" target="_blank" class="button">REQUEST A TRAINING</a>
            <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank">
              <img alt="Creative Commons License" src="./assets/cc-by-nc-sa.png">
            </a>
            <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank">
              BeautifulTrouble.org by Beautiful Trouble is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
            </a>
          </div>
          <div class="c">
            <h3>JOIN THE COMMUNITY</h3>
            <span>Provide your e-mail to receive the latest updates.</span>
            <span>We promise not to sell your info!</span>
            <form action="https://beautifultrouble.us7.list-manage.com/subscribe/post?u=2aa3b5c34f535e74090f9098d&amp;id=4a7c9e1689" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate="">
              <input type="email" value="" name="EMAIL" id="mce-EMAIL" placeholder="EMAIL ADDRESS" required>
              <input type="submit" value="OK" name="subscribe" id="mc-embedded-subscribe">
            </form>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import Headroom from 'headroom.js'
import config from './config'

export default {
  data: () => ({
    btData: window.btData,
    config: config,
    showSearch: false,
    debugPanel: {
      clutter: false,
      reset: () => [localStorage.clear(), window.location.reload()] ,
    }
  }),
  methods: {
    getMenuPath(url) {
      return url.startsWith('/') ? url : (new URL(url)).pathname
    },
  },
  mounted() {
    let headroom = new Headroom(this.$refs.nav, {
      offset: 100,
      tolerance: 10,
    })
    headroom.init()
  },
};
</script>

<style lang="scss">
@import 'common.scss';

.debug-panel {
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 100;
  padding: .5rem;
  background: yellow;
  border: 6px dashed black;
  color: black;
  font-size: .75rem;
  font-family: monospace;
  .expand {
    display: block;
    font-size: 2rem;
    padding: 0 .5rem;
  }
  .debug {
    margin: 0;
  }
  &:hover {
    .expand, .debug {
      display: none;
    }
    >div {
      display: block;
    }
  }
  >div {
    display: none;
    cursor: pointer;
    padding: .5rem 1rem;
    border: 1px dashed orange;
    &:hover {
      color: yellow;
      background: black;
    }
  }
}

nav {
  user-select: none;
  position: fixed;
  top: 0; left: 0;
  right: 0;
  z-index: $ztop;
  .upper {
    transition: all .1s linear;

    height: $uppermenu;
    background: black;
    display: flex;
    position: relative;
    flex-direction: row;
    justify-content: space-between;
    padding: .7rem .5rem;
    > div {
      transition: opacity .2s linear;
    }
    a {
      padding: 0 .75rem;
      text-decoration: none;
      color: white;
      //white-space: nowrap;
      &:hover {
        text-decoration: underline;
      }
    }
    .langs {
      cursor: pointer;
      span {
        padding: 0 .5rem;
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
    transition: all .1s linear;

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
    a {
      color: white;
      text-decoration: none;
    }
    img.logo {
      transition: opacity .1s linear;
    }
    img.logo-small {
      opacity: 0;
      position: absolute;
      top: 1rem;
      width: 4rem;
    }
    .links {
      z-index: 1;
      position: relative;
      display: flex;
      align-items: center;
      a.link {
        padding: 0 1rem;
        text-transform: uppercase;
        font-size: 1.75rem;
        font-weight: 300;
        color: white;
        &:hover, &.router-link-active {
          color: black;
        }
      }
    }
    .resources {
      z-index: 1;
      display: flex;
      align-items: center;
      color: white;
      a:hover {
        text-decoration: underline;
      }
      .saved {
        position: relative;
        display: flex;
        align-items: center;
      }
      .icon {
        max-width: 3rem;
        padding: .5rem;
        fill: white;
      }
      .count {
        top: 25%; right: 0;
        position: absolute;
        background: black;
        padding: .1rem .25rem;
        font-weight: normal;
      }
      .search {
        cursor: pointer;
      }
    }
  }
  &.headroom--unpinned:not(:hover) { // TODO: test that this selector actually works
    .upper {
      height: .5rem;
    }
    .upper > div {
      opacity: 0;
    }
    .lower {
      height: $uppermenu * 1.5;
    }
    img.logo-large {
      opacity: 0;
    }
    img.logo-small {
      opacity: 1;
    }

  }
  .search-bar {
    background-image: url('assets/gradient.jpg');
    background-size: contain;
    width: 100%;
    background-color: red;
  }
}
nav, footer {
  .links a.link {
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
  background-image: url('assets/gradient.jpg');
  background-size: contain;
  color: white;
  padding-bottom: 1rem;
  a {
    color: white !important;
    text-decoration: none;
  }
  .contain { // Center the width-limited area
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
  }
  .upper {
    height: $uppermenu * 1.5;
    display: flex;
    justify-content: center;
    a {
      padding: 0 .75rem;
      text-decoration: none;
      color: white;
      &:hover {
        text-decoration: underline;
      }
    }
    span {
      margin: 1rem;
    }
    .social {
      display: flex;
      align-items: center;
      svg {
        margin: -.5rem;
        fill: white;
        max-width: 2rem;
      }
    }
  }
  .lower {
    background-color: rgba(255,255,255,.2);
    display: flex;
    justify-content: center;
    font-size: .8rem;
    h3 {
      margin: 0 0 .5rem 0;
    }
    .contain {
      flex-wrap: wrap;
    }
    .logo {
      max-width: 90%;
      align-self: flex-start;
      margin-bottom: 1rem;
    }
    .a, .b, .c {
      display: flex;
      flex-direction: column;
      margin: 1rem;
    }
    .a {
      flex: 3 0 0;
    }
    .b {
      flex: 5 0 0;
      a {
        max-width: 15rem;
      }
    }
    .c {
      flex: 4 0 0;
    }
  }
}
</style>
