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
          <div :class="{tab: true, active: activeTabOnCondition(tab == 'collection')}" @click="tab = 'collection'">
            {{ collectionTabText }}
          </div>

          <!-- Label + tab for regions -->
          <div v-if="collection == 'story'" class="plain">
            {{ text['site.sentence.from'] }}
          </div>
          <div v-if="collection == 'story'" :class="{tab: true, active: activeTabOnCondition(tab == 'story')}" @click="tab = 'story'">
            {{ text[`type.story.region.${region}`] }}
          </div>

          <!-- Label for all collection search + sets -->
          <div v-if="collection != 'saved'" class="plain">
            {{ text['site.sentence.about'] }}
          </div>

          <!-- When the active collection is set, switch tabs for clarity about what's going on -->
          <autocomplete class="autocomplete-wrapper" v-show="collection != 'saved'" ref="search"
            @click="tab = collection == 'set' ? 'set' : tab"
            @submit="submitSearch"
            @focus="searchTabActive = true"
            @blur="searchTabActive = false"
            :placeholder="text[collection == 'set' ? `set.${set}` : 'site.sentence.everything']"
            :search="getAutocompletions"
            :get-result-value="autocompletion => autocompletion.text"
            >
            <!-- Auto-select needs some thought. Otherwise lots of users will just get the #BlackLivesMatter set and be stuck
            auto-select
            -->
            <template #result="{result, props}">
              <li v-bind="props" :class="['autocomplete-result', result.icon]">
                {{ result.text }}
              </li>
            </template>
          </autocomplete>

          <!-- Show reset when any filters are applied (set/region have default values and therefore don't count) -->
          <img v-if="collection != ALL || tag || query"
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
              <div :class="{block: true, all: true, active: collection == ALL}" @click="selectCollection(ALL)">
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

              <div :class="{block: true, saved: true, active: collection == 'saved'}" @click="selectCollection('saved')">
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
                <div class="h3 set">{{ text[`set.${slug}`] }}</div>
                <div v-html="markdown(text[`set.${slug}.description`])" />
              </div>
            </div>

          </transition>
        </div>
      </div>
    </div>

    <transition-group name="tools-list" tag="div" class="tools">
      <tool-tile v-for="tool in filteredTools" :key="tool.slug" :tool="tool" :text="text" />
      <tool-tile v-if="!['set', 'saved'].includes(collection)" :key="1" :text="text" :alt="'suggest'" />
      <tool-tile v-if="collection == 'saved' && !$store.state.savedTools.size" :key="2" :text="text" :alt="'nosave'" />
    </transition-group>

  </div>
</template>

<script>
import Search from './Search'
import ToolTile from './ToolTile'
import sets from './sets'


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
    searchTabActive: false,
  }),
  components: {
    ToolTile,
    Search,
  },
  computed: {
    text() {
      return this.textByLang[this.$store.state.lang]
    },
    collectionTabText() {
      if (this.collection == ALL)
        return this.text['site.sentence.everything']
      return this.text[`type.${this.collection}${['saved', 'set', 'search'].includes(this.collection) ? '' : '.plural'}`]
    },

    // Filter functions for every collection type
    filterFunctionsByCollection() {
      return Object.assign(
        Object.fromEntries(this.types.map(T => [T, t => t['module-type-effective'] != 'snapshot' && t.type == T])),
        {
          [ALL]: t => t['module-type-effective'] != 'snapshot',
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
      return (this.$store.state.tools || []).filter(this.filterFunctionsByCollection[this.collection])
    },
    // Stage 2 tool filtering (tag/query)
    filteredTools() {
      return this.filteredToolsByCollection
        .filter(t => !this.tag || (t.tags || []).includes(this.tag))
        //.filter(t => !this.$store.state.searchResults.length || this.$store.state.searchResults.includes(t.slug))
        .filter(t => !this.query || this.$store.state.searchResults.includes(t.slug))
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

    autocompletionTags() {
      return [...new Set(this.filteredToolsByCollection.map(t => t.tags).flat())]
        .map(slug => ({
          type: 'tag',
          icon: 'tag',
          value: slug,
          text: this.text[`tag.${slug}`],
        }))
        .filter(t => t.text)
    },
    autocompletionTitles() {
      return this.filteredToolsByCollection
        .map(tool => ({
          type: 'title',
          icon: tool.type,
          value: tool.slug,
          text: tool.title
        }))
    },
    autocompletionSets() {
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
    activeTabOnCondition(condition) {
      return condition && !this.searchTabActive
    },
    getAutocompletions(text) {
      let autocompletions = []
      // Start with autocompletions possible for all tab
      if (this.collection == ALL) {
        autocompletions = this.autocompletionSets
      }
      // Then for set tab, other tabs w/text entered, and fall back to tags when field is blank
      if (this.collection == 'set') {
        autocompletions = this.autocompletionSets
      } else if (text.length) {
        autocompletions = [...autocompletions, ...this.autocompletionTags, ...this.autocompletionTitles]
      } else {
        autocompletions = [...autocompletions, ...this.autocompletionTags]
      }
      // Limit autocompletions to a lowercase exact match
      let lowerText = text.toLocaleLowerCase()
      autocompletions = autocompletions
        .filter(i => i.text.toLocaleLowerCase().includes(lowerText))
        .sort((a, b) => a.text > b.text ? 1 : -1)
      /* This is only useful when auto-select is enabled
      // If there's no exact match, add the user's text as a completion
      if (text && !autocompletions.filter(i => i.text.toLocaleLowerCase() == lowerText).length) {
        autocompletions.splice(0, 0, {
          type: 'search',
          icon: 'search',
          value: text,
          text: text,
        })
      }
      */
      // TODO: if auto-select prop is enabled, we may want to introduce a "do nothing" autocompletion first in the list
      return autocompletions
    },
    submitSearch(autocompletion) {
      let text = this.$refs.search.value
      if (autocompletion) {
        // Without the auto-select prop, it's possible to get a search with no autocompletion object
        if (autocompletion.type == 'search') {
          this.selectQuery(text)
        } else {
          this.selectQuery()
          if (autocompletion.type == 'title') {
            this.$router.push({name: 'tool', params: {slug: autocompletion.value}})
            return // Don't preserve the input field
          } else if (autocompletion.type == 'tag') {
            this.selectTag(autocompletion.value)
          } else if (autocompletion.type == 'set') {
            this.selectCollection('set')
            this.selectSet(autocompletion.value)
          }
        }
      } else {
        // No autocompletion was given, but we can still do/clear a query (this is only reached if auto-select is disabled)
        this.selectQuery(text)
      }
      // Preserve the text
      this.$nextTick(() => { this.$refs.search.value = autocompletion && autocompletion.text || text })
    },

    // Methods to mutate the current filtering
    reset(reroute = true) {
      this.selectQuery()
      this.selectRegion()
      this.selectSet()
      this.selectTag()
      // TODO: ensure this handles all cases where we might want to reset
      if (reroute && this.collection != ALL) {
        this.tab = 'collection'
        this.$router.push({name: 'toolbox'})
      }
    },
    selectCollection(collection) {
      let switchToSecondaryTab = ['story', 'set'].includes(collection)
      if (collection != this.collection) {
        // Change the active collection
        this.tab = switchToSecondaryTab ? collection : 'collection'
        this.reset(false)
        this.$router.push({
          name: 'toolbox',
          params: collection == ALL ? {} : {collection},
        })
      } else if (switchToSecondaryTab) {
        // The collection is already active, but we should switch to its secondary tab
        this.tab = collection
      }
    },
    selectRegion(region) {
      this.region_ = region == this.region_ ? null : region
    },
    selectSet(set, $event) {
      if ($event !== undefined && this.set_ != set) {
        // Don't open links accidentally
        $event.preventDefault()
      }
      this.set_ = set
      this.$refs.search.setValue('')
    },
    selectTag(tag) {
      this.tag = tag || null
    },
    selectQuery(query) {
      this.query = query || null
      this.$refs.search.setValue(query || '')
      if (query) {
        this.$store.dispatch('SEARCH', this.query)
      }
    }
  },
  metaInfo() {
    return { title: `${this.text['site.toolbox'] || 'Toolbox'} — Beautiful Trouble` }
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
  @include breakpoint($sm) {
    min-height: 16rem;
  }
  // Mobile header adjustments for the Squarespace theme
  @media #{$ss-mobile-header} {
    height: 30vh;
  }

  @mixin hero-particulars($type, $color) {
    //background-image: url(#{$imagePrefix}/hero-pattern-#{$type}.jpg);
    background-size: cover;
    background-position: 50% 20%;
    &::before {
      background: linear-gradient(to top right, rgba($color,0) 0%, rgba($color,.2) 30%, rgba($color,.6) 100%),
                  linear-gradient(to bottom, rgba(black,0) 0%, rgba(black,.6) 70%, rgba(black,.9) 100%);
    }
  }
  @include hero-particulars(all, black);
  background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMcGxsbHB8fHx8fHx8fHx//2wBDAQcHBw0MDRgQEBgaFREVGh8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//wAARCAABB30DAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEC/8QAFRABAQAAAAAAAAAAAAAAAAAAAAH/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBgf/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8Aw9i+TgCKIKCoogCqgICKoKiiAiqgIogqKqAKqAiqiqgIogqKIKiqgIqxlVQEVUUQWIqoCKsRRBUVWVEUQVFVFIgqKqKRFVkEVUVUBFVFVARRFWIqsgigqsqqAiqKRlVQEVUURQVWRUUFVFEUQVFEUFVFEBFUURRBUUFVFGWosStQZbistwRuCNRWW4I6QRuCNwRuCNwRuCOkRG4DcEbgjpBG4DcEbiI3AagjcEbgjUBuCNRUagjUBoRVRoQBVQBQBFUBABUUBQEAFQAAVAAiCgQBBYAIRBQEFARAFQAUQQWACKgAqAIIKCiCACoiwBBQBAFQERQUBEAUBBRBBYACogCoEEAUBBRAAFQAEQBQAAUBAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//Z');
  background-size: 100%;
  background-position: 50% 50%;
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
    min-height: unset;
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

    &.active {
      color: white;
      border-top: .5rem solid $bgdark3;
    }
    @include breakpoint($upper) {
      transition: all .1s linear;
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
      border-radius: 0;
      &.active {
        border: none;
        border-inline-start: .75rem solid $bgdark3;
      }
    }
  }
  .reset {
    flex: 0 0 2.5rem; // width + margin
    margin: .65rem 0;
    width: 1.7rem;
    height: 1.7rem;
    cursor: pointer;
    fill: $bggray;
    transform: rotate(-32deg);
    .rtl & {
      transform: scaleX(-1);
    }
    @include breakpoint($upper) {
      transition: transform .2s linear;
      &:hover {
        transform: scale(1.25) rotate(-60deg);
        fill: white;
      }
    }
    @include breakpoint($sm) {
      position: absolute;
      width: 3rem;
      height: 3rem;
      padding: .5rem;
      margin: 0;
      right: .25rem;
      top: 0;
      .rtl & {
        right: unset;
        left: .25rem;
      }
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
  .autocomplete-input {
    // SEE icons.scss for background-image icons
    font-family: ff-good-headline-web-pro-condensed, sans-serif;
    font-size: 1.4rem;
    text-transform: uppercase;
    color: $bgdark3;
    padding: .1rem 1rem .4rem 3rem;
    background-color: black;

    position: relative;
    border: none;
    border-top: .5rem solid black;
    border-radius: .5rem .5rem 0 0;
    &[aria-expanded=true], &:focus {
      color: white;
      border-top: .5rem solid $bgdark3;
      box-shadow: 0 0 .5rem rgba(0,0,0,.16) inset;
    }
    &::placeholder, &::-webkit-input-placeholder {
      border-bottom: 1px solid $bgdark3;
      color: $text;
    }
    @include breakpoint($sm) {
      border: none;
      border-radius: 0;
      border-inline-start: .75rem solid black;
      &[aria-expanded=true], &:focus {
        border: none;
        border-radius: 0;
        border-inline-start: .75rem solid $bgdark3;
      }
    }
  }

  .autocomplete-result {
    background-size: 1.5rem;
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
      }
      .h3 {
        color: $set;
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
    }
    .block {
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
    flex-wrap: wrap;
    .block {
      align-items: flex-start;
      justify-content: flex-start;
      padding: .25rem .5rem;
      .h3 {
        margin: .25rem;
        text-align: start;
        line-height: .9;
      }
      p {
        font-size: .7rem;
        margin: 0 .25rem .25rem .25rem;
      }
      @include breakpoint($sm) {
        height: 7rem;
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
