<template>
  <div class="tool" v-if="tool">
    <!-- Use VueLazyImageLoading for fade-in effect on load -->
    <lazy-background position="50% 0%" :aspect-ratio=".3" :src="`${config.imagePrefix}/hero-${tool.image}`">
      <div slot="content">
        <h1>{{ tool.type }}</h1>
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
.tool {
  .lazy-background-image {
    transition: all .2s ease-in-out;
  }
}
</style>
