<template>
  <div class="toolbox">
    <div :class="['toolbox-hero', collection]">
      <div class="inner">
        <p class="h1">{{ collection ? text[`type.${collection}.plural`] : text['site.toolbox'] }}{{ collection ? ':' : '' }}</p>
        <p>
          {{ text[`type.${collection}.description`] || '' }}
        </p>
      </div>
    </div>
    <div class="filter-pane">

      <!-- SENTENCE (labels and tabs) -->
      <div class="sentence-wrapper">
        <div class="sentence">
          <div class="plain" @dblclick="$router.push({name: 'toolbox-all'})">
            {{ text['site.sentence.showme'] }}
          </div>
          <div :class="{tab: true, active: tab == 'collection'}" @click="tab = 'collection'">
            {{ collectionTab }}
          </div>

          <!-- Label + tab for regions -->
          <div v-if="collection == 'story'" class="plain">
            {{ text['site.sentence.from'] }}
          </div>
          <div v-if="collection == 'story'" :class="{tab: true, active: tab == 'story'}" @click="tab = 'story'">
            {{ text[`type.story.region.${region}`] }}
          </div>

          <!-- Label for all collection search + sets -->
          <div v-if="collection != 'saved'" class="plain">
            {{ text['site.sentence.about'] }}
          </div>

          <!-- TODO: Label for saved -->
          <!-- TODO: Tab for saved -->

          <!-- Tab for sets -->
          <div v-if="collection == 'set'"
            :class="{tab: true, active: tab == 'set'}"
            @click="tab = 'set'">
            {{ text[`set.${set}`] }}
          </div>

          <!-- Search when collection is neither saved nor set -->
          <search v-if="!['saved', 'set'].includes(collection)" ref="search" :text="text['site.sentence.everything']" />

          <!-- Show reset when any filters are applied (set/region have default values and therefore don't count) -->
          <img v-if="collection || query || tag"
            svg-inline class="bt-icon reset" src="./assets/reset.svg"
            :alt="text['site.sentence.reset']"
            @click="reset">
        </div>
      </div>

      <!-- FILTER WIDGET (panels corresponding to tabs) -->
      <div :class="{'widget-wrapper': true}">
        <div class="widget">
          <transition name="fade" mode="out-in">

            <!-- Collection panel -->
            <div class="by by-collection" v-if="tab == 'collection'">
              <div v-for="type in types" :key="type"
                :class="{block: true, [type]: true, active: collection == type}" @click="selectCollection(type)">
                <!-- svg-inline directive can't predict runtime :src binding -->
                <img svg-inline v-if="type == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
                <img svg-inline v-if="type == 'theory'" class="bt-icon" src="./assets/theory.svg">
                <img svg-inline v-if="type == 'story'" class="bt-icon" src="./assets/story.svg">
                <img svg-inline v-if="type == 'principle'" class="bt-icon" src="./assets/principle.svg">
                <img svg-inline v-if="type == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
                <div class="h3">{{ text[`type.${type}.plural`] }}</div>
                <p class="hidden">{{ text[`type.${type}.description`] }}</p>
              </div>
              <div :class="{block: true, set: true, active: collection == 'set'}" @click="selectCollection('set')">
                <img svg-inline class="bt-icon" src="./assets/set.svg">
                <div class="h3">{{ text['type.set.plural'] }}</div>
                <p class="hidden">{{ text['type.set.description'] }}</p>
              </div>

              <!-- mobile-only -->
              <div :class="{block: true, saved: true, active: collection == 'saved', 'mobile-only': true}"
                @click="selectCollection('saved')">
                <img svg-inline class="bt-icon" src="./assets/favorite-active.svg">
                <div class="h3">{{ text['type.saved'] }}</div>
              </div>
              <div v-if="collection == 'saved'"
                :class="{block: true, saved: true, active: collection == 'saved', 'mobile-only': true}">
                <span @click.stop="$store.state.savedTools.size && downloadPDF($store.state.savedTools)"
                  :class="{download: true, disabled: !$store.state.savedTools.size}"
                  :title="text[$store.state.savedTools.size ? 'site.downloadpdf' : 'site.saved.description']">
                  <img svg-inline class="bt-icon" src="./assets/download.svg">
                  <div>{{ text['site.downloadpdf'] }}</div>
                </span>
              </div>
              <!-- mobile-hidden -->
              <div :class="{block: true, saved: true, active: collection == 'saved', 'mobile-hidden': true}" @click="selectCollection('saved')">
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
            <div class="by by-region" v-if="tab == 'story'">
              <div :class="{block: true, active: region == ALL}" @click="selectRegion()">
                <img svg-inline class="bt-icon" src="./assets/regions/world.svg">
                <p>{{ text['type.story.region.all'] }}</p>
              </div>
              <div v-for="r in regions" :key="r"
                :class="{block: true, active: region == r}" @click="selectRegion(r)">
                <img svg-inline v-if="r == 'africa'" class="bt-icon" src="./assets/regions/africa.svg">
                <img svg-inline v-if="r == 'asia'" class="bt-icon" src="./assets/regions/asia.svg">
                <img svg-inline v-if="r == 'europe'" class="bt-icon" src="./assets/regions/europe.svg">
                <img svg-inline v-if="r == 'latin-america-and-the-caribbean'" class="bt-icon" src="./assets/regions/latin-america-and-the-caribbean.svg">
                <img svg-inline v-if="r == 'middle-east'" class="bt-icon" src="./assets/regions/middle-east.svg">
                <img svg-inline v-if="r == 'north-america'" class="bt-icon" src="./assets/regions/north-america.svg">
                <img svg-inline v-if="r == 'oceania'" class="bt-icon" src="./assets/regions/oceania.svg">
                <p>{{ text[`type.story.region.${r}`] }}</p>
              </div>
            </div>

            <!-- BY SET -->
            <div class="by by-set" v-if="tab == 'set'">
              <div v-for="(s, slug) in sets" :key="slug"
                :class="{block: true, set: true, [slug]: true, active: set == slug}"
                @click="selectSet(slug)">
                <img svg-inline class="bt-icon set" src="./assets/set.svg">
                <div class="h3 set">{{ text[`set.${slug}`] }}</div>
                <div v-html="markdown(text[`set.${slug}.description`])" />
              </div>
            </div>

            <!-- BY TAG -->
            <!--
            <div v-if="tab == 'tag'" :key="'tag'" class="by by-tag">
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
      <tool-tile v-if="!['set', 'saved'].includes(collection)" :key="1" :text="text" :alt="'suggest'" />
      <tool-tile v-if="collection == 'saved' && !$store.state.savedTools.size" :key="2" :text="text" :alt="'nosave'" />
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
  /* eslint-disable */


export default {
  name: 'Toolbox',
  data: () => ({
    ALL,
    activeTab: 'collection',
    hideFilterPane: false,
    regions: ['africa', 'asia', 'europe', 'latin-america-and-the-caribbean', 'middle-east', 'north-america', 'oceania'],
    sets, // hard-coded in sets.json, SEE: mise-en-place.py
    types: ['story', 'tactic', 'principle', 'theory', 'methodology'],

    query: null,
    region_: ALL,
    set_: Object.keys(sets)[0],
    tag: null,
    tab: 'collection',
  }),
  components: {
    ToolTile,
    Search,
  },
  computed: {
    // @@@ OLD @@@
    filteredToolsAllTags() {
      if (this.$route.name == 'toolbox-search' && this.$route.params.query) {
        return this.$store.state.searchResults.map(k => this.$store.state.toolsBySlug[k])
      }

      //let tools = this.$store.state.tools.filter(t => /(full|gallery|snapshot)/.test(t['module-type-effective']))
      let tools = this.$store.state.tools
      if (this.collection == 'saved') {
        tools = tools.filter(t => this.$store.state.savedTools.has(t.slug))
      } else if (this.collection == 'set') {
        tools = tools.filter(t => (this.sets[this.set] || []).includes(t.slug))
      } else if (this.config.toolTypes.includes(this.collection)) {
        tools = tools.filter(t => t.type == this.collection)
      }
      if (this.collection == 'story' && this.routeRegion != ALL) {
        tools = tools.filter(t => {
          let regionSlugs = t.regions.map(this.slugify) || []
          return regionSlugs.includes(this.routeRegion) || regionSlugs.includes('worldwide')
        })
      }
      return tools
    },
    // @@@ OLD @@@
    filteredTools() {
      // TODO: why does the toolbox in other languages show snapshots?
      //       is it because some Array isn't triggering the re-compute of these propreties?
      let tools = this.filteredToolsAllTags
      if (this.tag)
        tools = tools.filter(t => (t.tags || []).includes(this.tag))
      return tools
    },
    // @@@ OLD @@@
    __routeSet() {
      return this.$route.params.set || Object.keys(this.sets)[0]
    },
    set() {
      return this.set_ || Object.keys(this.sets)[0]
    },

    // @@@ OLD @@@
    _routeCollection() {
      return this.$route.name.replace(/^toolbox-?/, '') || ALL
    },
    collection() {
      return this.$route.params.collection
    },

    // @@@ OLD @@@
    routeRegion() {
      return this.$route.params.region || ALL
    },
    region() {
      return this.region_ || ALL
    },

    // @@@ OLD @@@
    routeTag() {
      return this.$route.params.tag
    },
    // @@@ OLD @@@
    sortedTags() {
      return Object.keys(this.text)
              .filter(k => /^tag\./.test(k))
              .sort((a, b) => this.text[a].localeCompare(this.text[b]))
              .map(t => t.slice(4))
    },
    // @@@ OLD @@@
    collectionTab() {
      if (this.$route.name == 'toolbox' || (this.$route.name == 'toolbox-search' && !this.$route.params.query)) {
        return this.text['site.sentence.everything']
      }
      return this.text[`type.${this.collection || ALL}${['saved', 'set', 'search'].includes(this.collection) ? '' : '.plural'}`]
    },
    collectionTab() {
      if (!this.$route.params.collection)
        return this.text['site.sentence.everything']
      return this.text[`type.${this.collection || ALL}${['saved', 'set', 'search'].includes(this.collection) ? '' : '.plural'}`]
    },

    // @@@ OLD @@@
    tagsAvailable() {
      // Tags available for the current level of filtering
      if (this.$route.name == 'toolbox-search' && this.$route.params.query) {
        return this.validTags
      }
      return this.filteredToolsAllTags
        .map(t => t.tags)
        .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a, new Set([]))
    },
    // @@@ OLD @@@
    text() {
      return textByLang[this.$store.state.lang] || {}
    },
    // @@@ OLD @@@
    validRegions() {
      return new Set([ALL, ...this.regions])
    },
    // @@@ OLD @@@
    validSets() {
      return new Set(Object.keys(this.sets))
    },
    // @@@ OLD @@@
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
    // @@@ OLD @@@
    resetFilter() {
      this.activeTab = 'collection'
      this.$router.push({name: 'toolbox'})
    },
    reset(reroute = true) {
      this.query = null
      this.region_ = this.region
      this.set_ = this.set
      this.tag = null
      if (reroute && this.collection) {
        this.tab = 'collection'
        this.$router.push({name: 'toolbox'})
      }
    },

    // @@@ OLD @@@
    _selectCollection(collection) {
      let name = `toolbox-${collection}`
      if (this.$route.name != name)
        this.$router.push({name: `toolbox-${collection}`})
      else
        this.$router.push({name: 'toolbox'})
    },
    selectCollection(collection) {
      if (collection != this.$route.params.collection) {
        this.tab = ['story', 'set'].includes(collection) ? collection : 'collection'
        this.reset(false)
        this.$router.push({name: 'toolbox', params: this.$route.params.collection != collection ? {collection} : {}})
      } else {
        this.reset()
      }
    },
    // @@@ OLD @@@
    _selectRegion(region) {
      if (this.$route.params.region != region)
        this.$router.push({name: this.$route.name, params: {region}})
    },
    selectRegion(region) {
      if (this.region_ != region) {
        this.region_ = region
      } else {
        this.region_ = null
      }
    },
    // @@@ OLD @@@
    _selectSet(set) {
      if (this.$route.params.set != set)
        this.$router.push({name: this.$route.name, params: {set}})
    },
    selectSet(set) {
      if (this.set_ != set) {
        this.set_ = set
      }
    },

    // @@@ OLD @@@
    selectTag(tag) {
      tag = this.$route.params.tag != tag ? tag : undefined
      delete this.$route.params.query
      this.$router.push({
        name: [ALL, 'search'].includes(this.collection) ? 'toolbox' : this.$route.name,
        params: {...this.$route.params, tag}
      })
    },
    // @@@ OLD @@@
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
      } else if (this.collection == 'set') {
        this.activeTab = 'set'
      } else if (this.collection == 'story') {
        this.activeTab = 'region'
      } else if ([ALL, 'saved'].includes(this.collection)) {
        this.activeTab = 'collection'
      } else {
        //this.activeTab = 'tag'
        this.activeTab = 'collection'
        this.hideTagsOnMobile = true
      }
      next()
    },
    _guardRoute(route, next) {
      //this.activeTab =
    }
  },
  _beforeRouteUpdate(to, from, next) {
    this.guardRoute(to, next)
  },
  _beforeRouteEnter(to, from, next) {
    next(vm => vm.guardRoute(to, next))
  },
  created() {
    // TODO: Determine whether this is needed in production (it's needed for the webpack dev server)
    //this.guardRoute(this.$route, () => {})
    console.log('created')
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
