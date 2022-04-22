<template>
  <div id="app" :class="{rtl: $store.state.lang == 'ar', [$store.state.lang]: true}">
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>

    <div class="langs">
      <span v-for="lang in config.langs" :key="lang"
        :class="{'router-link-active': lang == $store.state.lang, [lang]: true}"
        @click="$store.dispatch('LANG_SET', [lang, false])">{{ textByLang[lang]['site.language'] }}</span>
    </div>

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
};
</script>

<style lang="scss">
@import 'common.scss';

#app {
  min-height: 50vh;
  // Squarespace makes this complicated (additional spacing is added to the toolbox)
  //margin-top: 6vmax;
}
.header-announcement-bar-wrapper::after {
  display: none; // Hide fake Squarespace language button
}
.langs {
  // TODO: This probably breaks small screens
  font-family: 'ff-good-headline-web-pro-condensed', "Noto Sans Myanmar", sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  cursor: pointer;
  position: fixed;
  top: 0; right: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  span {
    padding: .1rem .4rem;
    //flex: 0 0 25%;
    color: white;
    &.my {
      font-size: .7rem;
      position: relative;
      top: .2rem;
      //padding: .1rem .4rem 0 .4rem;
    }
    @include breakpoint($sm) {
      padding: .1rem .2rem;
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
