<template>
  <div>
    <div v-if="$store.state.wordPressRequested">Loading...</div>
    <div
      class="wordpress"
      @click="handleLink"
      v-html="$store.state.wordPress"
      ></div>
  </div>
</template>

<script>
import config from '../bt.config'

export default {
  name: 'WordPress',
  props: {
    // FIGURE OUT: loading things other than wordpress pages
    //path: {type: String, default: config.fallbackPage},
  },
  methods: {
    handleLink($event) {
      let { target } = $event
      // Ascend elements to the link
      while (target && target.tagName != 'A') target = target.parentNode
      // Only match local links
      if (target && target.href && target.rel != 'external' &&
          (target.matches(`.wordpress a[href*="://${config.siteDomain}"]`)
           || target.matches('.wordpress a:not([href*="://"])'))) {
        const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } = $event
        if (altKey || ctrlKey || metaKey || shiftKey) return
        if (defaultPrevented) return
        if (button !== undefined && button !== 0) return
        if (target.getAttribute && target.getAttribute('target') == '_blank') return
        const url = new URL(target.href)
        if ($event.preventDefault) {
          $event.preventDefault()
          if (window.location.pathname != url.pathname || window.location.hash != url.hash) {
            // For some reason this throws an undefined exception on language-setting links
            this.$router.push({path: url.pathname, hash: url.hash}).catch(e => e)
          }
        }
      }
    }
  },
  watch: {
    $route(to, from) {
      if (to.path != from.path) this.$store.dispatch('WP_GET', to)
    },
  },
  created() {
    this.$store.dispatch('WP_GET', this.$route)
  },
};
</script>

<style lang="scss">
</style>
