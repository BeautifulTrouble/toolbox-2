<template>
  <div class="toolbox">
    <div :class="['toolbox-hero', collection]">
      <div class="inner">
        <div class="h1">{{ collection != ALL ? (text[`type.${collection}.plural`] + ':') : text['site.toolbox'] }}</div>
        <p>{{ text[`type.${collection}.description`] || '' }}</p>
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

          <!-- TODO: Label + tab for saved -->

          <!-- Search when collection is neither saved nor set -->
          <autocomplete class="autocomplete-wrapper" v-show="collection != 'saved'"
            ref="search"
            :placeholder="text[collection == 'set' ? `set.${set}` : 'site.sentence.everything']"
            @click="tab = collection == 'set' ? 'set' : tab"
            @submit="search"
            :search="autocomplete"
            :get-result-value="getResultValue"
            >
            <template #result="{result, props}">
              <li v-bind="props" :class="['autocomplete-result', result.icon]">
                {{ result.text }}
              </li>
            </template>
          </autocomplete>

          <!-- Show reset when any filters are applied (set/region have default values and therefore don't count) -->
          <img v-if="collection != ALL || query || tag"
            svg-inline class="bt-icon reset" src="./assets/reset.svg"
            :alt="text['site.sentence.reset']"
            @click="reset">
        </div>
      </div>

      <!-- FILTER WIDGET (panels corresponding to tabs) -->
      <div class="widget-wrapper">
        <div class="widget">
          <transition name="fade" mode="out-in">

            <!-- Collection panel -->
            <div class="by by-collection" v-if="tab == 'collection'">
              <div :class="{block: true, all: true, active: collection == ALL}" @click="selectCollection()">
                <img svg-inline class="bt-icon" src="./assets/all.svg">
                <div class="h3">{{ text['site.sentence.everything'] }}</div>
              </div>
              <div v-for="type in types" :key="type"
                :class="{block: true, [type]: true, active: collection == type}" @click="selectCollection(type)">
                <!-- svg-inline directive can't predict runtime :src binding -->
                <img svg-inline v-if="type == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
                <img svg-inline v-if="type == 'theory'" class="bt-icon" src="./assets/theory.svg">
                <img svg-inline v-if="type == 'story'" class="bt-icon" src="./assets/story.svg">
                <img svg-inline v-if="type == 'principle'" class="bt-icon" src="./assets/principle.svg">
                <img svg-inline v-if="type == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
                <div class="h3">{{ text[`type.${type}.plural`] }}</div>
              </div>
              <div :class="{block: true, set: true, active: collection == 'set'}" @click="selectCollection('set')">
                <img svg-inline class="bt-icon" src="./assets/set.svg">
                <div class="h3">{{ text['type.set.plural'] }}</div>
              </div>

              <!-- mobile-only -->
              <!--
              <div :class="{block: true, saved: true, active: collection == 'saved', 'mobile-only': false}"
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
              -->
              <!-- mobile-hidden -->
              <div :class="{block: true, saved: true, active: collection == 'saved', 'mobile-hidden': false}" @click="selectCollection('saved')">
                <img svg-inline class="bt-icon" src="./assets/favorite-active.svg">
                <div class="h3">{{ text['type.saved'] }}</div>
                <p>
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
                @click="selectSet(slug, ...arguments)">
                <img svg-inline class="bt-icon set" src="./assets/set.svg">
                <div class="h3 set">{{ text[`set.${slug}`] }}</div>
                <div v-html="markdown(text[`set.${slug}.description`])" />
              </div>
            </div>

          </transition>
        </div>
      </div>
    </div>

    <transition-group name="tools-list" tag="div" class="tools">
      <tool-tile v-for="tool in filteredToolsByCollection" :key="tool.slug" :tool="tool" :text="text" />
      <tool-tile v-if="!['set', 'saved'].includes(collection)" :key="1" :text="text" :alt="'suggest'" />
      <tool-tile v-if="collection == 'saved' && !$store.state.savedTools.size" :key="2" :text="text" :alt="'nosave'" />
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

    // Filter functions for every collection type
    filtersByCollection() {
      return Object.assign(
        Object.fromEntries(this.types.map(T => [T, t => t.type == T])),
        {
          [ALL]: t => true,
          'saved': t => this.$store.state.savedTools.has(t.slug),
          'set': t => (this.sets[this.set] || []).includes(t.slug),
          'story': t => {
            let regionSlugs = (t.regions || []).map(this.slugify)
            return t.type == 'story' && (
              this.region == ALL ||
              regionSlugs.includes('worldwide') ||
              regionSlugs.includes(this.region)
            )
          }
        })
    },

    // Stage 1 tool filtering (before tag/query is applied)
    filteredToolsByCollection() {
      return (this.$store.state.tools || []).filter(this.filtersByCollection[this.collection])
    },

    // Stage 2 tool filtering (tag/query)
    filteredTools() {
    },

    set() {
      return this.set_ || Object.keys(this.sets)[0]
    },
    collection() {
      return this.$route.params.collection || ALL
    },
    region() {
      return this.region_ || ALL
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
      if (this.collection == ALL)
        return this.text['site.sentence.everything']
      return this.text[`type.${this.collection}${['saved', 'set', 'search'].includes(this.collection) ? '' : '.plural'}`]
    },

    // @@@ OLD @@@
    tagsAvailable() {
      // Tags available for the current level of filtering
      if (this.$route.name == 'toolbox-search' && this.$route.params.query) {
        return this.allTags
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
    allTags() {
      return new Set(
        Object.keys(this.text)
          .filter(k => /^tag\./.test(k))
          .map(k => k.slice(4))
      )
    },
    availableTags() {
      return [...this.filteredToolsByCollection
        .map(t => t.tags)
        .reduce((a, c) => c !== undefined ? new Set([...a, ...c]) : a, new Set([]))
      ].sort()
    },
    // NEW
    autocompleteTags() {
      return [...new Set(this.filteredToolsByCollection.map(t => t.tags).flat())]
        //.sort()
        .map(slug => ({
          type: 'tag',
          icon: 'search',
          value: slug,
          text: this.text[`tag.${slug}`],
        }))
        .filter(t => t.text)
    },
    autocompleteTitles() {
      return this.filteredToolsByCollection
        .map(tool => ({
          type: 'title',
          icon: tool.type,
          value: tool.slug,
          text: tool.title
        }))
    },
    autocompleteSets() {
      return Object.keys(this.sets)
        .map(set => ({
          type: 'set',
          icon: 'set',
          value: set,
          text: this.text[`set.${set}`],
        }))
    },
  },
  methods: {
    autocomplete(text) {
      let autocompletions = this.autocompleteTags
      if (this.collection == 'set') {
        autocompletions = this.autocompleteSets
      } else if (text) {
        autocompletions = [...this.autocompleteTags, ...this.autocompleteTitles]
      }
      text = text.toLocaleLowerCase()
      return autocompletions
        .filter(i => i.text.toLocaleLowerCase().includes(text))
        .sort((a, b) => a.text > b.text ? 1 : -1)
    },
    getResultValue(result) {
      return result.text
    },
    search(value) {
      if (value) {
        // Autocomplete item

      } else {
        // Plaintext search

      }
      console.log(value ? (value.type, value.value) : this.$refs.search.value)
    },

    reset(reroute = true) {
      // TODO: what should be done resetting tag and query?
      this.query = null
      this.selectRegion()
      this.selectSet()
      this.tag = null
      // TODO:
      if (reroute && this.collection) {
        this.tab = 'collection'
        this.$router.push({name: 'toolbox'})
      }
      this.$refs.search.setValue('')
    },

    selectCollection(collection) {
      if (collection == this.collection && ['story', 'set'].includes(collection)) {
        // Collection already active, but there's another tab to show
        this.tab = collection
      } else if (collection != this.collection && collection != this.ALL) {
        // Different collection selected
        this.tab = ['story', 'set'].includes(collection) ? collection : 'collection'
        this.reset(false)
        this.$router.push({name: 'toolbox', params: this.$route.params.collection != collection ? {collection} : {}})
      }
    },
    selectRegion(region) {
      this.region_ = region == this.region_ ? null : region
    },
    selectSet(set, $event) {
      this.set_ = set
      this.$refs.search.setValue('')
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
          (tag && !this.allTags.has(tag)) ||
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
  },
};
</script>

<style lang="scss">
@import 'common.scss';
@import 'icons.scss';

.toolbox-hero {
  height: 18vw;
  min-height: 20.5rem;
  @include breakpoint($md) {
    height: 30vh;
    min-height: 19.5rem;
  }
  // Mobile header adjustments for the Squarespace theme
  @media #{$ss-mobile-header} {
    height: 30vh;
  }

  background-image: url(https://beautifulrising.org/hero-pattern-all.jpg);
  background-size: cover;
  background-position: 50% 80%;
  @mixin hero-particulars($type, $color) {
    //background-image: url(https://beautifulrising.org/hero-pattern-#{$type}.jpg);
    //background-position: 50% 0%;
    //filter: brightness(1.2);
    &::before {
      background: linear-gradient(to top right, rgba($color,0) 0%, rgba($color,.2) 30%, rgba($color,.4) 100%),
                  linear-gradient(to top, rgba(white,0) 0%, rgba(white,.6) 40%, rgba(white,.9) 100%);
    }
  }
  &.tactic { @include hero-particulars(tactic, $tactic); }
  &.theory { @include hero-particulars(theory, $theory); }
  &.story { @include hero-particulars(story, $story); }
  &.principle { @include hero-particulars(principle, $principle); }
  &.methodology { @include hero-particulars(methodology, $methodology); }
  color: white !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  &::before {
    content: "";
    background: linear-gradient(to top, rgba(black,0) 0%, rgba(black,.2) 80%, rgba(black,.4) 100%),
                linear-gradient(to top, rgba(white,0) 0%, rgba(white,.6) 40%, rgba(white,.9) 100%);
    position: absolute;
    top: 0; left: 0;
    bottom: 0; right: 0;
  }
  .inner {
    padding: 13.2vmax 3vw 1vw 3vw;
    width: 100%;
    max-width: 1200px;
    div, p {
      position: relative;
      color: white !important;
    }
    p {
      margin: 0 0 .5rem 0;
      max-width: 40%;
      text-shadow: 0px 0px 3rem rgba(black, .6), 0 0 2px rgba(white, .4);
      line-height: 1.2;
    }
    .h1 {
      margin: 0;
      font-size: calc(3.8 * 1rem);
      text-transform: uppercase;
    }
    @include breakpoint($sm) {
      p {
        max-width: unset;
      }
    }
  }
}
.toolbox {
  width: 100%;
  background-color: $bgdark4;
  min-height: 100vh;
}
.filter-pane {
  display: flex;
  flex-direction: column;
  align-items: center; // horizontally center
  color: $bggray;
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
    text-align: center;
    @include breakpoint($md-up) {
      margin-bottom: .4rem;
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
    padding: .5rem 1rem .7rem 1rem;
    margin: 0 .75rem 0 .75rem;
    border-top: .5rem solid black;
    border-radius: 5px 5px 0 0;

    background: black;
    color: $bgdark3;

    transition: all .1s linear;
    &.active {
      color: white;
      border-top: .5rem solid $bgdark3;
    }
    @include breakpoint($md) {
      padding: .5rem .5rem;
    }
    @include breakpoint($sm) {
      flex: 0 0 73%;
      margin: 0;
      text-align: start;
      border: none;
      border-inline-start: .75rem solid black;
      border-radius: 7px 0 0 7px;
      &.active {
        border: none;
        border-inline-start: .75rem solid $bgdark3;
      }
    }
  }
  .bt-icon {
    flex: 0 0 2.5rem; // width + margin
    margin: .65rem 0;
    //margin-inline-start: .5rem;
    width: 1.7rem;
    height: 1.7rem;
    cursor: pointer;
    fill: $bggray;
    transform: rotate(-32deg);
    @include breakpoint($upper) {
      transition: transform .2s linear;
      &:hover {
        transform: scale(1.25) rotate(-60deg);
        fill: white;
      }
    }
    @include breakpoint($sm) {
      position: absolute;
      left: 1rem;
      bottom: .25rem;
      transform: scale(1.25);
    }
  }
}
.autocomplete-wrapper {
  flex: 1 5 auto;
  margin: 0 .5rem;
  z-index: 3;
  position: relative;
  @include breakpoint($sm) {
    margin: 0;
  }
  &::after {
    content: "";
    width: 3rem;
    top: .5rem; right: 0;
    bottom: .5rem;
    background: linear-gradient(to right, transparent, black);
    position: absolute;
  }
}
.autocomplete {
  .autocomplete-input, .autocomplete-result {
    // background-image:
  }
  .autocomplete-input {
    font-family: ff-good-headline-web-pro-condensed, sans-serif;
    font-size: 1.4rem;
    text-transform: uppercase;
    color: $bgdark3;
    padding: .1rem 1rem .4rem 3rem;
    background-color: black;
    // background-image: see icons.scss

    position: relative;
    border: none;
    border-top: .5rem solid black;
    border-radius: .5rem .5rem 0 0;
    &[aria-expanded=true], &:focus {
      color: white;
      border-top: .5rem solid $bgdark3;
      box-shadow: 0 0 .5rem rgba(0,0,0,.16) inset;
      // background-image: see icons.scss
    }
    &::-webkit-input-placeholder {
      color: $text;
    }
    @include breakpoint($sm) {
      border: none;
      border-radius: .5rem 0 0 .5rem;
      border-inline-start: .75rem solid black;
      &[aria-expanded=true], &:focus {
        border: none;
        border-radius: .5rem 0 0 .5rem;
        border-inline-start: .75rem solid $bgdark3;
      }
    }
  }

  .autocomplete-result {
    @mixin autocomplete-particulars($type) {
      // background-image: see icons.scss
      background-size: 1.5rem;
    }
    &.story { @include autocomplete-particulars(story); }
    &.tactic { @include autocomplete-particulars(tactic); }
    &.principle { @include autocomplete-particulars(principle); }
    &.theory { @include autocomplete-particulars(theory); }
    &.methodology { @include autocomplete-particulars(methodology); }
    &.set { @include autocomplete-particulars(set); }
  }
  .autocomplete-result:hover, .autocomplete-result[aria-selected="true"] {
    background-color: $bgdark4;
  }
  .autocomplete-result-list {
    overflow-x: hidden;
    background: black;
    max-height: 50vh;
    &::-webkit-scrollbar {
      background-color: $bgdark4;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $bgdark3;
    }
    @include breakpoint($lower) {
      box-shadow: 0 1rem 2rem 0rem rgba(black, .5);
    }
  }
}
.widget-wrapper {
  width: 100%;
  max-width: 65rem;
  position: relative;
  border-radius: .5rem .5rem 0 0 ;
  background-color: black;
  padding: .5rem;
}
.widget {
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
    height: 9rem;
    cursor: pointer;
    flex: 2 0 12%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border: 0px solid $bgdark4;
    border-radius: .5rem;
    transition: .1s linear all;
    @include breakpoint($lg) {
    }
    @include breakpoint($md) {
      height: 8rem;
    }
    @include breakpoint($sm) {
      padding: .5rem 1rem;
      height: 4rem;
      overflow: hidden;
      flex: 0 0 20%;
    }
    a {
      text-decoration: underline;
    }
    &.active {
      border: .5rem solid $bgdark4;
    }
    &.set {
      svg {
        fill: $set;
        margin: 0;
        max-height: 3rem;
      }
      .h3 {
        color: $set;
        margin: 0;
      }
      p {
        margin: .5rem;
      }
      @include breakpoint($md) {
        flex: 0 0 20%;
      }
    }
    &.saved {
      svg {
        fill: white;
        max-height: 2rem;
      }
      p {
        margin: 0;
      }
      @include breakpoint($md) {
      }
      @include breakpoint($sm) {
        .h3 {
          flex: 0 0 40% !important;
        }
      }
      .download {
        margin: 0 0 0 .5rem;
        display: flex;
        flex: 2 0 60%;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        //fill: $text;
        @include breakpoint($sm) {
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
    .h3 {
      margin: 0 0 .5rem 0;
      text-align: center;
    }
  }
  .bt-icon {
    width: 5.5rem;
    max-height: 6rem;
    margin: .5rem;
    @include breakpoint($xl) {
      width: 6rem;
    }
    @include breakpoint($md) {
      margin: .25rem;
      max-height: 4rem;
    }
    @include breakpoint($sm) {
      max-height: 3rem;
      margin: .25rem .5rem;
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
        .h3 {
          flex: 0 0 65%;
          text-align: left;
        }
      }
    }
  }
  .by-region {
    .bt-icon {
      height: 6rem;
      max-height: 4rem;
      width: 7rem;
      margin: 0;
      path {
        //fill: $story;
      }
    }
    .block {
      //flex: 1 2 12.5%;
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
        text-align: center;
        margin-bottom: 0;
      }
    }
  }
  .by-set {
    .block {
      @include breakpoint($md) {
        height: 16rem;
      }
      @include breakpoint($sm) {
        height: 8rem;
        flex: 0 0 50%;
      }
    }
  }
}
.tools {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative; // For transition animation
  margin: 2px -2px -.25rem -2px; // For toolbox margins
  padding-bottom: .5rem;

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
    }
  }
}

// Transition-group animation
.tool-tile {
  @include breakpoint($upper) {
    transition: opacity .1s linear;
  }
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
