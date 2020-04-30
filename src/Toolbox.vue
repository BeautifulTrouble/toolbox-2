<template>
  <div>
    <h1 v-if="$store.state.langRequested">Loading Toolbox...</h1>
    <div class="toolbox">
      <div class="sentence">
        <div @click="filterReRoute()">
          ({{ activeFilter}}; {{ filterCollection }}): {{ sentence }}
        </div>
      </div>

      <div class="filter">
        <div class="by-collection" v-if="activeFilter == 'collection'">
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
        <div class="by-region" v-if="activeFilter == 'region'">
          <div @click="filterToggleRegion('Europe')">EUROPE</div>
        </div>
        <div class="by-selected" v-if="activeFilter == 'selected'">
          <div @click="filterToggleSelected('best-of')">BEST OF</div>
          <div @click="filterToggleSelected('andrews-list')">ANDREW'S LIST</div>
        </div>
        <div class="by-tag" v-if="activeFilter == 'tag'">
          <span
            v-for="(tag, i) in tagSlugsSorted" :key="i"
            :class="{active: filterTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
            @click="filterToggleTag(tag)"
            >{{ tagTextBySlug[tag] }}</span>
        </div>
      </div>

      <div class="tools">
        <transition-group name="tools-list" tag="div">
          <tool-tile v-for="(tool, i) in filteredTools" :key="tool.slug"
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
const REGIONS = ['fake', 'Latin America and the Caribbean']

export default {
  name: 'Toolbox',
  props: {
  },
  data: () => ({
    ALL,
    activeFilter: 'collection', // possibilities are: collection, region, selected, tag
    activeFilterAdvance: true,
    filterCollection: ALL,
    filterRegion: ALL,
    filterSelected: ALL,
    filterTag: ALL,
  }),
  components: {
    ToolTile,
  },
  computed: {
    sentence() {
      return `Show me ${this.$store}`
    },
    filteredToolsAllTags() {
      let tools = this.$store.state.tools.filter(
        t => t['module-type'] != 'snapshot' && t['module-type-effective'] != 'snapshot')

      if (this.filterCollection == 'saved')
        tools = tools.filter(t => this.$store.state.savedTools.has(t.slug))
      else if (this.filterCollection == 'selected' && this.filterSelected != ALL)
      // TODO: select actual filter
      //else if (COLLECTIONS.includes(this.filterCollection))
        tools = tools.filter(t => (this.$store.state.collectionLists || []).includes(t.slug))
      else if (config.toolTypes.includes(this.filterCollection))
        tools = tools.filter(t => t.type == this.filterCollection)

      if (this.filterCollection == 'story' && this.filterRegion != ALL)
        tools = tools.filter(t => (t.regions || []).includes(this.filterRegion))
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
    filterToggle(name, selected) {
      // TODO: what's exact activeFilterAdvance logic?
      if (this[`filter${name}`] == selected) {
        this[`filter${name}`] = ALL
      } else {
        this[`filter${name}`] = selected
        if (this.activeFilterAdvance) {
          console.log('b4', this.activeFilter, this.filterCollection)
          this.activeFilter = {
            collection: {
              story: 'region',
              saved: 'collection',
              selected: this.filterSelected}[this.filterCollection] || 'tag',
            region: 'tag',
            tag: 'tag',
          }[this.activeFilter]
          console.log('af', this.activeFilter)
        }
        if (name == 'Collection') this.filterTag = ALL
      }
    },
    filterReset() {
      console.log('filterReset')
      this.activeFilter = 'collection'
      this.activeFilterAdvance = true
      this.filterCollection = ALL
      this.filterRegion = ALL
      this.filterSelected = ALL
      this.filterTag = ALL
    },
    filterGuardAndUpdate(route, next) {
      // Validates and sets filters specified by a route. When passed the next function from a
      // route guard, re-routes to a path with a valid filter (or none).
      let { collection, filterA, filterB } = route.params
      let filterRegion, filterSelected, filterTag

      next = next || (() => {})
      let nextReplace = params => next({name: 'toolbox', replace: true, params})

      console.log('ROUTE GUARD:', collection, filterA, filterB)

      if (collection == 'saved') {
        if (filterA || filterB) return nextReplace({collection})
      } else if (collection == 'selected') {
        if (filterB) return nextReplace({collection, filterA})
        if (filterA && !COLLECTIONS.includes(filterA)) return nextReplace({collection})
        filterSelected = filterA
      } else if (collection == 'story') {
        if (filterB && !(filterB in this.tagTextBySlug))  return nextReplace({collection, filterA})
        if (filterA && !REGIONS.includes(filterA)) return nextReplace({collection})
        filterRegion = filterA
        filterTag = filterB
      } else if (collection in this.typeTextBySlug) {
        if (filterB) return nextReplace({collection, filterA})
        if (filterA && !(filterA in this.tagTextBySlug)) return nextReplace({collection})
        filterTag = filterA
      } else if (collection) {
        return nextReplace({})
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
      else this.filterReRoute()
    },
    filterToggleRegion(region) {
      if (this.filterCollection == 'story') {
        if (this.filterRegion != region) this.filterReRoute({collection: 'story', filterA: region})
        else this.filterReRoute({collection: 'story'})
      }
    },
    filterToggleSelected(selected) {
      if (this.filterCollection == 'selected') {
        if (this.filterSelected != selected) this.filterReRoute({collection: 'selected', filterA: selected})
        else this.filterReRoute({collection: 'selected'})
      }
    },
    filterToggleTag(tag) {
      if (this.filterTag != tag) this.filterReRoute(this.filterCollection == 'story'
        ? {collection: this.filterCollection, filterA: this.filterRegion, filterB: tag}
        : {collection: this.filterCollection, filterA: tag})
      else this.filterReRoute({collection: 'story'})
    },
  },
  beforeRouteUpdate(to, from, next) {
    console.log('route update')
    this.filterGuardAndUpdate(to, next)
  },
  beforeRouteEnter(to, from, next) {
    console.log('route enter')
    next(vm => vm.filterGuardAndUpdate(to, next))
  },
  created() {
    console.log('created toolbox', this.$route)
    // TODO: ensure that when built
    this.filterGuardAndUpdate(this.$route)
  },
};
</script>

<style lang="scss">
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
.tools {
  //direction: rtl;
}

// Transition-group animation
.tool {
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
