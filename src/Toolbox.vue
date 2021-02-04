<template>
  <div class="toolbox">
    <div class="filter-pane">

      <!-- SENTENCE -->
      <div class="sentence">
        <span>Show me</span>
        <span>
          <span :class="{tab: true, active: activeTab == 'collection'}" @click="activeTab = 'collection'">
            {{ $route.name == 'toolbox' ? 'everything' : (typeTextBySlug[routeCollection] || [, tabText(routeCollection)])[1] }}
          </span>
        </span>
        <!-- Extra tab for regions -->
        <span v-if="routeCollection == 'story'">
          <span>from</span>
          <span :class="{tab: true, active: activeTab == 'region'}" @click="activeTab = 'region'">
            {{ routeRegion == 'all' ? 'the whole world' : routeRegion }}</span>
        </span>
        <!-- Tab visisble for all except saved -->
        <span v-if="routeCollection != 'saved'">
          <span>about</span>
          <span :class="{tab: true, active: ['tag', 'set'].includes(activeTab)}" @click="activeTab = routeCollection == 'set' ? 'set' : 'tag'">
            {{ tagTextBySlug[$route.params.tag]
              || (routeCollection == 'set' ? setTextBySlug[routeSet] : null)
              || $route.params.query
              || 'everything' }}</span>
        </span>
        <img v-if="routeCollection != ALL || routeTag != ALL" svg-inline class="bt-icon reset" src="./assets/reset.svg" alt="Reset" @click="resetFilter">
      </div>

      <!-- FILTER WIDGET -->
      <div class="widget-wrapper">
        <div class="widget">
          <transition name="fade" mode="out-in">

            <!-- BY COLLECTION -->
            <div class="by by-collection" v-if="activeTab == 'collection'">
              <div v-for="(value, key) in typeTextBySlug" :key="key"
                 :class="{block: true, [key]: true, active: routeCollection == key}" @click="selectCollection(key)">
                <img svg-inline v-if="key == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
                <img svg-inline v-if="key == 'theory'" class="bt-icon" src="./assets/theory.svg">
                <img svg-inline v-if="key == 'story'" class="bt-icon" src="./assets/story.svg">
                <img svg-inline v-if="key == 'principle'" class="bt-icon" src="./assets/principle.svg">
                <img svg-inline v-if="key == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
                <div class="h3">{{ value[1] }}</div>
                <p>{{ descriptionTextByLang[key] }}</p>
              </div>
              <div :class="{block: true, saved: true, active: routeCollection == 'saved'}" @click="selectCollection('saved')">
                <img svg-inline class="bt-icon" src="./assets/favorite-active.svg">
                <div class="h3">My tools</div>
                <p>Your favorite tools</p>
              </div>
              <div :class="{block: true, set: true, active: routeCollection == 'set'}" @click="selectCollection('set')">
                <img svg-inline class="bt-icon" src="./assets/set.svg">
                <div class="h3">Sets</div>
                <p>Custom sets of tools</p>
              </div>
            </div>

            <!-- BY REGION -->
            <div class="by by-region" v-if="activeTab == 'region'">
              <div :class="{block: true, active: routeRegion == 'all'}" @click="selectRegion('all')">
                <img svg-inline class="bt-icon" src="./assets/regions/world.svg">
                <p>THE WHOLE WORLD</p>
              </div>
              <div v-for="region in REGIONS" :key="region"
                :class="{block: true, active: $route.params.region == slugify(region)}" @click="selectRegion(slugify(region))">
                <img svg-inline v-if="region == 'Africa'" class="bt-icon" src="./assets/regions/africa.svg">
                <img svg-inline v-if="region == 'Asia'" class="bt-icon" src="./assets/regions/asia.svg">
                <img svg-inline v-if="region == 'Europe'" class="bt-icon" src="./assets/regions/europe.svg">
                <img svg-inline v-if="region == 'Latin America and the Caribbean'" class="bt-icon" src="./assets/regions/latin-america-and-the-caribbean.svg">
                <img svg-inline v-if="region == 'Middle East'" class="bt-icon" src="./assets/regions/middle-east.svg">
                <img svg-inline v-if="region == 'North America'" class="bt-icon" src="./assets/regions/north-america.svg">
                <img svg-inline v-if="region == 'Oceania'" class="bt-icon" src="./assets/regions/oceania.svg">
                <p>{{ region }}</p>
              </div>
            </div>

            <!-- BY SET -->
            <div class="by by-set" v-if="activeTab == 'set'">
              <div v-for="(set, setSlug) in setsBySlug" :key="setSlug"
                 :class="{block: true, [setSlug]: true, active: routeSet == setSlug}"
                 @click="selectSet(setSlug)">
                <img svg-inline class="bt-icon set" src="./assets/set.svg">
                <div class="h3">{{ setTextBySlug[setSlug] }}</div>
                <p>DESCRIPTION (Don't make use of all the space, it's not actually available at all screen sizes)</p>
              </div>
            </div>

            <!-- BY TAG -->
            <div class="by by-tag" v-if="activeTab == 'tag'" :key="'tag'">
              <span v-for="(tag, i) in tagSlugsSorted" :key="i"
                :class="{active: routeTag == tag, disabled: !tagSlugsAvailable.has(tag)}"
                @click="selectTag(tag)">
                {{ capitalize(tagTextBySlug[tag]) }}
              </span>
              <span v-if="$route.params.query && $route.name == 'toolbox-search'" class="active search-tag">
                {{ $route.params.query }}
              </span>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <transition-group name="tools-list" tag="div" class="tools">
      <tool-tile v-for="tool in filteredTools" :key="tool.slug" :tool="tool" :text="typeTextBySlug" />
      <tool-tile v-if="!['set', 'saved'].includes(routeCollection)" :key="1" :alt="'suggest'" />
      <tool-tile v-if="routeCollection == 'saved' && !$store.state.savedTools.size" :key="2" :alt="'nosave'" />
      <div class="filler-squares" :key="3">
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
        <div class="filler-square tool-tile" />
      </div>
    </transition-group>
  </div>
