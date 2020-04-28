<template>
  <div class="tool" v-if="tool"
    v-lazy:background-image="`https://beautifulrising.org/tile-${tool.image}`"
    @click="$store.dispatch('TOOL_TOGGLE', tool.slug)">
    <div>
      <h2>{{ text[tool.type][0] }}</h2>
      {{ tool.title }}{{ $store.state.savedTools.has(tool.slug) ? '@' : '.' }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Toolbox',
  props: {
    tool: {type: Object, default: null},
    text: {type: Object, default: null},
  },
};
</script>

<style lang="scss">
.tool {
  flex: 0 0 12.5%;
  height: 140px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  border: 2px dashed #777;
  overflow: hidden;
  > div {
    background: transparentize(white, .50);
  }
  &[lazy="loading"] {
    opacity: 0;
    //background: yellow; // TODO: remove
  }
}
</style>
