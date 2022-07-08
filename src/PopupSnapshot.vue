<template>
  <div :class="{'popup-tools': true, light}">
    <div v-for="t in tools" :key="t" :class="['result', t.type]" @click="$router.push({name: 'tool', params: {slug: t}}, () => {}, () => {})">
      <div :class="['type', 'bg-' + $store.state.toolsBySlug[t].type]">
        <img svg-inline v-if="$store.state.toolsBySlug[t].type == 'tactic'" class="bt-icon" src="./assets/tactic-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'theory'" class="bt-icon" src="./assets/theory-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'story'" class="bt-icon" src="./assets/story-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'principle'" class="bt-icon" src="./assets/principle-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'methodology'" class="bt-icon" src="./assets/methodology-inverse.svg">
        <div class="h3">{{ $store.state.toolsBySlug[t].title }}</div>
      </div>
      <div :class="['content', $store.state.toolsBySlug[t].type]">
        <div v-html="markdown($store.state.toolsBySlug[t].snapshot)" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'PopupSnapshot',
  props: {
    light: {type: Boolean, default: false},
    tools: {type: Array, default: () => []},
  },
};
</script>

<style lang="scss">
@import 'common.scss';

.popup-tools {
  flex: 1 0 auto;
  position: absolute;
  display: flex;
  flex-direction: column;

  width: $searchWidth;
  background: black;

  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  &.light {
    background: white;
    .result {
      color: $text;
    }
  }

  .result {
    color: white;
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    .type {
      padding: .75rem 1.5rem;
      display: flex;
      align-items: center;
    }
    .h3 {
      color: white !important;
    }
    .bt-icon {
      max-height: 2rem;
      max-width: 2rem;
    }
    p {
      margin: 0;
    }
    .content {
      padding: 1rem 1.5rem;
    }
  }
}
</style>