</template>

<script>
import ToolTile from './ToolTile'
import descriptionTextByLang from './descriptions'
import tagTextByLang from './tags'
import typeTextByLang from './types'
import sets from './sets'

const ALL = 'all'
const REGIONS = ['Africa', 'Asia', 'Europe', 'Latin America and the Caribbean', 'Middle East', 'North America', 'Oceania']
const REGION_SLUGS = ['all', ...REGIONS.map(s => s.toLowerCase().replace(/ /g, '-'))]

export default {
  name: 'Toolbox',
  data: () => ({
    ALL,
    REGIONS,
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
        tools = tools.filter(t => (this.setsBySlug[this.routeSet] || []).includes(t.slug))
      } else if (this.config.toolTypes.includes(this.routeCollection)) {
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
      // TODO: why does the toolbox in other languages show snapshots?
      //       is it because some Array isn't triggering the re-compute of these propreties?
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
    // Sets (see also: setTextBySlug)
    setsBySlug() {
      return Object.fromEntries(Object.entries(sets).map(
        ([k, v]) => [this.slugify(k), v]))
    },
    // Translated text
    descriptionTextByLang() {
      return descriptionTextByLang[this.$store.state.lang]
    },
    setTextBySlug() {
      // TODO: use translated text
      return Object.fromEntries(Object.entries(sets).map(
        ([k, ]) => [this.slugify(k), k]))
    },
    tagTextBySlug() {
      return tagTextByLang[this.$store.state.lang]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    },
    // Refactor
    routeSet() {
      // This is dissimilar to other route* computed properties because it doesn't default to ALL
      return this.$route.params.set || Object.keys(this.setsBySlug)[0]
    },
    routeCollection() {
      return this.$route.name.replace(/^toolbox-?/, '') || ALL
    },
    routeRegion() {
      return this.$route.params.region || ALL
    },
    routeTag() {
      return this.$route.params.tag || ALL
    },
  },
  methods: {
    foo(x) {
      console.log(x)
      this.activeTab = x
    },
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
        this.$router.push({name: this.$route.name, params: {set}})
    },
    selectTag(tag) {
      tag = this.$route.params.tag != tag ? tag : undefined
      this.$router.push({
        name: [ALL, 'search'].includes(this.routeCollection) ? 'toolbox' : this.$route.name,
        params: {...this.$route.params, tag}
      })
    },
    guardRoute(route, next) {
      let { query, region, set, tag } = route.params

      // Reject invalid regions, tags, or sets. Fall back to top-level toolbox.
      if ((region && !REGION_SLUGS.includes(region)) ||
          (tag && !(tag in this.tagTextBySlug)) ||
          (set && !(set in this.setsBySlug)))
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
    tabText(s) {
      return this.typeTextBySlug[s] || {saved: 'my tools', search: 'search results', set: 'a set'}[s] || s
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

.toolbox {
  padding-top: 4rem;

  // Mobile header adjustments for the Squarespace theme
  @media #{$ss-mobile-header} {
    padding-top: 10rem;
  }
}
.filter-pane {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.sentence {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  font-size: 1.25rem;
  height: 2rem;
  margin-top: 2rem;
  margin-bottom: .25rem;
  @include breakpoint($md) {
    font-size: 1rem;
  }
  .tab {
    font-size: 1.4rem;
    font-family: 'ff-good-headline-web-pro-condensed';
    text-transform: uppercase;
    font-weight: bold;
    padding: .5rem 1rem .7rem 1rem;
    position: relative;
    z-index: 1;
    margin: 0 .5rem;
    cursor: pointer;
    @include breakpoint($md) {
      padding: .5rem .5rem .7rem .5rem;
      margin: 0 .25rem;
    }
    &.active {
      background-color: $bggray;
      border-right: 1px solid $bgdark2;
      border-radius: 5px 5px 0 0;
    }
  }
  .bt-icon {
    margin: 0 .5rem;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    fill: $text;
    transition: fill .2s linear;
    @include breakpoint($upper) {
      &:hover {
        fill: black;
      }
    }
  }
}
.widget-wrapper {
  border: 1px solid $bgdark1;
  border-radius: 5px;
  width: 100%;
  max-width: 78rem;
}
.widget {
  background-color: $bggray;
  border-left: 1px solid white;
  border-top: 1px solid white;
  border-radius: 5px;
  border-right: 1px solid $bgdark2;

  .block {
    border-left: 1px solid white;
    height: 18rem;

    cursor: pointer;
    flex: 2 0 14%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @include breakpoint($md) {
      height: 10rem;
      flex: 0 2 25%;
    }
    &.active {
      background: $bgdark1;
    }
    p {
      margin-bottom: 0;
      min-height: 45%;
      @include breakpoint($md) {
        font-size: .8rem;
        margin-top: .25rem;
      }
      @include breakpoint($lg) {
        font-size: .9rem;
        line-height: 1.1;
      }
    }
  }
  .h3 {
    margin: 0;
    text-align: center;
    word-break: break-all // #BlackLivesMatter
  }
  .by {
    display: flex;
    .block {
      padding: 1rem;
      text-align: center;
      @include breakpoint($lg) {
        padding: .75rem;
      }
    }
    @include breakpoint($md) {
      flex-wrap: wrap;
    }
  }
  .by-collection {
    .block {
      @include breakpoint($md) {
        flex: 0 0 33.3%;
        &.set, &.saved {
          flex: 0 2 16.5%;
        }
      }
    }
  }
  .by-region {
    .bt-icon {
      height: 8rem;
      max-height: 8rem;
      width: 7rem;
      margin: 0;
    }
    .block {
      flex: 1 2 12.5%;
      @include breakpoint($md) {
        flex: 0 0 25%;
      }
      p {
        min-height: 15%;
      }
    }
  }
  .by-tag {
    padding: 1rem 3rem;
    flex-wrap: wrap;
    flex-direction: column;
    height: 18rem;
    justify-content: flex-start;
    align-items: space-between;

    @include breakpoint($md) {
      height: 20rem;
      font-size: .9rem;
    }
    span {
      cursor: pointer;
      min-height: 1.5rem;
      padding: 0 1rem;
      display: inline-flex;
      align-items: center;
      &.active {
        font-weight: bold;
        position: relative;
      }
      &.disabled {
        color: $bgdark2;
        pointer-events: none;
      }
    }
  }
  .by-set {
    fill: $set;
    .block {
      @include breakpoint($md) {
        height: 20rem;
      }
    }
  }
  .bt-icon {
    width: 4rem;
    max-height: 4rem;
    margin: .5rem;
    @include breakpoint($xl) {
      width: 6rem;
    }
    @include breakpoint($md) {
      margin: .25rem;
      max-height: 2rem;
    }
  }
}
.tools {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative; // For transition animation
  margin: 2px -2px; // For toolbox margins

  // These styles override the ones defined in ToolTile.vue
  .tool-tile {
    // Flex-basis determines the number of tiles per row
    flex: 0 0 25%;
    height: 25vw;
    border: 2px solid transparent; // For toolbox margins

    @include breakpoint($md) {
      flex: 0 0 33.3%;
      height: 33.3vw;
    }
    @include breakpoint($xl) {
      flex: 0 0 20%;
      height: 20vw;
    }
    @include breakpoint($xxl) {
      flex: 0 0 12.5%;
      height: 12.5vw;
    }
  }
}
.filler-squares {
  z-index: -1;
  position: absolute;
  bottom: 0;
  display: flex;
  width: 100%;
  overflow-x: hidden;
  .filler-square {
    border: 2px solid white;
    box-shadow: 0 0 0 1px $bggray inset;
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
