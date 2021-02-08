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

    <back-to-top bottom="1.25rem" right="1.25rem">
      <button type="button" class="btn-to-top"><div></div></button>
      <!-- ▲ -->
    </back-to-top>
  </div>
</template>

<script>
import Search from './Search'

export default {
  components: {
    Search,
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
  width: 3.0rem;
  height: 3.0rem;;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 0 .5rem rgba(0,0,0,.2);
  div {
    width: 0;
    border-bottom: 1.4rem solid $text;
    border-left: .8rem solid transparent;
    border-right: .8rem solid transparent;
    position: relative;
    bottom: .15rem;
    left: .35rem;
  }
  @include breakpoint($sm) {
    display: block;
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
