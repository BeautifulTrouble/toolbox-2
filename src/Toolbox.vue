<template>
  <div>
    <h1 v-if="$store.state.langRequested">Loading Toolbox...</h1>
    <div class="toolbox">
      <div class="sentence">
        <h3 @click="filterReRoute()">
          {{ sentence }}
        </h3>
      </div>

      <div @click="filterPaneActive = 'collection'">:COLLECTION .</div>
      <div @click="filterPaneActive = 'region'">:REGION .</div>
      <div @click="filterPaneActive = 'selected'">:SELECTED .</div>
      <div @click="filterPaneActive = 'tag'">:TAG .</div>
      <div class="filter">
        <transition name="fade" mode="out-in">
          <div class="by-collection" v-if="filterPaneActive == 'collection'" key="'collection'">
            <div v-for="(value, key) in typeTextBySlug" :key="key"
               :class="{active: filterCollection == key}">
              <h3 @click="filterToggleCollection(key)">{{ value[1] }}</h3>
            </div>
            <div :class="{active: filterCollection == 'saved'}">
              <h3 @click="filterToggleCollection('saved')">MY TOOLS</h3>
            </div>
            <div :class="{active: filterCollection == 'selected'}">
              <h3 @click="filterToggleCollection('selected')">SELECTED TOOLS</h3>
            </div>
          </div>
          <div class="by-region" v-if="filterPaneActive == 'region'" :key="'region'">
            <div @click="filterToggleRegion('africa')">Africa</div>
          </div>
          <div class="by-selected" v-if="filterPaneActive == 'selected'" :key="'selected'">
            <div @click="filterToggleSelected('best-of')">BEST OF</div>
            <div @click="filterToggleSelected('andrews-list')">ANDREW'S LIST</div>
          </div>
          <div class="by-tag" v-if="filterPaneActive == 'tag'" :key="'tag'">
            <span
              v-for="(tag, i) in tagSlugsSorted" :key="i"
              :class="{active: filterTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
              @click="filterToggleTag(tag)"
              >{{ tagTextBySlug[tag] }}</span>
          </div>
        </transition>
      </div>

      <div class="tools">
        <transition-group name="tools-list" tag="div">
          <tool-tile v-for="tool in filteredTools" :key="tool.slug"
            :tool="tool" :text="typeTextBySlug"/>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import ToolTile from './ToolTile'
import config from '../bt.config'
import tagTextByLang from './tags'
import typeTextByLang from './types'

// Let's have some dignity
const ALL = 'all'
const COLLECTIONS = ['andrews-list', 'best-of']
const REGIONS = ['fake', 'Africa', 'Latin America and the Caribbean'].map(
  s => s.toLowerCase().replace(/\s/ig, '-').replace(/[^-\w]/ig, ''))

export default {
  name: 'Toolbox',
  props: {
  },
  data: () => ({
    ALL,
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

      if (this.filterCollection == 'story' && this.filterRegion != ALL)
        tools = tools.filter(t => (t.regions.map(this.slugify) || []).includes(this.filterRegion))
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
        if (filterB && !(filterB in this.tagTextBySlug))  return nextReplace({collection, filterA})
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
.filter {
    height: 100px;
}
.active {
  text-decoration: underline;
}
.by-collection > div {
  display: inline-block;
  padding: 1rem;
}
.by-tag > span {
  border: 1px dashed pink;
  padding: 0 .5rem;
  cursor: pointer;
  display: inline-block;
  &.active {
    font-weight: bold;
  }
  &.disabled {
    color: #ccc;
    pointer-events: none;
  }
}
.tools > div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative; // For transition animation
}

// Transition-group animation
.tool-tile {
  transition: all .2s ease-out;
}
.tools-list-leave-active {
  position: absolute;
}
.tools-list-enter-active, .tools-list-leave-active {
  opacity: 1;
}
.tools-list-enter, .tools-list-leave-to {
  opacity: 0;
}
</style>
