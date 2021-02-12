<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <!-- TODO: loading animation
    <div v-if="$store.state.langRequested">Loading...</div>
    -->
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>

    <div class="langs">
      <span v-for="lang in config.langs" :key="lang"
        :class="{'router-link-active': lang == $store.state.lang}"
        @click="$store.dispatch('LANG_SET', [lang, false])">{{ lang.toUpperCase() }}</span>
    </div>

    <!--
    <div class="lookup">
      <router-link to="/toolbox/saved" :class="{saved: true, moved: showSearch}">
        <span>MY TOOLS</span>
        <img svg-inline class="bt-icon favorite" src="./assets/favorite-active.svg">
        <span v-if="$store.state.savedTools.size" class="count">{{ $store.state.savedTools.size }}</span>
      </router-link>
      <transition name="fade">
        <search v-show="showSearch" ref="search" />
      </transition>
      <img svg-inline @click="toggleSearch" class="bt-icon" src="./assets/search.svg">
    </div>
    -->

    <back-to-top bottom="1rem" right="1rem">
      <button type="button" class="btn-to-top"><div>▲</div></button>
    </back-to-top>
  </div>
</template>

<script>

export default {
  components: {
  },
  data: () => ({
    showSearch: false,
  }),
  methods: {
    toggleSearch() {
      this.showSearch = !this.showSearch
      this.$refs.search.focus()
    },
  },
};
</script>

<style lang="scss">
@import 'common.scss';

#app {
  // Squarespace makes this complicated (additional spacing is added to the toolbox)
  margin-top: 6vmax;
}
.header-announcement-bar-wrapper::after {
  display: none; // Hide fake Squarespace language button
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
    div {
      color: lighten(black, 60%);
      font-size: 1.5rem;
      position: relative;
      bottom: 5%;
    }
  }
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
    padding: 0 .5rem;
    color: white;
    &.router-link-active {
    }
  }
}
.lookup {
  background: black;
  z-index: 1;
  display: flex;
  align-items: center;
  color: white;
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
  .bt-icon {
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
@include breakpoint($upper) {
  .lookup a:hover {
    text-decoration: underline;
  }
}


</style>
