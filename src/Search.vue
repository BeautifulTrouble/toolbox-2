<template>
  <div class="search">
    <div class="options">
      <span @click="toolboxOnly = false" :class="{bold: !toolboxOnly}">WHOLE SITE</span>
      <span @click="toolboxOnly = true" :class="{bold: toolboxOnly}">TOOLBOX ONLY</span>
    </div>
    <label class="toggle-switch vertical">
      <input type="checkbox" v-model="toolboxOnly">
      <span class="slider"/>
    </label>
    <input type="text" placeholder="SEARCH" v-model="query" ref="input"
      @blur="blur"
      @focus="showResults = (!artificialFocus && query && results.length)"
      @click="showResults = (query && results.length)"
      @keyup.enter="search"
      >
    <transition name="fade">
      <popup v-if="showResults" :tools="results.map(r => r.ref)" />
    </transition>
  </div>
</template>

<script>
import lunr from 'lunr'

export default {
  name: 'Search',
  data: () => ({
    indices: {},
    query: '',
    results: [],
    artificialFocus: false,
    showResults: false,
    toolboxOnly: false,
  }),
  components: {
    Popup: () => import(/* webpackPrefetch: true */ './Popup.vue'),
  },
  methods: {
    search() {
      if (this.toolboxOnly) {
        this.$router.push({name: 'toolbox-search', params: {query: this.query}})
          .then(() => { this.showResults = false })
          .catch(() => { this.showResults = false })
      }
    },
    buildIndex() {
      if (!this.indices[this.$store.state.lang]) {
        this.$store.commit('setDebug', `Building search index for ${this.$store.state.lang}`)
        let self = this
        this.indices[this.$store.state.lang] = lunr(function() {
          this.ref('slug')
          this.field('title', {boost: 10})
          this.field('byline', {boost: 5})
          this.field('snapshot')
          this.field('short-write-up')
          this.field('full-write-up')
          self.$store.state.tools.forEach(t => this.add(t))
        })
      }
    },
    blur() {
      // Allow the click handler to fire before hiding the results
      this.$nextTick(() => {
        this.artificialFocus = false
        this.showResults = false
      })
    },
    focus() {
      this.artificialFocus = true
      this.$nextTick(() => this.$refs.input.focus())
    },
  },
  watch: {
    toolboxOnly() {
      this.focus()
    },
    query() {
      console.log('query changed')
      this.buildIndex()
      this.results = this.indices[this.$store.state.lang].search(this.query).slice(0, 5)
      this.showResults = !!(this.query && this.results.length)
    },
    $route(to) {
      this.toolboxOnly = /^tool/.test(to.name)
      //this.showResults = false
    }
  },
  created() {
    console.log('created', this.$route.name)
    this.toolboxOnly = /^tool/.test(this.$route.name)
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

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  margin: 0 1rem;
  input[type="checkbox"] {
    opacity: 0;
    width: 0;
    height: 0;
    &:checked + .slider::before {
      transform: translateX(1.5rem);
    }
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0;
    bottom: 0; right: 0;
    border: 1px solid white;
    border-radius: 1rem;
    &::before {
      content: "";
      position: absolute;
      height: 1rem;
      width: 1rem;
      left: 3px;
      top: 3px;
      border-radius: .5rem;
      background-color: white;
      transition: transform .2s;
    }
  }
  &.vertical {
    width: 1.5rem;
    height: 3rem;
    input[type="checkbox"]:checked + .slider::before {
      transform: translateY(1.5rem);
    }
  }
}
.search {
  width: $searchWidth;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  position: relative;
  margin: 0 .5rem 0 0;
  .rtl & {
    margin: 0 0 0 .5rem;
  }
  input[type="text"] {
    margin: 0;
  }
  .options {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-end;
    span {
      &.bold {
        font-weight: bold;
      }
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

</style>
