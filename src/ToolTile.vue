<template>
  <div class="tool-tile">
    <!-- Use VueLazyLoad for loading images on scroll -->
    <div v-if="tool"
      @click="$router.push({name: 'tool', params: {slug: tool.slug}})"
      :class="{'tool-tile-image': true, [`hover-${tool.type}`]: true}"
      v-lazy:background-image="`${config.imagePrefix}/tile-${tool.image}`">
      <div :class="['upper', `bg-${tool.type}`]">
        <div>
          <img svg-inline v-if="tool.type == 'tactic'" class="bt-icon" src="./assets/tactic-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'theory'" class="bt-icon" src="./assets/theory-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'story'" class="bt-icon" src="./assets/story-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'principle'" class="bt-icon" src="./assets/principle-inverse.svg">
          <img svg-inline v-else-if="tool.type == 'methodology'" class="bt-icon" src="./assets/methodology-inverse.svg">
          <div class="h3">{{ text[`type.${tool.type}`] }}</div>
        </div>
        <div>
          <img svg-inline v-if="tool.video" class="bt-icon video" src="./assets/video.svg">
          <!-- .stop avoids calling other click handlers and .prevent avoids the same within a link -->
          <div @click.stop.prevent="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)">
            <img svg-inline v-if="$store.state.savedTools.has(tool.slug)" class="bt-icon favorite active" src="./assets/favorite-active.svg">
            <img svg-inline v-else class="bt-icon favorite" src="./assets/favorite.svg">
          </div>
        </div>
      </div>
      <div class="lower">
        <div class="h2 title">{{ tool.title }}</div>
        <div class="snapshot" v-html="markdown(tool.snapshot)" />
      </div>
    </div>

    <div v-else-if="alt == 'suggest'" @click="openTab(config.submissionForm)" class="suggest alt">
      <div class="upper">
        <div>
          <div class="add">+</div>
          <div class="h3">{{ text['site.suggest'] }}</div>
        </div>
      </div>
      <div class="lower">
        <div class="h2 title">{{ text['site.suggest.description'] }}</div>
        <div class="snapshot">{{ text['site.suggest.help'] }}</div>
      </div>
    </div>

    <div v-else-if="alt == 'nosave'" @click="$router.push({name: 'toolbox'})" class="nosave alt">
      <div class="upper">
        <div>
          <img svg-inline class="bt-icon favorite" src="./assets/favorite.svg">
          <div class="h3">{{ text['site.saved'] }}</div>
        </div>
      </div>
      <div class="lower">
        <div class="h2 title">{{ text['site.saved.description'] }}</div>
        <div class="snapshot">{{ text['site.saved.help'] }}</div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ToolTile',
  props: {
    tool: {type: Object, default: null},
    text: {type: Object, default: null},
    alt: {type: String, default: ''},
  },
};
</script>

<style lang="scss">
@import 'common.scss';

.tool-tile {
  cursor: pointer;
  overflow: hidden;
  flex: 0 0 18rem;
  height: 18rem;
  >div {
    height: 100%;
  }

  @include breakpoint($sm) {
    .h3 {
      font-size: 1.1rem;
    }
    .h2 {
      font-size: 1.4rem;
    }
  }
  .upper {
    height: 10%;
    min-height: 2.5rem;
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
    z-index: 2;
    color: white;
    .h3, .h2 {
      color: white !important;
    }
  }
  .snapshot {
    opacity: 0;
    padding: 0 1rem;
    transition: opacity .1s;
    p {
      margin: 0;
      //line-height: 1.1;
    }
  }
  .title {
    margin: .5rem 1rem;
  }
  svg {
    max-width: 1.5rem;
    max-height: 2.5rem;
  }
  .bt-icon {
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
  // Alt
  .alt {
    position: relative;
    background: $bgdark2;
    .upper {
      background: $bgdark3;
    }
    height: 100%;
    &::before {
      content: "";
      position: absolute;
      top: 0; left: 0;
      bottom: 0; right: 0;
      border: .5rem dashed $bgdark3;
      z-index: 2;
    }
  }
  .suggest {
    .add {
      margin: 0 .6rem;
      font-size: 3rem;
      position: relative;
      top: 2px;
    }
  }
  // Hover
  @mixin hover-particulars($color) {
    &::before { // Colored background
      background: $color;
      content: "";
      position: absolute;
      left: 0; right: 0;
      top: 0; bottom: 0;
      opacity: 0;
      transition: opacity .1s linear;
    }
    // TODO: reorder layering so that the hover keeps the dark gradient
    &:hover::after { // Text fade gradient
      background: linear-gradient(transparent, transparent 85%, $color 95%);
      z-index: 2;
      opacity: 0;
    }
    &:hover::after,
    &:hover::before {
      opacity: .85;
    }
    &:hover {
      .snapshot {
        opacity: 1;
      }
    }
  }
  @include breakpoint($upper) {
    .hover-tactic { @include hover-particulars($tactic); }
    .hover-theory { @include hover-particulars($theory); }
    .hover-story { @include hover-particulars($story); }
    .hover-principle { @include hover-particulars($principle); }
    .hover-methodology { @include hover-particulars($methodology); }
    .alt { @include hover-particulars($bgdark3); }
  }
}


.tool-tile-image {
  background-color: $bgdark3;
  background-repeat: no-repeat;
  background-position: top left;
  background-size: cover;
  transition: opacity .1s linear;
  height: 100%;
  position: relative;
  &::after { // Dark gradient
    content: "";
    position: absolute;
    top: 0; left: 0;
    bottom: 0; right: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.7) 90%, rgba(0,0,0,1) 100%);
    transition: background .1 linear;
    pointer-events: none; // Allow the heart icon to work
  }
  &[lazy="loading"] {
    opacity: 0;
  }
  &[lazy="loaded"] {
    opacity: 1;
  }
}
</style>
