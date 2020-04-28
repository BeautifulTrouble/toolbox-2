<template>
  <div>
    <h1 v-if="$store.state.langRequested">Loading Toolbox...</h1>
    <div class="toolbox">
      <div class="sentence">
        <div @click="filterReset">
          ({{ activeFilter}}; {{ filterCollection }}): {{ sentence }}
        </div>
      </div>

      <div class="filter">
        <div class="by-collection" v-if="activeFilter == 'collection'">
          <div v-for="(value, key) in typeTextBySlug" :key="key"
             :class="{active: filterCollection == key}">
            <h3 @click="filterToggle('Collection', key)">{{ value[1] }}</h3>
          </div>
          <div :class="{active: filterCollection == 'saved'}">
            <h3 @click="filterToggle('Collection', 'saved')">MY TOOLS</h3>
          </div>
          <div :class="{active: filterCollection == 'selected'}">
            <h3 @click="filterToggle('Collection', 'selected')">SELECTED TOOLS</h3>
          </div>
        </div>
        <div class="by-region" v-if="activeFilter == 'region'">
          <div @click="filterToggle('Region', 'Europe')">EUROPE</div>
        </div>
        <div class="by-tag" v-if="activeFilter == 'tag'">
          <span
            v-for="(tag, i) in tagSlugsSorted" :key="i"
            :class="{active: filterTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
            @click="filterToggle('Tag', tag)"
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
const REGIONS = ['Latin America and the Caribbean']

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
      let tools = (this.$store.state.tools || [])
        .filter(t => t['module-type'] != 'snapshot' && t['module-type-effective'] != 'snapshot')

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
      this.activeFilter = 'collection'
      this.activeFilterAdvance = true
      this.filterCollection = ALL
      this.filterRegion = ALL
      this.filterSelected = ALL
      this.filterTag = ALL
    },
    reRoute(params) {
      this.$router.replace({name: 'toolbox', params})
    },
    filterUpdateFromRoute(route) {
      // Validate filters from path
      /*
      let { collection, filterA, filterB } = route.params
      let fC, fR, fS, fT

      // Is it a valid filterB?
      if (filterB && (collection != 'story' || !(filterB in this.tagTextBySlug)))
        return this.$router.replace({name: 'toolbox', params: {collection, filterA}})

      if (collection == 'saved') {
        if (filterA)
          return this.$router.replace({name: 'toolbox', params: {collection}})
      } else if (collection == 'selected') {
        if (filterA && !COLLECTIONS.includes(filterA))
          return this.$router.replace({name: 'toolbox', params: {collection}})
        fS = filterA
      } else if (collection == 'story') {
        if (filterA && !REGIONS.includes(filterA))
          return this.$router.replace({name: 'toolbox', params: {collection}})
        fR = filterA
        fT = filterB
      } else if (collection in this.typeTextBySlug) {
        if (filterA && !(filterA in this.tagTextBySlug))
          return this.$router.replace({name: 'toolbox', params: {collection}})
        fT = filterA
      } else {
        return this.$router.replace({name: 'toolbox'})
      }
      this.filterCollection = collection || ALL
      this.filterRegion = fR || ALL
      this.filterSelected = fS || ALL
      this.filterTag = fT || ALL

        console.log('filter:', collection, filterA, filterB, this.filterCollection, this.filterRegion,
      this.filterSelected, this.filterTag)
      */
      let { collection, filterA, filterB } = route.params
      let filterRegion, filterSelected, filterTag

      if (collection == 'saved') {
        if (filterA || filterB) return this.reRoute({collection})
      } else if (collection == 'selected') {
        if (filterB)
          return this.reRoute({collection, filterA})
        if (filterA && !COLLECTIONS.includes(filterA))
          return this.reRoute({collection})
        filterSelected = filterA
      } else if (collection == 'story') {
        if (filterB && !(filterB in this.tagTextBySlug))
          return this.reRoute({collection, filterA})
        if (filterA && !REGIONS.includes(filterA))
          return this.reRoute({collection})
        filterRegion = filterA
        filterTag = filterB
      } else if (collection in this.typeTextBySlug) {
        if (filterB)
          return this.reRoute({collection, filterA})
        if (filterA && !(filterA in this.tagTextBySlug))
          return this.reRoute({collection})
        filterTag = filterA
      } else {
        return this.reRoute({})
      }
      this.filterCollection = collection || ALL
      this.filterRegion = filterRegion || ALL
      this.filterSelected = filterSelected || ALL
      this.filterTag = filterTag || ALL

        console.log('filter:', collection, filterA, filterB, this.filterCollection, this.filterRegion,
      this.filterSelected, this.filterTag)
    }
  },
  watch: {
    $route(to, from) {
      this.filterUpdateFromRoute(to)
    },
  },
  created() {
    console.log('created toolbox', this.$route)
    this.filterUpdateFromRoute(this.$route)
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
