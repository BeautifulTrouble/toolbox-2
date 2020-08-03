<template>
  <div>
    <h1 v-if="$store.state.langRequested">Loading Toolbox...</h1>
    <div class="toolbox">
      <div class="filter">

        <!-- SENTENCE -->
        <div class="sentence contain">
          <span>Show me</span>
          <span>
            <span :class="{tab: true, active: ['collection', 'set'].includes(activeTab)}"
              @click="activeTab = routeCollection == 'set' ? 'set' : 'collection'">
              {{ $route.name == 'toolbox' ? 'everything' : (typeTextBySlug[routeCollection] || [, routeCollection])[1] }}
              <!-- TODO: this tab should not be reused for sets (it should have its own) -->
            </span>
          </span>
          <span v-if="routeCollection == 'story'">
            <span>from</span>
            <span :class="{tab: true, active: activeTab == 'region'}" @click="activeTab = 'region'">
              {{ routeRegion == 'all' ? 'the whole world' : routeRegion }}</span>
          </span>
          <span v-if="!['saved', 'set'].includes(routeCollection)">
            <span>about</span>
            <span :class="{tab: true, active: activeTab == 'tag'}" @click="activeTab = 'tag'">
              {{ tagTextBySlug[$route.params.tag] || 'everything' }}</span>
          </span>
          <img v-if="routeCollection != ALL || routeTag != ALL" svg-inline class="icon reset" src="./assets/reset.svg" alt="Reset" @click="resetFilter">
        </div>

        <!-- FILTER WIDGET -->
        <div class="widget-wrapper">
          <div class="widget contain">
            <transition name="fade" mode="out-in">

              <!-- BY COLLECTION -->
              <div class="by by-collection" v-if="activeTab == 'collection'">
                <div v-for="(value, key) in typeTextBySlug" :key="key"
                   :class="{block: true, [key]: true, active: routeCollection == key}" @click="selectCollection(key)">
                  <img svg-inline v-if="key == 'tactic'" class="icon" src="./assets/tactic.svg">
                  <img svg-inline v-if="key == 'theory'" class="icon" src="./assets/theory.svg">
                  <img svg-inline v-if="key == 'story'" class="icon" src="./assets/story.svg">
                  <img svg-inline v-if="key == 'principle'" class="icon" src="./assets/principle.svg">
                  <img svg-inline v-if="key == 'methodology'" class="icon" src="./assets/methodology.svg">
                  <h3>{{ value[1] }}</h3>
                  <p>{{ descriptionTextByLang[key] }}</p>
                </div>
                <div :class="{block: true, saved: true, active: routeCollection == 'saved'}" @click="selectCollection('saved')">
                  <img svg-inline class="icon smaller" src="./assets/favorite-active.svg">
                  <h3>My tools</h3>
                  <p>Your favorite tools</p>
                </div>
                <div :class="{block: true, set: true, active: routeCollection == 'set'}" @click="selectCollection('set')">
                  <img svg-inline class="icon" src="./assets/set.svg">
                  <h3>Sets</h3>
                  <p>Custom sets of tools</p>
                </div>
              </div>

              <!-- BY REGION -->
              <div class="by by-region" v-if="activeTab == 'region'">
                <div :class="{block: true, active: routeRegion == 'all'}" @click="selectRegion('all')">
                  <img svg-inline class="icon" src="./assets/regions/world.svg">
                  <p>THE WHOLE WORLD</p>
                </div>
                <div v-for="region in REGIONS" :key="region"
                  :class="{block: true, active: $route.params.region == slugify(region)}" @click="selectRegion(slugify(region))">
                  <img svg-inline v-if="region == 'Africa'" class="icon" src="./assets/regions/africa.svg">
                  <img svg-inline v-if="region == 'Asia'" class="icon" src="./assets/regions/asia.svg">
                  <img svg-inline v-if="region == 'Europe'" class="icon" src="./assets/regions/europe.svg">
                  <img svg-inline v-if="region == 'Latin America and the Caribbean'" class="icon" src="./assets/regions/latin-america-and-the-caribbean.svg">
                  <img svg-inline v-if="region == 'Middle East'" class="icon" src="./assets/regions/middle-east.svg">
                  <img svg-inline v-if="region == 'North America'" class="icon" src="./assets/regions/north-america.svg">
                  <img svg-inline v-if="region == 'Oceania'" class="icon" src="./assets/regions/oceania.svg">
                  <p>{{ region }}</p>
                </div>
              </div>

              <!-- BY SET -->
              <div class="by by-set" v-if="activeTab == 'set'">
                <h1>Backend connection required</h1>
                <div @click="selectSet('best-of')">BEST OF</div>
                <div @click="selectSet('andrews-list')">ANDREW'S LIST</div>
              </div>

              <!-- BY TAG -->
              <div class="by by-tag" v-if="activeTab == 'tag'" :key="'tag'">
                <span v-for="(tag, i) in tagSlugsSorted" :key="i"
                  :class="{active: routeTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
                  @click="selectTag(tag)">
                  {{ capitalize(tagTextBySlug[tag]) }}
                </span>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <transition-group name="tools-list" tag="div" class="tools">
        <tool-tile v-for="tool in filteredTools" :key="tool.slug" :tool="tool" :text="typeTextBySlug"/>
        <a v-if="!['set', 'saved'].includes(routeCollection)"
          class="tool-tile add-tool" :href="config.submissionForm" target="_blank" :key="-1">
          <div class="add">+</div>
          <h3>SUGGEST A TOOL</h3>
        </a>
        <div v-if="routeCollection == 'saved' && !$store.state.savedTools.size" class="tool-tile tool-add" :key="-2">
          LOOKS LIKE YOU HAVENT SAVED ANY TOOLS...
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
const SETS = ['andrews-list', 'best-of']
const REGIONS = ['Africa', 'Asia', 'Europe', 'Latin America and the Caribbean', 'Middle East', 'North America', 'Oceania']
const REGION_SLUGS = ['all', ...REGIONS.map(s => s.toLowerCase().replace(/ /g, '-'))]

