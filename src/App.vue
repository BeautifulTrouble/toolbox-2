<template>
  <div id="app" :class="{rtl: this.$store.state.lang == 'ar'}">
    <div class="langs">
      <span v-for="lang in config.langs" :key="lang"
        :class="{'router-link-active': lang == $store.state.lang}"
        @click="$store.dispatch('LANG_SET', [lang, false])">{{ lang.toUpperCase() }}</span>
    </div>

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

    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>

    <!-- TODO: Use CSS-based rectangles -->
    <div v-if="$store.state.langRequested">Loading...</div>

    <!-- TODO: -->
    <div class="debugPanel">
    </div>

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

// DEBUG
.debugPanel {
  @mixin responsive($color, $text) {
    &::after {
      content: $text;
      position: absolute;
      left: 100%;
      background-color: $color;
      padding: .5rem;
      color: white;
      font-size: 1.5rem;
      top: -1px;
      border: 1px dotted darken($color, 10%);
      margin-left: 1px;
    }
  }
  @include breakpoint($sm) { @include responsive($methodology, 'sm'); }
  @include breakpoint($md) { @include responsive($theory, 'md'); }
  @include breakpoint($lg) { @include responsive($principle, 'lg'); }
}


.langs {
  background: black;
  cursor: pointer;
  span {
    padding: 0 .5rem;
    color: white;
    &.router-link-active {
      text-decoration: underline;
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
