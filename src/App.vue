<template>
  <div id="app" :class="{rtl: $store.state.lang == 'ar', [$store.state.lang]: true}">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <Teleport to=".header-announcement-bar-wrapper">
      <div class="langs">
        <span v-for="lang in config.langs" :key="lang"
          :class="{'router-link-active': lang == $store.state.lang, [lang]: true, 'mobile-hidden': true}"
          @click="$store.dispatch('LANG_SET', [lang, false])">{{ textByLang[lang]['site.language'] }}</span>
        <span v-for="lang in config.langs" :key="lang"
          :class="{'router-link-active': lang == $store.state.lang, [lang]: true, 'mobile-only': true}"
          @click="$store.dispatch('LANG_SET', [lang, false])">{{ lang }}</span>
      </div>
    </Teleport>

    <back-to-top bottom="1rem" right="1rem">
      <button type="button" class="btn-to-top">
        <img svg-inline src="./assets/caret.svg">
      </button>
    </back-to-top>
  </div>
</template>

<script>
export default {
  data: () => ({
  }),
  methods: {
  },
  beforeCreate() {
    console.debug("removing site metadata external to toolbox vue app...")
    document.querySelectorAll('title, link[rel=canonical], link[rel=image_src], meta[itemprop], meta[name=description], meta[name^="twitter:"], meta[property^="og:"]')
      .forEach(el => el.remove())
  },
};
</script>

<style lang="scss">
@import 'common.scss';

#app {
  min-height: 50vh;
  // Squarespace makes this complicated (additional spacing is added to the toolbox)
  //margin-top: 6vmax;
}
.langs {
  // TODO: This probably breaks small screens
  font-family: 'ff-good-headline-web-pro-condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  cursor: pointer;
  position: fixed;
  top: 0; right: 0;
  left: 0;
  height: 1.5rem;
  background: black;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  span {
    padding: .1rem .4rem;
    color: white;
    @include breakpoint($sm) {
      text-transform: uppercase;
      padding: .1rem .75rem;
    }
  }
}
.btn-to-top {
  display: none;
  @include breakpoint($sm) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: none;
    background: white;
    opacity: .5;
    box-shadow: 0 0 2rem lighten(black, 50%);
    svg {
      max-height: 1rem;
      fill: rgba(0,0,0,.4);
    }
  }
}
</style>
