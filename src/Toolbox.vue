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
             :class="{active: filterCollection == key}">
            <h3 @click="toggleFilter('Collection', key)">{{ value[1] }}</h3>
          </div>
          <div :class="{active: filterCollection == 'saved'}">
            <h3 @click="toggleFilter('Collection', 'saved')">MY TOOLS</h3>
          </div>
          <div :class="{active: filterCollection == 'selected'}">
            <h3 @click="toggleFilter('Collection', 'selected')">SELECTED TOOLS</h3>
          </div>
        </div>
        <div class="by-region" v-if="activeFilter == 'region'">

        </div>
        <div class="by-tag" v-if="true || activeFilter == 'tag'">
          <span
            v-for="(tag, i) in tagSlugsSorted" :key="i"
            :class="{active: filterTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
            @click="toggleFilter('Tag', tag)"
            >{{ tagTextBySlug[tag] }}</span>
        </div>
      </div>

      <div class="tools">
        <transition-group name="tools-list" tag="div">
          <div class="tool"
            v-for="(tool, i) in filteredTools" :key="tool.slug"
            v-lazy:background-image="`https://beautifulrising.org/tile-${tool.image}`"
            @click="$store.dispatch('TOOL_TOGGLE', tool.slug)">
            <div>
              {{ tool.title }}{{ $store.state.savedTools.has(tool.slug) ? '@' : '.' }}
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
    filteredToolsAnyTag() {
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
      let tools = this.filteredToolsAnyTag
      if (this.filterTag != ALL)
        tools = tools.filter(t => (t.tags || []).includes(this.filterTag))
      return tools
    },
    tagSlugsSorted() { // Sorted in current language
      return Object.keys(this.tagTextBySlug)
              .sort((a, b) => this.tagTextBySlug[a].localeCompare(this.tagTextBySlug[b]))
    },
    tagSlugsAvailable() { // Relies on filteredToolsAnyTag to
      return this.filteredToolsAnyTag
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
    toggleFilter(name, selected) {
      if (name == 'Collection') this.filterTag = ALL
      this[`filter${name}`] = this[`filter${name}`] == selected ? ALL : selected
    },
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
.tool {
  transition: all .2s;
  flex: 0 0 12.5%;
  height: 140px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  border: 2px dashed #777;
  overflow: hidden;
  > div {
    background: transparentize(white, .50);
  }
  &[lazy="loading"] {
    opacity: 0;
    //background: yellow; // TODO: remove
  }
}
// Transition-group animation
.tools-list-move { // transition is on .tool
  //transition: all .2s;
}
.tools-list-leave-active {
  position: absolute;
  opacity: 0;
  // X-perry-mints
  //left: 50% - (12.5% / 2);
  //left: 0; right: 0;
  //margin: 0 auto 0 auto;
  //top: 0; bottom: 0;
  //position: relative;
  //transform: scale3d(0,0,0);
}
.tools-list-enter-active, .tools-list-leave-active {
  opacity: 1;
}
.tools-list-enter, .tools-list-leave-to {
  opacity: 0;
}
</style>
