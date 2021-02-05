<template>
  <div class="toolbox">
    <div class="filter-pane">

      <!-- SENTENCE -->
      <div class="sentence">
        <span class="plain">{{ text['site.sentence.showme'] }}</span>
        <span>
          <span :class="{tab: true, active: activeTab == 'collection'}" @click="activeTab = 'collection'">
            {{ $route.name == 'toolbox'
                ? text['site.sentence.everything']
                : text[`type.${routeCollection}${['saved', 'set', 'search'].includes(routeCollection) ? '' : '.plural'}`] }}
          </span>
        </span>
        <!-- Extra tab for regions -->
        <span v-if="routeCollection == 'story'">
          <span class="plain">{{ text['site.sentence.from'] }}</span>
          <span :class="{tab: true, active: activeTab == 'region'}" @click="activeTab = 'region'">
            {{ text[`type.story.region.${routeRegion}`] }}
          </span>
        </span>
        <!-- Tab visisble for all except saved -->
        <span v-if="routeCollection != 'saved'">
          <span class="plain">{{ text['site.sentence.about'] }}</span>
          <span :class="{tab: true, active: ['tag', 'set'].includes(activeTab)}" @click="activeTab = routeCollection == 'set' ? 'set' : 'tag'">
            {{ ($route.params.tag && text[`tag.${$route.params.tag}`])
              || (routeCollection == 'set' && text[`set.${routeSet}`])
              || $route.params.query
              || text['site.sentence.everything'] }}
          </span>
        </span>
        <img v-if="routeCollection != ALL || routeTag != ALL" svg-inline class="bt-icon reset" src="./assets/reset.svg" :alt="text['site.sentence.reset']" @click="resetFilter">
      </div>

      <!-- FILTER WIDGET -->
      <div class="widget-wrapper">
        <div class="widget">
          <transition name="fade" mode="out-in">

            <!-- BY COLLECTION -->
            <div class="by by-collection" v-if="activeTab == 'collection'">
              <div v-for="type in types" :key="type"
                 :class="{block: true, [type]: true, active: routeCollection == type}" @click="selectCollection(type)">
                <img svg-inline v-if="type == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
                <img svg-inline v-if="type == 'theory'" class="bt-icon" src="./assets/theory.svg">
                <img svg-inline v-if="type == 'story'" class="bt-icon" src="./assets/story.svg">
                <img svg-inline v-if="type == 'principle'" class="bt-icon" src="./assets/principle.svg">
                <img svg-inline v-if="type == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
                <div class="h3">{{ text[`type.${type}.plural`] }}</div>
                <p>{{ text[`type.${type}.description`] }}</p>
              </div>
              <div :class="{block: true, saved: true, active: routeCollection == 'saved'}" @click="selectCollection('saved')">
                <img svg-inline class="bt-icon" src="./assets/favorite-active.svg">
                <div class="h3">{{ text['type.saved'] }}</div>
                <p>{{ text['type.saved.description'] }}
                  <span @click.stop="$store.state.savedTools.size && downloadPDF($store.state.savedTools)"
                    :class="{download: true, disabled: !$store.state.savedTools.size}"
                    :title="text[$store.state.savedTools.size ? 'site.downloadpdf' : 'site.saved.description']">
                    <img svg-inline class="bt-icon" src="./assets/download.svg">
                    <div>{{ text['site.downloadpdf'] }}</div>
                  </span>
                </p>
              </div>
              <div :class="{block: true, set: true, active: routeCollection == 'set'}" @click="selectCollection('set')">
                <img svg-inline class="bt-icon" src="./assets/set.svg">
                <div class="h3">{{ text['type.set.plural'] }}</div>
                <p>{{ text['type.set.description'] }}</p>
              </div>
            </div>

            <!-- BY REGION -->
            <div class="by by-region" v-if="activeTab == 'region'">
              <div :class="{block: true, active: routeRegion == 'all'}" @click="selectRegion('all')">
                <img svg-inline class="bt-icon" src="./assets/regions/world.svg">
                <p>{{ text['type.story.region.all'] }}</p>
              </div>
              <div v-for="region in regions" :key="region"
                :class="{block: true, active: $route.params.region == region}" @click="selectRegion(region)">
                <img svg-inline v-if="region == 'africa'" class="bt-icon" src="./assets/regions/africa.svg">
                <img svg-inline v-if="region == 'asia'" class="bt-icon" src="./assets/regions/asia.svg">
                <img svg-inline v-if="region == 'europe'" class="bt-icon" src="./assets/regions/europe.svg">
                <img svg-inline v-if="region == 'latin-america-and-the-caribbean'" class="bt-icon" src="./assets/regions/latin-america-and-the-caribbean.svg">
                <img svg-inline v-if="region == 'middle-east'" class="bt-icon" src="./assets/regions/middle-east.svg">
                <img svg-inline v-if="region == 'north-america'" class="bt-icon" src="./assets/regions/north-america.svg">
                <img svg-inline v-if="region == 'oceania'" class="bt-icon" src="./assets/regions/oceania.svg">
                <p>{{ text[`type.story.region.${region}`] }}</p>
              </div>
            </div>

            <!-- BY SET -->
            <div class="by by-set" v-if="activeTab == 'set'">
              <div v-for="(set, slug) in sets" :key="slug"
                 :class="{block: true, set: true, [slug]: true, active: routeSet == slug}"
                 @click="selectSet(slug)">
                <img svg-inline class="bt-icon set" src="./assets/set.svg">
                <div class="h3 set">{{ text[`set.${slug}`] }}</div>
                <p>{{ text[`set.${slug}.description`] }}</p>
              </div>
            </div>

            <!-- BY TAG -->
            <div class="by by-tag" v-if="activeTab == 'tag'" :key="'tag'">
              <span v-for="(tag, i) in sortedTags" :key="i"
                :class="{active: routeTag == tag, disabled: !tagsAvailable.has(tag)}"
                @click="selectTag(tag)">
                {{ text[`tag.${tag}`] }}
              </span>
              <span v-if="$route.params.query && $route.name == 'toolbox-search'" class="active search-tag">
                <div>{{ text['site.search'] }}:</div>
                <input v-model="$route.params.query">
              </span>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <transition-group name="tools-list" tag="div" class="tools">
      <tool-tile v-for="tool in filteredTools" :key="tool.slug" :tool="tool" :text="text" />
      <tool-tile v-if="!['set', 'saved'].includes(routeCollection)" :key="1" :text="text" :alt="'suggest'" />
      <tool-tile v-if="routeCollection == 'saved' && !$store.state.savedTools.size" :key="2" :text="text" :alt="'nosave'" />
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
import sets from './sets'
import textByLang from './text'


