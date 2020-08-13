<template>
  <div class="tool-tile">
    <!-- Use VueLazyLoad for loading images on scroll -->
    <div v-if="tool"
      @click="$router.push({name: 'tool', params: {slug: tool.slug}})"
      :class="{'tool-tile-image': true, [`hover-${tool.type}`]: true}"
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

    <div v-else-if="alt == 'suggest'" @click="openTab(config.submissionForm)" class="suggest alt">
      <div class="upper">
        <div>
          <div class="add">+</div>
          <h3>New</h3>
        </div>
      </div>
      <div class="lower">
        <h2 class="title">Suggest a tool</h2>
        <div class="snapshot" v-html="markdown('Have an idea for a tool you don\'t see here?')"/>
      </div>
    </div>

    <div v-else-if="alt == 'nosave'" @click="$router.push({name: 'toolbox'})" class="nosave alt">
      <div class="upper">
        <div>
          <img svg-inline class="icon favorite" src="./assets/favorite.svg">
          <h3>Favorites</h3>
        </div>
      </div>
      <div class="lower">
        <h2 class="title">It looks like you haven't favorited any tools yet</h2>
        <div class="snapshot" v-html="markdown('Use the heart icons to add favorites and keep track of the tools that matter to you')"/>
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
  // Alt
  .alt {
    position: relative;
    background: $bgdark2;
    h2 {
      //color: $text !important;
    }
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
      bottom: .25rem;
    }
  }
  // Hover
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
    &:hover::after {
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
  transition: opacity .2s linear, filter .4s;
  height: 100%;
  position: relative;
  &::before { // Dark gradient
    content: "";
    position: absolute;
    top: 0; left: 0;
    bottom: 0; right: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.7) 90%, rgba(0,0,0,1) 100%);
  }
  &[lazy="loading"] {
    opacity: 0;
    filter: saturate(0);
  }
  &[lazy="loaded"] {
    opacity: 1;
  }
}
</style>
