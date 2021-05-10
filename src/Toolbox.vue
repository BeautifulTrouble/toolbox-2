<template>
  <div class="toolbox">
    <div v-if="true" :class="['toolbox-hero', routeCollection]">
      <div class="inner">
        <p class="h1">{{ routeCollection == ALL ? 'Toolbox' : text[`type.${routeCollection}.plural`] }}:</p>
        <p>
          {{ text[`type.${routeCollection}.description`] || 'About our toolbox blurb' }}
        </p>
      </div>
    </div>
    <div class="filter-pane">

      <!-- SENTENCE -->
      <div class="sentence-wrapper">
        <div class="sentence">
          <div class="plain" @dblclick="$router.push({name: 'toolbox-all'})">
            {{ text['site.sentence.showme'] }}
          </div>
          <div :class="{tab: true, active: activeTab == 'collection'}" @click="activeTab = 'collection'">
            {{ collectionTab }}
          </div>

          <!-- Tab for regions -->
          <div v-if="routeCollection == 'story'" class="plain">
            {{ text['site.sentence.from'] }}
          </div>
          <div v-if="routeCollection == 'story'" :class="{tab: true, active: activeTab == 'region'}" @click="activeTab = 'region'">
            {{ text[`type.story.region.${routeRegion}`] }}
          </div>

          <!-- Tab for sets -->
          <div v-if="routeCollection != 'saved'" class="plain">
            {{ text['site.sentence.about'] }}
          </div>
          <div v-if="routeCollection == 'set'"
            :class="{tab: true, active: activeTab == 'set'}"
            @click="activeTab = 'set'">
            {{ text[`set.${routeSet}`] }}
          </div>

          <!-- TODO: Tab for saved (requires rethinking the sentence) -->

          <search v-if="!['saved', 'set'].includes(routeCollection)" ref="search" :text="text['site.sentence.everything']" />
          <img v-if="routeCollection != ALL || routeTag != ALL" svg-inline class="bt-icon reset" src="./assets/reset.svg" :alt="text['site.sentence.reset']" @click="resetFilter">
        </div>
      </div>

      <!-- FILTER WIDGET -->
      <div :class="{'widget-wrapper': true, 'hidden': hideFilterPane}">
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
                <p class="hidden">{{ text[`type.${type}.description`] }}</p>
              </div>
              <div :class="{block: true, set: true, active: routeCollection == 'set'}" @click="selectCollection('set')">
                <img svg-inline class="bt-icon" src="./assets/set.svg">
                <div class="h3">{{ text['type.set.plural'] }}</div>
                <p class="hidden">{{ text['type.set.description'] }}</p>
              </div>

              <!-- mobile-only -->
              <div :class="{block: true, saved: true, active: routeCollection == 'saved', 'mobile-only': true}"
                @click="selectCollection('saved')">
                <img svg-inline class="bt-icon" src="./assets/favorite-active.svg">
                <div class="h3">{{ text['type.saved'] }}</div>
              </div>
              <div v-if="routeCollection == 'saved'"
                :class="{block: true, saved: true, active: routeCollection == 'saved', 'mobile-only': true}">
                <span @click.stop="$store.state.savedTools.size && downloadPDF($store.state.savedTools)"
                  :class="{download: true, disabled: !$store.state.savedTools.size}"
                  :title="text[$store.state.savedTools.size ? 'site.downloadpdf' : 'site.saved.description']">
                  <img svg-inline class="bt-icon" src="./assets/download.svg">
                  <div>{{ text['site.downloadpdf'] }}</div>
                </span>
              </div>
              <!-- mobile-hidden -->
              <div :class="{block: true, saved: true, active: routeCollection == 'saved', 'mobile-hidden': true}" @click="selectCollection('saved')">
                <img svg-inline class="bt-icon" src="./assets/favorite-active.svg">
                <div class="h3">{{ text['type.saved'] }}</div>
                <p><!--{{ text['type.saved.description'] }}-->
                  <span @click.stop="$store.state.savedTools.size && downloadPDF($store.state.savedTools)"
                    :class="{download: true, disabled: !$store.state.savedTools.size}"
                    :title="text[$store.state.savedTools.size ? 'site.downloadpdf' : 'site.saved.description']">
                    <img svg-inline class="bt-icon" src="./assets/download.svg">
                    <div>{{ text['site.downloadpdf'] }}</div>
                  </span>
                </p>
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
                <div v-html="markdown(text[`set.${slug}.description`])" />
              </div>
            </div>

            <!-- BY TAG -->
            <!--
            <div v-if="activeTab == 'tag'" :key="'tag'" class="by by-tag">
              <p v-for="(tag, i) in sortedTags" :key="i"
                :class="{active: routeTag == tag, disabled: !tagsAvailable.has(tag)}"
                @click="selectTag(tag)">
                {{ text[`tag.${tag}`] }}
              </p>
            </div>
            -->
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
import Search from './Search'
import ToolTile from './ToolTile'
import sets from './sets'
import textByLang from './text'