const ALL = 'all'


export default {
  name: 'Toolbox',
  data: () => ({
    ALL,
    activeTab: 'collection',
    regions: ['africa', 'asia', 'europe', 'latin-america-and-the-caribbean', 'middle-east', 'north-america', 'oceania'],
    sets,
    types: ['story', 'tactic', 'principle', 'theory', 'methodology'],
  }),
  components: {
    ToolTile,
  },
  computed: {
    filteredToolsAllTags() {
      let tools = this.$store.state.tools.filter(t => /(full|gallery|snapshot)/.test(t['module-type-effective']))
      if (this.routeCollection == 'saved') {
        tools = tools.filter(t => this.$store.state.savedTools.has(t.slug))
      } else if (this.routeCollection == 'set') {
        tools = tools.filter(t => (this.sets[this.routeSet] || []).includes(t.slug))
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
    routeSet() { // This is dissimilar to other route* computed properties because it doesn't default to ALL
      return this.$route.params.set || Object.keys(this.sets)[0]
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
    sortedTags() {
      return Object.keys(this.text)
              .filter(k => /^tag\./.test(k))
              .sort((a, b) => this.text[a].localeCompare(this.text[b]))
              .map(t => t.slice(4))
    },
    tagsAvailable() {
      return this.filteredToolsAllTags
        .map(t => t.tags)
        .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a, new Set([]))
    },
    text() {
      return textByLang[this.$store.state.lang]
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
      if ((region && !this.regions.includes(region)) ||
          (tag && !(`tag.${tag}` in this.text)) ||
          (set && !(set in this.sets)))
        return next({name: 'toolbox', replace: true})

      // Set an appropriate activeTab (one of: collection, region, set, tag)
      if (query || region || tag) {
        this.activeTab = 'tag'
      } else if (this.routeCollection == 'set') {
        this.activeTab = 'set'
      } else if (this.routeCollection == 'story') {
        this.activeTab = 'region'
      } else if ([ALL, 'saved'].includes(this.routeCollection)) {
        this.activeTab = 'collection'
      } else {
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
  margin-bottom: -2px;
  @include breakpoint($md) {
    font-size: 1rem;
  }
  .plain {
    display: inline-block;
    margin-bottom: .25rem;
    @include breakpoint($md) {
      margin-bottom: .5rem;
    }
  }
  .tab {
    font-size: 1.4rem;
    font-family: 'ff-good-headline-web-pro-condensed';
    text-transform: uppercase;
    line-height: 1;
    text-align: center;
    font-weight: bold;
    display: inline-block;
    vertical-align: bottom;
    max-width: 25rem;
    padding: .5rem 1rem .5rem 1rem;
    position: relative;
    z-index: 1;
    margin: 0 .5rem;
    cursor: pointer;
    @include breakpoint($md) {
      padding: .5rem .5rem .5rem .5rem;
      margin: 0 .25rem;
      max-width: 13rem;
    }
    &.active {
      background-color: $bggray;
      border-right: 1px solid $bgdark2;
      border-radius: 5px 5px 0 0;
    }
  }
  .bt-icon {
    margin: .5rem;
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
    height: 20rem;

    cursor: pointer;
    flex: 2 0 14%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;

    @include breakpoint($md) {
      height: 12rem;
      flex: 0 0 25%;
      font-size: .8rem;
    }
    @include breakpoint($lg) {
      font-size: .9rem;
      line-height: 1.1;
    }
    &.active {
      background: $bgdark1;
    }
    &.set {
      fill: $set;
      .h3 {
        color: $set;
      }
    }
    &.saved {
      position: relative;
      .download {
        margin-top: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        &.disabled {
          cursor: default;
          color: $bgdark2;
          .bt-icon {
            fill: $bgdark2;
          }
        }
        .bt-icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        div {
          flex: 0 2 50%;
          text-align: left;
          margin-right: .5rem;
        }
      }
    }
    .blacklivesmatter {
      word-break: break-all; // Sets have editor-made names #BlackLivesMatter
    }
    p {
      margin-bottom: 0;
      min-height: 45%;
      @include breakpoint($md) {
        margin-top: .25rem;
      }
    }
    .h3 {
      margin: 0;
      text-align: center;
    }
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
        flex: 3 0 25%;
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
    height: 20rem;
    justify-content: flex-start;
    align-items: space-between;

    @include breakpoint($md) {
      height: 24rem;
      font-size: .9rem;
    }
    span {
      cursor: pointer;
      min-height: 1.3rem;
      padding: 0 1rem;
      //display: inline-flex; // For the x buttons maybe?
      @include breakpoint($md) {
        min-height: 1rem;
      }
      &.active {
        font-weight: bold;
      }
      &.disabled {
        color: $bgdark2;
        pointer-events: none;
      }
    }
  }
  .by-set {
    .block {
      @include breakpoint($md) {
        height: 24rem;
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
      max-height: 3rem;
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
