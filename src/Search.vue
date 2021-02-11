<template>
  <input class="search" type="text" :placeholder="`${text} 🔍`" v-model="query" ref="input" @keyup="search">
</template>

<script>
export default {
  name: 'Search',
  data: () => ({
    query: '',
  }),
  props: {
    text: {type: String, default: 'Search'},
  },
  methods: {
    search() {
      if (this.query == this.$route.params.query) return
      this.$router.push({
        name: 'toolbox-search',
        ...(this.query && {params: {query: this.query}}),
      })
    },
  },
  watch: {
    query() {
      this.query && this.$store.dispatch('SEARCH', this.query)
    },
  },
  created() {
    console.log('created', this.$route.name)
    this.query = this.$route.params.query
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

input[type="text"].search {
  cursor: pointer;
  margin-top: .4rem;
  width: unset;
  color: $text;
  font-size: .9rem;
  border: 1px solid $bgdark3;
  background: white;

  @include breakpoint($md) {
    font-size: .8rem;
  }
  @include breakpoint($sm) {
    margin-inline-start: -1rem;
    margin-inline-end: -2rem;
    max-width: 55%;
  }
  &::-webkit-input-placeholder {
    color: $bgdark2;
  }
  &:focus {
    outline: 2px solid $text;
  }
}

/*
.loader,
.loader:before,
.loader:after {
  border-radius: 50%;
  width: 2.5em;
  height: 2.5em;
  animation-fill-mode: both;
  animation: load7 1.8s infinite ease-in-out;
}
.loader {
  color: #ffffff;
  font-size: 10px;
  margin: 80px auto;
  position: relative;
  text-indent: -9999em;
  transform: translateZ(0);
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  content: '';
  position: absolute;
  top: 0;
}
.loader:before {
  left: -3.5em;
  animation-delay: -0.32s;
}
.loader:after {
  left: 3.5em;
}
@-webkit-keyframes load7 {
  0%, 80%, 100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}
@keyframes load7 {
  0%, 80%, 100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}
*/

</style>
