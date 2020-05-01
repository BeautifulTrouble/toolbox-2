<template>
  <div class="tool" v-if="tool">
    <img :src="`https://beautifulrising.org/hero-${tool.image}`">
    <h1>{{ tool.title }}</h1>
    {{ tool.snapshot }}
  </div>
</template>

<script>
export default {
  name: 'Tool',
  computed: {
    tool() {
      let t= this.$store.state.tools.filter(t => t.slug == this.$route.params.slug)[0]
      console.log('.....', t)
      return t
    },
  },
  created() {
    console.log('created tool')
  }
};
</script>

<style lang="scss">
</style>
