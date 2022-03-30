<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>

    <div class="langs">
      <span v-for="lang in config.langs" :key="lang"
        :class="{'router-link-active': lang == $store.state.lang}"
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
  font-family: 'ff-good-headline-web-pro-condensed';
  font-size: 1.1rem;
  font-weight: 300;
  cursor: pointer;
  position: fixed;
  top: 0; right: 0;
  z-index: 10;
  span {
    padding: .4rem .6rem;
    color: white;
    @include breakpoint($sm) {
      padding: .4rem .3rem;
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
