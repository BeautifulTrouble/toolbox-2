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
        <div class="lookup">
          <router-link to="/toolbox/saved" :class="{saved: true, moved: showSearch}">
            <span>MY TOOLS</span>
            <img svg-inline class="icon favorite" src="./assets/favorite-active.svg">
            <span v-if="$store.state.savedTools.size" class="count">{{ $store.state.savedTools.size }}</span>
          </router-link>
          <transition name="fade">
            <search v-show="showSearch" ref="search" />
          </transition>
          <img svg-inline @click="toggleSearch" class="icon" src="./assets/search.svg">
        </div>
      </div>
    </nav>
    <transition name="fade" mode="out-in">
      <router-view :class="{debugDarkPopups: debugPanel.darkPopups}"/>
    </transition>
    <!-- TODO: Use CSS-based rectangles -->
    <div v-if="$store.state.langRequested">Loading...</div>


    <!-- TODO: -->
    <div class="debugPanel">
      <p class="debug">{{ $store.state.debug }}</p>
      <div @click="debugPanel.reset">Reset Settings</div>
      <div @click="debugPanel.darkPopups = !debugPanel.darkPopups">Toggle light/dark related tool popups</div>
      <p>{{ debugPanel }}</p>
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
            <h3>Join the community</h3>
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

export default {
  components: {
    Search: () => import(/* webpackPrefetch: true */ './Search.vue'),
  },
  data: () => ({
    btData: window.btData,
    showSearch: false,
    debugPanel: {
      darkPopups: false,
      reset: () => [localStorage.clear(), window.location.reload()] ,
    }
  }),
  methods: {
    getMenuPath(url) {
      return url.startsWith('/') ? url : (new URL(url)).pathname
    },
    toggleSearch() {
      this.showSearch = !this.showSearch
      this.$refs.search.focus()
    },
  },
  mounted() {
    let headroom = new Headroom(this.$refs.nav, {
      offset: 16,
      tolerance: 10,
    })
    headroom.init()
  },
};
</script>

<style lang="scss">
@import 'common.scss';

// DEBUG
.debugDarkPopups {
  .tool-popup.light {
    background: black !important;
    border: 1px solid black !important;
    .result {
      color: white !important;
    }
  }
}
.debugPanel {
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: .5rem;
  background: aquamarine;
  border: 1px dotted darkturquoise;
  color: teal;
  font-size: .75rem;
  font-family: sans-serif;
  letter-spacing: .05rem;
  &:hover {
    .debug {
      display: none;
    }
    >div {
      display: block;
    }
  }
  p {
    margin: 0;
  }
  >div {
    display: none;
    cursor: pointer;
    padding: .5rem 1rem;
    border: 1px dashed darkturquoise;
    &:hover {
      color: white;
      background: black;
    }
    &:last-of-type {
      margin-bottom: .5rem;
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
    //overflow: hidden;
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
    .lookup {
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
        transition: .2s;
        position: absolute;
        right: 5rem;
        &.moved {
          right: 28rem; // TODO: couple this with the search widget size
        }
        .rtl & {
          right: unset;
          left: 5rem;
          &.moved {
            left: 28rem;
          }
        }
      }
      .icon {
        max-width: 3rem;
        padding: .5rem;
        fill: white;
        cursor: pointer;
      }
      .count {
        top: 25%; right: 0;
        position: absolute;
        background: black;
        padding: .1rem .25rem;
        font-weight: normal;
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
  /*
  .search-bar {
    background-image: url('assets/gradient.jpg');
    background-size: contain;
    width: 100%;
    background-color: red;
  }
  */
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
    input {
      margin-top: 1rem;
    }
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
