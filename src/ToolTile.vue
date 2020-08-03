<template>
  <div class="tool-tile" v-if="tool"
    @click="$router.push({name: 'tool', params: {slug: tool.slug}})">
    <!-- Use VueLazyLoad for loading images on scroll -->
    <div :class="{'tool-tile-image': true, [`hover-${tool.type}`]: true, 'snapshot-lock': snapshotLock}"
      v-lazy:background-image="`${config.imagePrefix}/tile-${tool.image}`">
      <div :class="['upper', `bg-${tool.type}`]">
        <div>
          <img svg-inline v-if="tool.type == 'tactic'" class="icon" src="./assets/tactic-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'theory'" class="icon" src="./assets/theory-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'story'" class="icon" src="./assets/story-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'principle'" class="icon" src="./assets/principle-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'methodology'" class="icon" src="./assets/methodology-inverse.svg">
          <h3>{{ text[tool.type][0] }}</h3>
        </div>
        <div>
          <img svg-inline v-if="tool.video" class="icon video" src="./assets/video.svg">
          <!-- .stop avoids calling other click handlers and .prevent avoids the same within a link -->
          <div @click.stop.prevent="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)">
            <img svg-inline v-if="$store.state.savedTools.has(tool.slug)" class="icon favorite active" src="./assets/favorite-active.svg">
            <img svg-inline v-else class="icon favorite" src="./assets/favorite.svg">
          </div>
        </div>
      </div>
      <div class="lower">
        <h2 class="title">{{ tool.title }}</h2>
        <div class="snapshot" v-html="markdown(tool.snapshot)" />
      </div>
    </div>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'ToolTile',
  data: () => ({
    config,
  }),
  props: {
    tool: {type: Object, default: null},
    text: {type: Object, default: null},
    snapshotLock: {type: Boolean, default: false},
  },
};
</script>

<style lang="scss">
@import 'common.scss';

// TODO: Move these styles to Toolbox.vue, it should not be
.tool-tile {
  cursor: pointer;
  overflow: hidden;
  flex: 0 0 18rem;
  height: 18rem;

  .upper {
    height: 10%;
    min-height: 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 .25rem;
    > div {
      display: flex;
      align-items: center;
    }
  }
  .upper, .lower {
    position: relative;
    z-index: 1;
    color: white;
    h3, h2 {
      color: white !important;
    }
  }
  .snapshot {
    opacity: 0;
    padding: 0 1rem;
    transition: opacity .2s;
  }
  .title {
    margin: .5rem 1rem;
  }
  h3 {
    font-size: 1rem;
  }
  svg {
    max-width: 1.5rem;
    max-height: 2.5rem;
  }
  .icon {
    fill: white;
    margin: 0 .5rem !important;
    &.active {
      animation-name: add-favorite;
      animation-duration: .5s;
      animation-iteration-count: 1;
    }
    &.video {
      margin: 0 !important;
    }
  }
}

@mixin hover-particulars($color) {
  &::after { // Colored background
    background: $color;
    content: "";
    position: absolute;
    top: 0; left: 0;
    bottom: 0; right: 0;
    opacity: 0;
    transition: opacity .2s linear;
  }
  &:hover::after, &.snapshot-lock::after {
    opacity: .85;
  }
  &:hover, &.snapshot-lock {
    .snapshot {
      opacity: 1;
    }
  }
}
.hover-tactic { @include hover-particulars($tactic); }
.hover-theory { @include hover-particulars($theory); }
.hover-story { @include hover-particulars($story); }
.hover-principle { @include hover-particulars($principle); }
.hover-methodology { @include hover-particulars($methodology); }

.tool-tile-image {
  background-repeat: no-repeat;
  background-position: top left;
  background-size: 100% 100%;
  transition: opacity .2s linear, background-position 3s ease-in-out;
  height: 100%;
  position: relative;
  &::before { // Dark gradient
    content: "";
    position: absolute;
    top: 0; left: 0;
    bottom: 0; right: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,1) 100%);
  }
  &:hover {
    background-position: bottom center;
  }
  &[lazy="loading"] {
    opacity: .5;
  }
  &[lazy="loaded"] {
    opacity: 1;
  }
}
</style>
