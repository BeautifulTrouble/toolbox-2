<template>
  <div class="tool-tile" v-if="tool"
    @click="$router.push({name: 'tool', params: {slug: tool.slug}})">
    <!--
      @click="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)">
    -->
    <!-- Use VueLazyLoad for loading images on scroll -->
    <div class="tool-tile-image" v-lazy:background-image="`${config.imagePrefix}/tile-${tool.image}`">
      <h2>{{ text[tool.type][0] }}</h2>
      {{ tool.title }}{{ $store.state.savedTools.has(tool.slug) ? '@' : '.' }}
    </div>
  </div>
</template>

<script>
import config from '../bt.config'

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
  //flex: 0 0 12.5%;
  flex: 0 0 25%;
  //height: 140px;
  height: 300px;
  border: 2px dashed #777;
  overflow: hidden;
  h2 {
    margin: 0;
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
