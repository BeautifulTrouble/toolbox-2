<template>
  <div class="tool-tile" v-if="tool"
    @click="$router.push({name: 'tool', params: {slug: tool.slug}})">
    <!--
      @click="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)">
    -->
    <!-- Use VueLazyLoad for loading images on scroll -->
    <div class="tool-tile-image" v-lazy:background-image="`${config.imagePrefix}/tile-${tool.image}`">
      <div :class="['upper', `bg-${tool.type}`]">
        <div>
          <img svg-inline v-if="tool.type == 'tactic'" class="icon" src="./assets/tactic.svg">
          <img svg-inline v-if="tool.type == 'theory'" class="icon" src="./assets/theory.svg">
          <img svg-inline v-if="tool.type == 'story'" class="icon" src="./assets/story.svg">
          <img svg-inline v-if="tool.type == 'principle'" class="icon" src="./assets/principle.svg">
          <img svg-inline v-if="tool.type == 'methodology'" class="icon" src="./assets/methodology.svg">
          <!--
          <img svg-inline v-if="tool.type == 'tactic'" class="icon" src="./assets/tactic-inverse.svg">
          <img svg-inline v-if="tool.type == 'theory'" class="icon" src="./assets/theory-inverse.svg">
          <img svg-inline v-if="tool.type == 'story'" class="icon" src="./assets/story-inverse.svg">
          <img svg-inline v-if="tool.type == 'principle'" class="icon" src="./assets/principle-inverse.svg">
          <img svg-inline v-if="tool.type == 'methodology'" class="icon" src="./assets/methodology-inverse.svg">
          -->
          <h3>{{ text[tool.type][0] }}</h3>
        </div>
        <div @click.stop="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)">
          <img svg-inline v-if="$store.state.savedTools.has(tool.slug)" class="icon" src="./assets/favorite-active.svg">
          <img svg-inline v-else class="icon" src="./assets/favorite.svg">
        </div>
      </div>
      <div class="lower">
        {{ tool.title }}
      </div>
      <h2>{{ text[tool.type][0] }}</h2>
      {{ tool.title }}{{ $store.state.savedTools.has(tool.slug) ? '@' : '.' }}
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
  },
};
</script>

<style lang="scss">
.tool-tile {
  cursor: pointer;
  flex: 0 0 20%;
  height: 20vw;
  //border: 2px dashed #777;
  overflow: hidden;
  border: .25rem solid white;

  .upper {
    height: 10%;
    min-height: 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
    }
  }
  h3 {
    font-size: 1rem;
    margin: 0;
    color: white;
  }
  svg {
    margin: 0 .5rem 0 1rem;
    //width: 10%;
    max-width: 2rem;
    max-height: 2.5rem;
    .rtl & {
      margin: 0 1rem 0 .5rem;
    }
  }
  .icon {
    fill: white;
  }
}
.tool-tile-image {
  background-repeat: no-repeat;
  background-position: top center;
  background-size: cover;
  transition: opacity 1s;
  height: 100%;
  &[lazy="loading"] {
    opacity: 0;
  }
  &[lazy="loaded"] {
    opacity: 1;
  }
}
</style>
