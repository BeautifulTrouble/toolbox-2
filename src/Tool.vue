<template>
  <div class="tool" v-if="tool">
    <!-- Use VueLazyImageLoading for fade-in effect on load -->
    <lazy-background position="50% 0%" :aspect-ratio=".3" :src="`${config.imagePrefix}/hero-${tool.image}`">
      <div slot="content" class="heading">
        <div class="upper">
          <img svg-inline svg-sprite v-if="tool.type == 'tactic'" class="icon tactic" src="./assets/tactic.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'theory'" class="icon theory" src="./assets/theory.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'story'" class="icon story" src="./assets/story.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'principle'" class="icon principle" src="./assets/tactic.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'methodology'" class="icon methodology" src="./assets/methodology.svg">
          <h3>{{ typeTextBySlug[tool.type][0] }}</h3>
          <h1>{{ tool.title }}</h1>
        </div>
        <div class="lower">
          <div v-if="tool['image-caption']" class="caption" v-html="markdown(tool['image-caption'])" />
          <img svg-inline svg-sprite v-if="tool.video" class="icon video" src="./assets/video.svg">
        </div>

      </div>
    </lazy-background>
    <h1>{{ tool.title }}</h1>
    <span v-for="(slug, i) in tool.theories || []" :key="i"><router-link :to="`/tool/${slug}`">{{
        slug }} | </router-link></span>
    {{ tool['full-write-up'] || tool.snapshot }}

  </div>
</template>

<script>
import typeTextByLang from './types'
import config from '../bt.config'

export default {
  name: 'Tool',
  data: () => ({
    config,
  }),
  computed: {
    tool() {
      return this.$store.state.toolsBySlug[this.$route.params.slug]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    },
  },
  // beforeRouteEnter
  // beforeRouteUpdate
  created() {
    console.log('created tool')
  }
};
</script>

<style lang="scss">
@import 'common.scss';

.tool {
  .lazy-background-image {
    transition: all .2s ease-in-out;
  }
  .heading {

  }
}
</style>
