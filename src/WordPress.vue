<template>
  <div>
    <div v-if="$store.state.wordPressRequested">Loading...</div>
    <div class="wordpress" v-html="$store.state.wordPress"></div>
  </div>
</template>

<script>
import config from '../bt.config'

export default {
  name: 'WordPress',
  components: {
    // FUTURE: Maybe some WordPress [shortcode] extensions can be built to add functionality
  },
  props: {
    // FIGURE OUT: loading things other than wordpress pages
    //path: {type: String, default: config.fallbackPage},
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch('GET_WP', to.path)
    },
  },
  created() {
    this.$store.dispatch('GET_WP', this.$route.path)
  },
};
</script>

<style lang="scss">
</style>
