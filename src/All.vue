<template>
  <div class="all-modules">
    <div>
      <div class="toolbar">
        <search :reroute="false" ref="search" class="toolbox-search" :text="text['site.search']" />
        <button v-if="searchResults.length" @click="downloadPDF(searchResults)">
          PDF of {{ searchResults.length }} search results</button>
        <button v-if="$store.state.savedTools.size" @click="downloadPDF($store.state.savedTools)">
          PDF of {{ $store.state.savedTools.size }} saved tools</button>
      </div>
      <div class="column-wrapper">
        <div v-for="type in types" :key="type"
          :class="{column: true, [type]: true, collapse: !expand[type]}"
          @click="expand[type] = !expand[type] ? true : false">
          <div class="head">
            <div class="type">
              <img svg-inline v-if="type == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
              <img svg-inline v-else-if="type == 'theory'" class="bt-icon" src="./assets/theory.svg">
              <img svg-inline v-else-if="type == 'story'" class="bt-icon" src="./assets/story.svg">
              <img svg-inline v-else-if="type == 'principle'" class="bt-icon" src="./assets/principle.svg">
              <img svg-inline v-else-if="type == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
              <div class="h2">{{ text[`type.${type}.plural`] }}</div>
            </div>
            <span class="triangle"/>
          </div>
          <div v-for="(tool, i) in filteredToolsByType[type]" :class="['tool', type]" :key="i">
            <div v-if="expand[type]" class="tool-row">
              <span @click.stop="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)" :title="text['site.saved']">
                <img v-if="$store.state.savedTools.has(tool.slug)"
                  svg-inline :class="['bt-icon', 'active', tool.type]" src="./assets/favorite-active.svg">
                <img v-else svg-inline class="bt-icon" src="./assets/favorite.svg">
              </span>
              <router-link :class="{favorite: $store.state.savedTools.has(tool.slug)}" :to="{name: 'tool', params: {slug: tool.slug}}">
                {{ tool.title }}
              </router-link>
            </div>
          </div>
          <div class="h2 sideways">{{ text[`type.${type}.plural`] }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Search from './Search'

export default {
  name: 'All',
  data: () => ({
    types: ['story', 'tactic', 'principle', 'theory', 'methodology'],
    expand: {story: true, tactic: true, principle: true, theory: true, methodology: true},
  }),
  components: {
    Search,
  },
  watch: {
    searchResults() {
      this.expand = Object.fromEntries(this.types.map(T => [T, !!this.filteredToolsByType[T].length]))
    }
  },
  computed: {
    searchResults() {
      return this.$store.state.searchResults
    },
    filteredToolsByType() {
      let obj = Object.fromEntries(this.types.map(T => [T, []]))
      if (this.searchResults.length) {
        this.searchResults.forEach(slug => {
          let tool = this.$store.state.toolsBySlug[slug]
          obj[tool.type].push(tool)
        })
      } else {
        this.$store.state.tools.forEach(tool => obj[tool.type].push(tool))
      }
      return obj
    },
  },
  methods: {
  },
};
</script>

<style lang="scss">
@import 'common.scss';
.all-modules {
  padding-top: 4rem;

  // Mobile header adjustments for the Squarespace theme
  @media #{$ss-mobile-header} {
    padding-top: 10rem;
  }
  @include breakpoint($sm) {
    padding-top: 7.5rem;
  }

  display: flex;
  width: 100%;
  justify-content: space-around;
  .toolbar {
    display: flex;
    padding-bottom: 1rem;
    align-items: center;
    justify-content: center;
    width: 50vw;
  }
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .toolbox-search {
    width: 20rem !important;
    margin-inline-end: 2rem;
  }
}
.column-wrapper {
  @mixin type-specific-stuff($color) {
    .triangle::after { border-right-color: $color; }
    &.column {
      background-color: transparentize($color, .95);
      border-inline-end: transparentize($color, .75);
      border-inline-end-width: 1px;
      border-inline-end-style: solid;
      box-shadow: 0 0 1rem transparentize($color, .97) inset;
    }
    .bt-icon {
      fill: $color;
    }
  }
  .tactic { @include type-specific-stuff($tactic); }
  .theory { @include type-specific-stuff($theory); }
  .story { @include type-specific-stuff($story); }
  .principle { @include type-specific-stuff($principle); }
  .methodology { @include type-specific-stuff($methodology); }

  max-width: 1600px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  @include breakpoint($lower) {
    flex-wrap: wrap;
    .column {
      flex: 1 0 100%;
      &.collapse {
        flex: 3 5 33.3% !important;

      }
    }
  }

  .tool-row {
    display: flex;
    flex: 1 6 auto;
    align-items: flex-start;
    position: relative;
    a {
      flex: 10 0 90%;
      text-decoration: none;
      padding: .2rem 0;
      &.favorite {
        font-weight: bold;
      }
      @include breakpoint($upper) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .bt-icon {
      max-width: 2rem;
      max-height: 1.4rem;
      //margin-inline-end: .5rem;
      padding: .1rem;
    }
  }
  .column {
    flex: 2 1 20%;
    padding: 0 2rem 1rem 1rem;
    cursor: pointer;
    min-height: 13rem;
    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 1rem 0;
      position: relative;
      .type {
        display: flex;
        align-items: flex-end;
      }
      .bt-icon {
        margin: 0;
        margin-inline-start: .5rem;
        margin-inline-end: .5rem;
        max-width: 2rem;
        max-height: 2rem;
        transition: transform .2s linear;
      }
    }
    .h2.sideways {
      transform: rotate(90deg);
      padding: .5rem;
      pointer-events: none;
      opacity: 0;
      display: block !important;
      transition: opacity .2s linear;
      overflow-wrap: normal;
    }
    &.collapse {
      overflow-x: hidden;
      flex: 0 1 6rem;
      .bt-icon {
        transform: rotate(90deg);
      }
      .triangle::after {
        transform: translateX(-1rem) scaleX(-1);
      }
      .h2 {
        display: none;
      }
      .h2.sideways {
        opacity: 1;
      }
    }
  }
  .triangle {
    padding: 0 1rem;
    &::after {
      transform: none;
      transition: all .2s ease-out;
      position: absolute;
      bottom: 1.5rem;
      content: "";
      border-right-width: .6rem;
      border-right-style: solid;
      border-bottom: .5rem solid transparent;
      border-top: .5rem solid transparent;
    }
  }
}
</style>
