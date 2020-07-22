<template>
  <div>
    <h1 v-if="$store.state.langRequested">Loading Toolbox...</h1>
    <div class="toolbox">
      <div class="filter">
        <div class="sentence contain">
          <span>Show me</span>
          <span>
            <span :class="{tab: true, active: ['collection', 'selected'].includes(filterPaneActive)}"
              @click="filterPaneActive = filterCollection == 'selected' ? 'selected' : 'collection'">
              {{ filterCollection == 'all' ? 'everything' : (typeTextBySlug[filterCollection] || [, filterCollection])[1] }}</span>
          </span>
          <span v-if="filterCollection == 'story'">
            <span>from</span>
            <span :class="{tab: true, active: filterPaneActive == 'region'}"
              @click="filterPaneActive = 'region'">
              {{ filterRegion == 'all' ? 'the whole world' : filterRegion }}</span>
          </span>
          <span v-if="!['saved', 'selected', ALL].includes(filterCollection)">
            <span>about</span>
            <span :class="{tab: true, active: filterPaneActive == 'tag'}" @click="filterPaneActive = 'tag'">
              {{ tagTextBySlug[filterTag] || 'everything' }}</span>
          </span>
          <img v-if="filterCollection != ALL" svg-inline class="icon reset" src="./assets/reset.svg" @click="filterReRoute()" alt="Reset">
        </div>
        <div class="widget-wrapper">
          <div class="widget contain">
            <transition name="fade" mode="out-in">
              <div class="by by-collection" v-if="filterPaneActive == 'collection'">
                <div v-for="(value, key) in typeTextBySlug" :key="key" :class="getFilterClasses('Collection', key)" @click="filterToggleCollection(key)">
                  <img svg-inline v-if="key == 'tactic'" class="icon" src="./assets/tactic.svg">
                  <img svg-inline v-if="key == 'theory'" class="icon" src="./assets/theory.svg">
                  <img svg-inline v-if="key == 'story'" class="icon" src="./assets/story.svg">
                  <img svg-inline v-if="key == 'principle'" class="icon" src="./assets/principle.svg">
                  <img svg-inline v-if="key == 'methodology'" class="icon" src="./assets/methodology.svg">
                  <h3>{{ value[1] }}</h3>
                  <p>{{ descriptionTextByLang[key] }}</p>
                </div>
                <div :class="getFilterClasses('Collection', 'saved')" @click="filterToggleCollection('saved')">
                  <img svg-inline class="icon smaller" src="./assets/favorite-active.svg">
                  <h3>MY TOOLS</h3>
                  <p>TOOLS YOU'VE SAVED BY CLICKING THE HEART ICON</p>
                </div>
                <div :class="getFilterClasses('Collection', 'selected')" @click="filterToggleCollection('selected')">
                  <img svg-inline class="icon smaller" src="./assets/selected.svg">
                  <h3>SELECTED TOOLS</h3>
                  <p>COLLECTIONS OF TOOLS WE'VE SELECTED BASED ON SOME CRITERIA</p>
                </div>
              </div>

              <div class="by by-region" v-if="filterPaneActive == 'region'" :key="'region'">

                <div :class="{block: true, active: filterRegion == 'all'}" @click="filterToggleRegion('all')">
                  <img svg-inline class="icon" src="./assets/regions/world.svg">
                  <p>THE WHOLE WORLD</p>
                </div>
                <div v-for="region in ['Africa', 'Asia', 'Europe', 'Latin America and the Caribbean', 'Middle East', 'North America']"
                  :class="{block: true, active: filterRegion == slugify(region)}" @click="filterToggleRegion(slugify(region))">
                  <img svg-inline v-if="region == 'Africa'" class="icon" src="./assets/regions/africa.svg">
                  <img svg-inline v-if="region == 'Asia'" class="icon" src="./assets/regions/asia.svg">
                  <img svg-inline v-if="region == 'Europe'" class="icon" src="./assets/regions/europe.svg">
                  <img svg-inline v-if="region == 'Latin America and the Caribbean'" class="icon" src="./assets/regions/latin-america-and-the-caribbean.svg">
                  <img svg-inline v-if="region == 'Middle East'" class="icon" src="./assets/regions/middle-east.svg">
                  <img svg-inline v-if="region == 'North America'" class="icon" src="./assets/regions/north-america.svg">
                  <p>{{ region }}</p>
                </div>
              </div>

              <div class="by by-selected" v-if="filterPaneActive == 'selected'" :key="'selected'">
                <h1>Backend connection required</h1>
                <div @click="filterToggleSelected('best-of')">BEST OF</div>
                <div @click="filterToggleSelected('andrews-list')">ANDREW'S LIST</div>
              </div>

              <div class="by by-tag" v-if="filterPaneActive == 'tag'" :key="'tag'">
                <span v-for="(tag, i) in tagSlugsSorted" :key="i"
                  :class="{active: filterTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
                  @click="filterToggleTag(tag)">
                  {{ capitalize(tagTextBySlug[tag]) }}
                </span>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <transition-group name="tools-list" tag="div" class="tools">
        <tool-tile v-for="tool in filteredTools" :key="tool.slug"
          :tool="tool" :text="typeTextBySlug"/>
        <a v-if="!['selected', 'saved'].includes(filterCollection)"
          class="tool-tile add-tool" :href="config.submissionForm" target="_blank" :key="-1">
          <div class="add">+</div>
          <h3>SUGGEST A TOOL</h3>
        </a>
        <div v-if="filterCollection == 'saved'" class="tool-tile tool-add" :key="-2">
          LOOKS LIKE YOU HAVENT SAVED ANY TOOLS BLAH BLAH BLAH I WISH SOMEBODY HAD DESIGNED HOW THIS SHOULD LOOK
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import ToolTile from './ToolTile'
import config from './config'
import descriptionTextByLang from './descriptions'
import tagTextByLang from './tags'
import typeTextByLang from './types'

