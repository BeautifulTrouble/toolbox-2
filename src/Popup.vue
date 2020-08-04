<template>
  <div class="popup-tools">
    <div v-for="t in tools" :key="t" class="result" @click="$router.push({name: 'tool', params: {slug: t}}, () => {}, () => {})">
      <div :class="['type', 'bg-' + $store.state.toolsBySlug[t].type]">
        <img svg-inline v-if="$store.state.toolsBySlug[t].type == 'tactic'" class="icon" src="./assets/tactic-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'theory'" class="icon" src="./assets/theory-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'story'" class="icon" src="./assets/story-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'principle'" class="icon" src="./assets/principle-inverse.svg">
        <img svg-inline v-else-if="$store.state.toolsBySlug[t].type == 'methodology'" class="icon" src="./assets/methodology-inverse.svg">
      </div>
      <div :class="['content', $store.state.toolsBySlug[t].type]">
        <h3>{{ $store.state.toolsBySlug[t].title }}</h3>
        <div v-html="markdown($store.state.toolsBySlug[t].snapshot)" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Popup',
  props: {
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
  //top: 16px * 3 + 6px; // 3rem + 2px outline
  top: 3rem;
  margin-top: 5px;
  outline: 2px solid black;
  width: $searchWidth;
  background: black;

  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .result {
    color: white;
    flex: 1 0 auto;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    .type {
      display: flex;
      align-items: center;
    }
    .icon {
      max-height: 2.5rem;
      max-width: 2.5rem;
    }
    h3, p {
      margin: 0;
    }
    .content {
      padding: .5rem 1rem;
    }
  }
}
</style>