const ALL = 'all'


export default {
  name: 'Toolbox',
  data: () => ({
    ALL,
    activeTab: 'collection',
    hideFilterPane: false,
    regions: ['africa', 'asia', 'europe', 'latin-america-and-the-caribbean', 'middle-east', 'north-america', 'oceania'],
    sets, // hard-coded in sets.json, GOTO: mise-en-place.py
    types: ['story', 'tactic', 'principle', 'theory', 'methodology'],
  }),
  components: {
    ToolTile,
    Search,
  },
  computed: {
    filteredToolsAllTags() {
      if (this.$route.name == 'toolbox-search' && this.$route.params.query) {
        return this.$store.state.searchResults.map(k => this.$store.state.toolsBySlug[k])
      }

      //let tools = this.$store.state.tools.filter(t => /(full|gallery|snapshot)/.test(t['module-type-effective']))
      let tools = this.$store.state.tools
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
    routeSet() {
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
    collectionTab() {
      if (this.$route.name == 'toolbox' || (this.$route.name == 'toolbox-search' && !this.$route.params.query)) {
        return this.text['site.sentence.everything']
      }
      return this.text[`type.${this.routeCollection}${['saved', 'set', 'search'].includes(this.routeCollection) ? '' : '.plural'}`]
    },
    tagsAvailable() {
      // Tags available for the current level of filtering
      if (this.$route.name == 'toolbox-search' && this.$route.params.query) {
        return this.validTags
      }
      return this.filteredToolsAllTags
        .map(t => t.tags)
        .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a, new Set([]))
    },
    text() {
      return textByLang[this.$store.state.lang] || {}
    },
    validRegions() {
      return new Set([ALL, ...this.regions])
    },
    validSets() {
      return new Set(Object.keys(this.sets))
    },
    validTags() {
      // Tags available in entire toolbox (for the sake of the route guard)
      return new Set(
        Object.keys(this.text)
          .filter(k => /^tag\./.test(k))
          .map(k => k.slice(4))
      )
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
      delete this.$route.params.query
      this.$router.push({
        name: [ALL, 'search'].includes(this.routeCollection) ? 'toolbox' : this.$route.name,
        params: {...this.$route.params, tag}
      })
    },
    guardRoute(route, next) { // eslint-disable-next-line
      let { query, region, set, tag } = route.params

      // Reject invalid regions, tags, or sets. Fall back to top-level toolbox.
      if ((region && !this.validRegions.has(region)) ||
          (tag && !this.validTags.has(tag)) ||
          (set && !this.validSets.has(set)))
        return next({name: 'toolbox', replace: true})

      // Set an appropriate activeTab (one of: collection, region, set, tag)
      // When activeTab is set by the route guard, tags are ALWAYS hidden
      if (tag) {
        this.activeTab = 'tag'
        this.hideTagsOnMobile = true
      } else if (route.name == 'toolbox-search') {
        this.activeTab = 'tag'
      } else if (this.routeCollection == 'set') {
        this.activeTab = 'set'
      } else if (this.routeCollection == 'story') {
        this.activeTab = 'region'
      } else if ([ALL, 'saved'].includes(this.routeCollection)) {
        this.activeTab = 'collection'
      } else {
        //this.activeTab = 'tag'
        this.activeTab = 'collection'
        this.hideTagsOnMobile = true
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

@mixin hero-particulars($type) {
  background-image: url(https://beautifulrising.org/hero-pattern-#{$type}.jpg);
}
.toolbox-hero {
  background: linear-gradient(to right, orange , yellow, green, cyan, blue, violet);
  background-size: cover;
  &.tactic { @include hero-particulars(tactic); }
  &.theory { @include hero-particulars(theory); }
  &.story { @include hero-particulars(story); }
  &.principle { @include hero-particulars(principle); }
  &.methodology { @include hero-particulars(methodology); }
  .inner {
    padding: 13.2vmax 0 1vw 0;
    width: 100%;
    max-width: 1200px;
    div, p {
      position: relative;
      //text-shadow: 1px 0px 6px rgba(black, .5);
      color: white !important;
    }
    p {
      max-width: 30%;
    }
    .h1 {
      margin: 0;
      font-size: calc(3.8 * 1rem);
      text-transform: uppercase;
    }
  }
  color: white !important;
  height: 20rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  &::before {
    content: "";
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.3) 60%, rgba(0,0,0,.5) 100%);
    position: absolute;
    top: 0; left: 0;
    bottom: 0; right: 0;
  }
}
.toolbox {
  //padding-top: 4rem;
  width: 100%;

  // Mobile header adjustments for the Squarespace theme
  @media #{$ss-mobile-header} {
    padding-top: 10rem;
  }
  @include breakpoint($sm) {
    padding-top: 7.5rem;
  }
}
.filter-pane {
  display: flex;
  flex-direction: column;
  align-items: center; // horizontally center
}
.sentence-wrapper {
  min-height: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; // align to bottom of flex row
  @include breakpoint($sm) {
    width: 100%;
  }
}
.sentence {
  display: flex;
  align-items: flex-end;
  font-size: 1.25rem;
  margin: 0 1rem;
  width: 100%;
  position: relative;
  user-select: none;
  @include breakpoint($md) {
    font-size: 1rem;
  }
  @include breakpoint($sm) {
    font-size: 1rem;
    flex-wrap: wrap;
    margin: 0;
  }
  .plain {
    flex: 1 1 auto;
    @include breakpoint($md-up) {
      margin-bottom: .65rem;
    }
    @include breakpoint($sm) {
      flex: 0 0 27%;
      text-align: right;
      padding: 0 .5rem .5rem 0;
      overflow-x: hidden;
    }
  }
  .tab {
    cursor: pointer;
    font-size: 1.4rem;
    font-family: 'ff-good-headline-web-pro-condensed';
    text-transform: uppercase;
    line-height: 1;
    text-align: center;
    font-weight: bold;

    flex: 1 1 auto;
    padding: .5rem 1rem .75rem 1rem;
    margin: 0 .5rem -1px .5rem;

    border-radius: 5px 5px 0 0;
    border-right: 1px solid $bgdark1;
    background: linear-gradient(180deg, $bggray 75%, darken($bggray, 1%) 95%, darken($bggray, 8%) 100%);
    color: $bgdark3;

    transition: all .1s linear;
    @include breakpoint($md) {
      padding: .5rem .5rem;
    }
    @include breakpoint($sm) {
      border-radius: 5px;
      flex: 0 0 73%;
      margin: 0;
    }
    &.active {
      color: $text;
      background: $bggray;
      border-right: 1px solid $bgdark2;
      z-index: 1;
      @include breakpoint($sm) {
        background: linear-gradient(180deg, $bggray 75%, darken($bggray, 1%) 95%, darken($bggray, 8%) 100%);
      }
    }
  }
  .bt-icon {
    flex: 0 0 2.5rem; // width + margin
    margin: .5rem 0;
    margin-inline-start: .5rem;
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
    fill: $text;
    @include breakpoint($upper) {
      transition: fill .2s linear;
      &:hover {
        fill: black;
      }
    }
    @include breakpoint($sm) {
      position: absolute;
      right: 1rem;
      top: -2.5rem;
    }
  }
}
.widget-wrapper {
  border: 1px solid $bgdark1;
  border-radius: 5px;
  width: 100%;
  max-width: 65rem;
}
.widget {
  background-color: $bggray;

  border-left: 1px solid white;
  border-top: 1px solid white;

  border-radius: 5px;
  border-right: 1px solid $bgdark2;
  line-height: 1.1;
  font-size: .8rem;

  @include breakpoint($lg) {
    font-size: .9rem;
  }
  @include breakpoint($md) {
    font-size: .8rem;
  }
  @include breakpoint($sm) {
    font-size: .7rem;
  }

  .block {
    border-right: 1px solid white;
    border-bottom: 1px solid white;
    height: 8rem;

    cursor: pointer;
    flex: 2 0 14%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;
    padding: .5rem 1rem;

    @include breakpoint($lg) {
      padding: .75rem;
    }
    @include breakpoint($md) {
      height: 12rem;
      flex: 0 0 20%;
    }
    @include breakpoint($sm) {
      padding: .5rem 1rem;
      height: 4rem;
      overflow: hidden;
      flex: 0 0 20%;
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
      @include breakpoint($sm) {
        &.active {
          border-right: unset;
        }
      }
      .download {
        margin-top: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        fill: $text;
        @include breakpoint($sm) {
          margin-top: .5rem;
        }
        &.disabled {
          cursor: default;
          opacity: .2;
        }
        .bt-icon {
          width: 1.5rem;
          height: 1.5rem;
          margin: 0;
        }
        div {
          flex: 0 2 70%;
          text-align: left;
          margin-inline-start: .5rem;
        }
      }
    }
    .blacklivesmatter {
      word-break: break-all; // Sets have editor-made names #BlackLivesMatter
    }
    p {
      margin-inline-start: .5rem; // Subtly offset the left-aligned text
      //margin-top: 0;
      margin-top: .5rem;
      margin-bottom: 0;
      //min-height: 45%;
      @include breakpoint($md) {
        margin-top: .25rem;
      }
      @include breakpoint($sm) {
        min-height: 35%;
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
    @include breakpoint($lower) {
      flex-wrap: wrap;
    }
  }
  .by-collection {
    .block {
      @include breakpoint($md) {
        flex: 3 0 25%;
      }
      @include breakpoint($sm) {
        flex: 0 0 50%;
        display: flex;
        flex-direction: row;
        padding: 0 1rem;
        p {
          display: none;
        }
        .h3 {
          flex: 0 0 65%;
          text-align: left;
        }
        /* Before hiding the paragraphs
        &:nth-of-type(5) {
          flex: 1 0 100%;
          p {
            max-width: 65%;
          }
        }
        */
      }
    }
  }
  .by-region {
    .bt-icon {
      height: 6rem;
      max-height: 4rem;
      width: 7rem;
      margin: 0;
    }
    .block {
      flex: 1 2 12.5%;
      @include breakpoint($md) {
        flex: 0 0 25%;
      }
      @include breakpoint($sm) {
        height: 5.33rem;
        flex: 0 0 33.3%;
        p {
          display: none;
        }
      }
      p {
        min-height: 15%;
        text-align: center;
      }
    }
  }
  .by-tag {
    padding: 1rem 1rem;
    flex-wrap: wrap;
    flex-direction: column;
    height: 10rem;
    justify-content: flex-start;
    align-items: flex-start; // Don't expand to fill width (avoids stray taps)

    @include breakpoint($md) {
      height: 24rem;
    }
    @include breakpoint($sm) {
      height: 30rem;
      padding: 1rem 1rem;
    }
    p {
      cursor: pointer;
      //min-height: 1.25rem;
      line-height: 1.3;
      padding: 0 1rem;
      margin: 0;
      //display: inline-flex; // For the x buttons maybe?
      &.active {
        font-weight: bold;
      }
      &.disabled {
        color: $bgdark2;
        pointer-events: none;
      }
      @include breakpoint($sm) {
        padding: 0;
        font-size: .9rem;
        min-height: 1.1rem;
      }
    }
  }
  .by-set {
    .block {
      @include breakpoint($md) {
        height: 24rem;
      }
      @include breakpoint($sm) {
        height: 8rem;
        flex: 0 0 50%;
      }
    }
  }
  .bt-icon {
    width: 4rem;
    max-height: 6rem;
    margin: .5rem;
    @include breakpoint($xl) {
      width: 6rem;
    }
    @include breakpoint($md) {
      margin: .25rem;
      max-height: 3rem;
    }
    @include breakpoint($sm) {
      max-height: 3rem;
      margin: .25rem .5rem;
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

    @include breakpoint($xl) {
      flex: 0 0 20%;
      height: 20vw;
    }
    @include breakpoint($xxl) {
      flex: 0 0 12.5%;
      height: 12.5vw;
    }
    @include breakpoint($md) {
      flex: 0 0 33.3%;
      height: 33.3vw;
    }
    @include breakpoint($sm) {
      flex: 0 0 50%;
      height: 50vw;
      border: 1px solid transparent;
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