// Let's have some dignity
const ALL = 'all'
const COLLECTIONS = ['andrews-list', 'best-of']
const REGIONS = ['all', 'Africa', 'Asia', 'Europe', 'Latin America and the Caribbean', 'Middle East', 'North America'].map(
  s => s.toLowerCase().replace(/\s/ig, '-').replace(/[^-\w]/ig, ''))

export default {
  name: 'Toolbox',
  props: {
  },
  data: () => ({
    ALL,
    REGIONS,
    config,
    filterPaneActive: null,
    // Values filter{Collection,Region,Selected,Tag} should ONLY be manipulated by a route guard
    filterCollection: null,
    filterRegion: null,
    filterSelected: null,
    filterTag: null,
  }),
  components: {
    ToolTile,
  },
  computed: {
    sentence() {
      if (this.filterCollection == 'story')
        return `Show me ${this.filterCollection} from (region) ${this.filterRegion} about (tag) ${this.filterTag}`
      else
        return `Show me ${this.filterCollection} about (tag) ${this.filterTag}`
    },
    filteredToolsAllTags() {
      let tools = this.$store.state.tools.filter(
        t => t['module-type'] != 'snapshot' && t['module-type-effective'] != 'snapshot')

      if (this.filterCollection == 'saved')
        tools = tools.filter(t => this.$store.state.savedTools.has(t.slug))
      else if (this.filterCollection == 'selected' && this.filterSelected != ALL)
      // TODO: select actual filter
      //else if (COLLECTIONS.includes(this.filterCollection))
        tools = tools.filter(t => (this.$store.state.collectionLists || ['action-logic']).includes(t.slug))
      else if (config.toolTypes.includes(this.filterCollection))
        tools = tools.filter(t => t.type == this.filterCollection)

      // TODO: how does this work wrt ALL???
      if (this.filterCollection == 'story' && this.filterRegion != ALL)
        tools = tools.filter(t => {
          let regionSlugs = t.regions.map(this.slugify) || []
          return regionSlugs.includes(this.filterRegion) || regionSlugs.includes('worldwide')
        })
      return tools
    },
    filteredTools() {
      let tools = this.filteredToolsAllTags
      if (this.filterTag != ALL)
        tools = tools.filter(t => (t.tags || []).includes(this.filterTag))
      return tools
    },
    tagSlugsSorted() { // Sorted in current language
      return Object.keys(this.tagTextBySlug)
              .sort((a, b) => this.tagTextBySlug[a].localeCompare(this.tagTextBySlug[b]))
    },
    tagSlugsAvailable() { // Relies on filteredToolsAllTags to
      return this.filteredToolsAllTags
        .map(t => t.tags)
        .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a, new Set([]))
    },
    descriptionTextByLang() {
      return descriptionTextByLang[this.$store.state.lang]
    },
    tagTextBySlug() {
      return tagTextByLang[this.$store.state.lang]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    }
  },
  methods: {
    // XXX: Why is filter & routing logic creeping toward 100 LOC?
    //      Justification 2020-4-30: the logic does 3 things:
    //      1. REJECT invalid filter routes and redirect to a next-best route
    //      2. SHOW the active selection when a user arrives at a filtered URL (e.g.: landing on
    //         /toolbox/story SHOWS that story is selected, not tags for FURTHER filtering)
    //      3. it needs to UPDATE the filterPaneActive when navigating between panes.
    filterGuardAndSet(route, next) {
      // Validates and sets filters specified by a route. When passed the next function from a
      // route guard, re-routes to a path with a valid filter (or none). A default filterPaneActive
      // is selected, but if this guard was triggered by a filterToggle* function, filterPaneActive
      // may subsequently be set to something else.
      let { collection, filterA, filterB } = route.params
      let filterRegion, filterSelected, filterTag

      next = next || (() => {})
      let nextReplace = params => next({name: 'toolbox', replace: true, params})

      // Each branch 1. REJECTS invalid routes, 2. SETS positional filter params, 3. SELECTS filterPaneActive
      if (collection == 'saved') {
        if (filterA || filterB) return nextReplace({collection})
        this.filterPaneActive = 'collection'
      } else if (collection == 'selected') {
        if (filterB) return nextReplace({collection, filterA})
        if (!COLLECTIONS.includes(filterA)) return nextReplace({collection, filterA: config.defaultCollection})
        filterSelected = filterA
        this.filterPaneActive = 'selected'
      } else if (collection == 'story') {
        if (filterB && !(filterB in this.tagTextBySlug)) return nextReplace({collection, filterA})
        if (filterA && !REGIONS.includes(filterA)) return nextReplace({collection})
        filterRegion = filterA
        filterTag = filterB
        this.filterPaneActive = filterA ? (filterB ? 'tag' : 'region') : 'collection'
      } else if (collection in this.typeTextBySlug) {
        if (filterB) return nextReplace({collection, filterA})
        if (filterA && !(filterA in this.tagTextBySlug)) return nextReplace({collection})
        filterTag = filterA
        this.filterPaneActive = filterA ? 'tag' : (collection == 'story' ? 'region' : 'collection')
      } else if (collection) {
        return nextReplace({})
      } else {
        this.filterPaneActive = 'collection'
      }
      this.filterCollection = collection || ALL
      this.filterRegion = filterRegion || ALL
      this.filterSelected = filterSelected || ALL
      this.filterTag = filterTag || ALL
      next()
    },
    filterReRoute(params = {}) {
      this.$router.push({name: 'toolbox', params})
    },
    filterToggleCollection(collection) {
      if (this.filterCollection != collection) this.filterReRoute({collection})
      this.filterPaneActive = {story: 'region', saved: 'collection', selected: 'selected'}[collection] || 'tag'
    },
    filterToggleRegion(region) {
      if (this.filterCollection == 'story') {
        if (this.filterRegion != region) this.filterReRoute({collection: 'story', filterA: region})
        this.filterPaneActive = 'tag'
      }
    },
    filterToggleSelected(selected) {
      // TODO: test this when selected tools become available
      console.log(selected)
      if (this.filterCollection == 'selected') {
        if (this.filterSelected != selected) this.filterReRoute({collection: 'selected', filterA: selected})
        else this.filterReRoute({collection: 'selected'})
      }
    },
    filterToggleTag(tag) {
      if (this.filterTag != tag) {
        this.filterReRoute(this.filterCollection == 'story'
          ? {collection: this.filterCollection, filterA: this.filterRegion, filterB: tag}
          : {collection: this.filterCollection, filterA: tag})
      } else {
        this.filterReRoute(this.filterCollection == 'story'
            ? {collection: this.filterCollection, filterA: this.filterRegion}
            : {collection: this.filterCollection})
      }
    },
    getFilterClasses(filterPaneActive, selection) {
      let filter = this[`filter${filterPaneActive}`]
      return {
        [selection]: true,
        block: true,
        active: filter == selection,
        inactive: filter != ALL && filter != selection,
      }
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.filterGuardAndSet(to, next)
  },
  beforeRouteEnter(to, from, next) {
    next(vm => vm.filterGuardAndSet(to, next))
  },
  created() {
    console.log('created toolbox', this.$route)
    // TODO: Determine if this is EVER needed on a prod version, or only from development webpack
    this.filterGuardAndSet(this.$route)
  },
};
</script>

