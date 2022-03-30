<template>
  <input class="search" type="search" :placeholder="text" v-model="query" ref="input"
    @focus="debounceSearch">
</template>

<script>
export default {
  name: 'Search',
  data: () => ({
    query: '',
    debounce: null,
  }),
  props: {
    text: {type: String, default: 'Search'},
    reroute: {type: Boolean, default: true},
  },
  methods: {
    debounceSearch() {
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        this.query && this.$store.dispatch('SEARCH', this.query)
        this.updateRoute()
      }, 750)
    },
    updateRoute() {
      if (this.query == this.$route.params.query) {
        console.debug('Unchanged search query')
        return
      }
      /* eslint-disable */
      console.warn('Not updating route')
      return
      console.log(this.$router)
      if (!this.query) {
        this.$store.dispatch('SEARCH_CLEAR')
        this.reroute && this.$router.push({name: 'toolbox-search'})
      } else {
        this.reroute && this.$router.push({name: 'toolbox-search', params: {query: this.query}})
      }
    },
    focusInput() {
      this.$nextTick(() => this.$refs.input.focus())
    },
  },
  watch: {
    query() {
      this.debounceSearch()
    },
  },
  created() {
    this.query = this.$route.params.query
    this.debounceSearch()
    // TODO: Find a smarter way to detect idle time and build the index
    //       Proposal: set a recurring timer that looks at the most recent route changes and
    //       generates the index when a) someone appears to be reading a tool or b) they're idle
    //       for 5 seconds
    //setTimeout(this.buildIndex, 5000)
  },
}
</script>

<style lang="scss">
@import 'common.scss';

input[type=search].search {
  font-family: ff-good-headline-web-pro-condensed, sans-serif;
  text-transform: uppercase;
  cursor: pointer;
  margin: 0 .5rem;
  padding: .5rem 1rem;
  width: unset;
  color: $text;
  font-size: 1.4rem;
  border: 1px solid $bgdark3;
  border-radius: 3px;
  background: white;

  @include breakpoint($md) {
    font-size: .8rem;
  }
  @include breakpoint($sm) {
    padding: .5rem;
    margin-inline-start: -.5rem;
    margin-inline-end: -1.5rem;
    max-width: 50%;
  }
  &::-webkit-input-placeholder {
    color: $text;
  }
  &::-webkit-search-cancel-button {
    color: $text;
  }
  &:focus {
    outline: 2px solid $text;
    outline-offset: 0;
  }
}

</style>
