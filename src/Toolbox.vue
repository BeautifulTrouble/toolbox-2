<template>
  <div>
    <h1 v-if="$store.state.langRequested">Loading Toolbox...</h1>
    <div class="toolbox">
      <div class="sentence">
        <div>
          {{ sentence }}
        </div>
      </div>

      <div class="filter">
        <div class="by-collection" v-if="activeFilter == 'collection'">
          <div v-for="(value, key) in typeTextBySlug" :key="key"
             :class="{collection: true, active: filterCollection == key}">
            <h3 @click="toggleFilter('Collection', key)">{{ value[1] }}</h3>
          </div>
          <div :class="{collection: true, active: filterCollection == 'saved'}">
            <h3 @click="toggleFilter('Collection', 'saved')">MY TOOLS</h3>
          </div>
          <div :class="{collection: true, active: filterCollection == 'selected'}">
            <h3 @click="toggleFilter('Collection', 'selected')">SELECTED TOOLS</h3>
          </div>
        </div>
        <div class="by-region" v-if="activeFilter == 'region'">

        </div>
        <div class="by-tag" v-if="activeFilter == 'tag'">
        </div>
      </div>

      <div class="tools">
        <transition-group name="tools-list" tag="div">
          <div class="tool"
            v-for="(tool, i) in filteredTools" :key="`tool-${i}`"
            v-lazy:background-image="`https://beautifulrising.org/tile-${tool.image}`"
            @click="log(tool)">
            <div>
            {{ tool.title }}
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
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
    filterCollection: ALL,
    filterRegion: ALL,
    filterSelected: ALL,
    filterTag: ALL,
  }),
  computed: {
    sentence() {
      return `Show me ${this.$store}`
    },
    filteredTools() {
      let tools = (this.$store.state.tools || [])
        .filter(t => t['module-type'] != 'snapshot' && t['module-type-effective'] != 'snapshot')

      // Collection
      if (this.filterCollection == 'saved')
        tools = tools.filter(t => (this.$store.state.savedTools || []).includes(t.slug))
      else if (this.filterCollection == 'selected' && this.filterSelected != ALL)
      // TODO: select actual filter
      //else if (COLLECTIONS.includes(this.filterCollection))
        tools = tools.filter(t => (this.$store.state.collectionLists || []).includes(t.slug))
      else if (config.toolTypes.includes(this.filterCollection))
        tools = tools.filter(t => t.type == this.filterCollection)

      // Region
      if (this.filterCollection == 'story' && this.filterRegion != ALL)
        tools = tools.filter(t => (t.regions || []).includes(this.filterRegion))

      // Tag
      if (this.filterTag != ALL)
        tools = tools.filter(t => (t.tags || []).includes(this.filterTag))

      return tools
    },
    /* // This becomes availableTags
    allTags() {
      return [...this.$store.state.tools
                  .map(T => T.tags)
                  .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a,
                    new Set([]))
      ].sort()
    },
    */
    tagSlugsSorted() { // Sorted in current language
      return Object.keys(this.tagTextBySlug)
              .sort((a, b) => this.tagTextBySlug[a].localeCompare(this.tagTextBySlug[b]))
    },
    tagSlugsAvailable() {
      return this.filteredTools
    },
    tagTextBySlug() {
      return tagTextByLang[this.$store.state.lang]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    }
  },
  methods: {
    log: console.log,
    __tag(tag) { return this.tagTextBySlug[tag] || '' },
    toggleFilter(name, selected) {
      this[`filter${name}`] = this[`filter${name}`] == selected ? ALL : selected
    }

  },
  watch: {
  },
  created() {
    console.log('created toolbox')
  },
};
</script>

<style lang="scss">
.active {
  text-decoration: underline;
}
.tools > div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.tool {
  flex: 0 0 12.5%;
  height: 200px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-opacity: 50%;
  background-size: cover;
  border: 2px dashed #777;
  overflow: hidden;
  > div {
    background: transparentize(white, .50);
  }
}
// Transition-group animation
.tools-list-enter-active, .tools-list-leave-active {
  transition: all .2s;
  opacity: 1;
}
.tools-list-enter, .tools-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