<style lang="scss">
@import 'common.scss';

.filter {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.sentence {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  font-size: 1.5rem;
  height: 2rem;
  margin-top: 2rem;
  margin-bottom: .5rem;
  .tab {
    text-transform: uppercase;
    font-weight: bold;
    padding: .5rem 1rem .625rem 1rem;
    position: relative;
    z-index: 1;
    margin: 0 .5rem;
    cursor: pointer;
    &.active {
      background-color: $bggray;
      border-right: 1px solid $bgdark2;
      border-radius: 5px 5px 0 0;
    }
  }
  .icon {
    margin: 0 .5rem;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    fill: $text;
    transition: fill .2s linear;
    &:hover {
      fill: black;
    }
  }
}
.widget-wrapper {
  border: 1px solid $bgdark1;
  border-radius: 5px;
}
.widget {
  $filterHeight: 18rem;
  min-height: $filterHeight;
  background-color: $bggray;
  border-left: 1px solid white;
  border-top: 1px solid white;
  border-radius: 5px;
  border-right: 1px solid $bgdark2;

  h3 {
    margin: 0;
    text-align: center;
  }
  .by {
    display: flex;
    min-height: $filterHeight;
    .block {
      padding: 1rem;
      text-align: center;
    }
  }
  .by-region {
    .icon {
      height: 8rem;
    }
    .block p {
      min-height: 15%;
    }
  }
  .by-tag {
    padding: 1rem 3rem;
    flex-wrap: wrap;
    flex-direction: column;
    max-height: $filterHeight;
    justify-content: flex-start;
    align-items: space-between;
    span {
      cursor: pointer;
      min-height: 1.5rem;
      padding: 0 1rem;
      display: inline-flex;
      align-items: center;
      &.active {
        font-weight: bold;
        position: relative;
        &::after {
          content: "×";
          font-size: 2.5rem;
          line-height: 1rem;
          color: $theory;
          position: relative;
          bottom: 2px;
          left: 5px;
          .rtl & {
            left: 0;
            right: 5px;
          }
        }
      }
      &.disabled {
        color: $bgdark2;
        pointer-events: none;
      }
    }
  }
  .block {
    height: $filterHeight;
    border-left: 1px solid white;

    cursor: pointer;
    flex: 1 2 14%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &.active {
      background: $bgdark1;
    }
    &.inactive {
      opacity: .5;
    }
    p {
      min-height: 35%;
    }
  }
  .icon {
    margin: .5rem;
    width: 8rem;
    height: 4rem;
    &.smaller {
      width: 3rem;
    }
  }
  .selected {
    fill: $selected;
  }
}
.tools {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative; // For transition animation
  margin: .25rem -.25rem;
  .add-tool {
    background: $bggray;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-decoration: none;
    color: $bgdark2;
    transition: color .2s linear;
    &:hover {
      color: $bgdark3;
    }
    &::after {
      content: "";
      position: absolute;
      top: 0; bottom: 0;
      left: 0; right: 0;
      border: .25rem dashed $bgdark2;
    }
    .add {
      font-size: 14rem;
      line-height: 10rem;
      margin-top: -3rem;
      font-weight: bold;
    }
  }
}

// Transition-group animation
.tool-tile {
  transition: opacity .1s linear;
}
.tools-list-leave-active {
  // Absolute positioning causes existing tiles to stretch which is slow
  //position: absolute;
}
.tools-list-enter-active, .tools-list-leave-active {
  opacity: 1;
}
.tools-list-enter, .tools-list-leave-to {
  opacity: 0;
}
</style>