export default {
  name: 'Toolbox',
  data: () => ({
    ALL,
    REGIONS,
    config,
    activeTab: 'collection',
  }),
  components: {
    ToolTile,
  },
  computed: {
    filteredToolsAllTags() {
      let tools = this.$store.state.tools.filter(t => t['module-type-effective'] != 'snapshot')
      if (this.routeCollection == 'saved') {
        tools = tools.filter(t => this.$store.state.savedTools.has(t.slug))
      } else if (this.routeCollection == 'set') {
      //} else if (this.routeCollection == 'set' && this.routeSet != ALL) {
        // TODO: implement real set filter (collectionLists isn't real)
        tools = tools.filter(t => (this.$store.state.collectionLists || ['action-logic']).includes(t.slug))
      } else if (config.toolTypes.includes(this.routeCollection)) {
        tools = tools.filter(t => t.type == this.routeCollection)
      }
      if (this.routeCollection == 'story' && this.routeRegion != ALL) {
        tools = tools.filter(t => {
          let regionSlugs = t.regions.map(this.slugify) || []
          return regionSlugs.includes(this.routeRegion) || regionSlugs.includes('worldwide')
        })
      }
      return tools
    },
    filteredTools() {
      let tools = this.filteredToolsAllTags
      if (this.routeTag != ALL)
        tools = tools.filter(t => (t.tags || []).includes(this.routeTag))
      return tools
    },
    tagSlugsSorted() { // Sorted in current language
      return Object.keys(this.tagTextBySlug)
              .sort((a, b) => this.tagTextBySlug[a].localeCompare(this.tagTextBySlug[b]))
    },
    tagSlugsAvailable() {
      return this.filteredToolsAllTags
        .map(t => t.tags)
        .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a, new Set([]))
    },
    // Translated text
    descriptionTextByLang() {
      return descriptionTextByLang[this.$store.state.lang]
    },
    tagTextBySlug() {
      return tagTextByLang[this.$store.state.lang]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    },
    // Refactor
    routeCollection() {
      return this.$route.name.replace(/^toolbox-?/, '') || ALL
    },
    routeRegion() {
      return this.$route.params.region || ALL
    },
    routeSet() {
      return this.$route.params.set || ALL
    },
    routeTag() {
      return this.$route.params.tag || ALL
    },
  },
  methods: {
    resetFilter() {
      this.activeTab = 'collection'
      this.$router.push({name: 'toolbox'})
    },
    selectCollection(collection) {
      let name = `toolbox-${collection}`
      if (this.$route.name != name)
        this.$router.push({name: `toolbox-${collection}`})
      else
        this.$router.push({name: 'toolbox'})
    },
    selectRegion(region) {
      if (this.$route.params.region != region)
        this.$router.push({name: this.$route.name, params: {region}})
    },
    selectSet(set) {
      if (this.$route.params.set != set)
        this.$route.push({name: this.$route.name, params: {set}})
    },
    selectTag(tag) {
      tag = this.$route.params.tag != tag ? tag : undefined
      this.$router.push({
        name: this.routeCollection == ALL ? 'toolbox' : this.$route.name,
        params: {...this.$route.params, tag}
      })
    },
    guardRoute(route, next) {
      let { query, region, set, tag } = route.params

      // Reject invalid regions, tags, or sets. Fall back to top-level toolbox.
      if ((region && !REGION_SLUGS.includes(region)) ||
          (tag && !(tag in this.tagTextBySlug)) ||
          (set && !SETS.includes(set)))
        return next({name: 'toolbox', replace: true})

      let tabinfo = (s) => this.$store.commit('setDebug', `Toolbox tab condition: ${s}`)
      // Set an appropriate activeTab (one of: collection, region, set, tag)
      if (query || region || tag) {
        tabinfo('query/region/tag')
        this.activeTab = 'tag'
      } else if (this.routeCollection == 'set') {
        tabinfo('set')
        this.activeTab = 'set'
      } else if (this.routeCollection == 'story') {
        tabinfo('story')
        this.activeTab = 'region'
      } else if ([ALL, 'saved'].includes(this.routeCollection)) {
        tabinfo('all/saved')
        this.activeTab = 'collection'
      } else {
        tabinfo('default')
        this.activeTab = 'tag'
      }
      next()
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.guardRoute(to, next)
  },
  beforeRouteEnter(to, from, next) {
    next(vm => vm.guardRoute(to, next))
  },
  created() {
    console.log('created toolbox', this.$route)
    // TODO: Determine whether this is needed in production (it's needed for the webpack dev server)
    this.guardRoute(this.$route, () => {})
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
      width: 7rem;
      margin: 0;
    }
    .block {
      flex: 1 2 12.5%;
      p {
        min-height: 15%;
      }
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
        /*
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
        */
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
  .set {
    fill: $set;
  }
}
.tools {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative; // For transition animation
  //margin: .25rem -.25rem;

  // These styles should override the ones defined in ToolTile.vue
  .tool-tile {
    flex: 0 0 20%;
    height: 20vw;
    //border: .25rem solid white;
  }
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
