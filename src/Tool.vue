<template>
  <div v-if="tool" :class="['tool', tool.type]" @click="handleLink">
    <!-- Use VueLazyImageLoading for fade-in effect on load -->
    <lazy-background position="50% 0%" no-ratio :blur="0"
      :src="`${config.imagePrefix}/hero-${tool.image}`"
      placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=">
    </lazy-background>

    <header slot="content">
      <div class="upper">
        <router-link :to="{name: `toolbox-${tool.type}`}">
          <img svg-inline v-if="tool.type == 'tactic'" class="icon" src="./assets/tactic.svg">
          <img svg-inline v-else-if="tool.type == 'theory'" class="icon" src="./assets/theory.svg">
          <img svg-inline v-else-if="tool.type == 'story'" class="icon" src="./assets/story.svg">
          <img svg-inline v-else-if="tool.type == 'principle'" class="icon" src="./assets/principle.svg">
          <img svg-inline v-else-if="tool.type == 'methodology'" class="icon" src="./assets/methodology.svg">
          <h3>{{ typeTextBySlug[tool.type][0] }}</h3>
        </router-link>
        <h1>{{ tool.title }}</h1>
        <img svg-inline v-if="showDocumentLinks" @click="openTab(tool.document_link)" class="edit" alt="Edit this Google Doc" src="./assets/edit.svg">
      </div>
      <div class="lower">
        <div><!-- Always render two divs to ensure proper placement -->
          <div v-if="tool['image-caption']" :class="['caption', tool.type]" v-html="markdown(tool['image-caption'])" />
        </div>
        <a href="#" v-scroll-to="{el: '#video', offset: -16 * 6.5, duration: 200}">
          <img svg-inline v-if="tool.video" class="icon video" src="./assets/video.svg">
        </a>
      </div>
    </header>

    <main>
      <!-- Tool -->
      <article>
        <div class="inner">
          <div :class="['breadcrumbs', tool.type]">
            <router-link to="/toolbox">Toolbox</router-link> /
            <router-link :to="{name: `toolbox-${tool.type}`}">{{ typeTextBySlug[tool.type][0] }}</router-link> /
            <router-link :to="{name: 'tool', params: {slug: tool.slug}}">{{ tool.title }}</router-link>
          </div>
          <div class="epigraphs" v-if="tool.epigraphs">
            <div v-for="(e, i) in tool.epigraphs" :key="i">
              <div class="quote" v-html="markdown(e.replace(/(—[^—]+)$/g, ''))" />
              <div class="attribution" v-html="markdown(e.replace(/^([^—]+)/g, ''))" />
            </div>
          </div>
          <div class="origins" v-if="tool.origins">
            <strong>ORIGINS</strong>: <em v-html="markdown(tool.origins)" />
          </div>
          <div class="image" v-if="tool['image-2']">
            <p><img :src="`${config.imagePrefix}/medium-${tool['image-2']}`"></p>
          </div>

          <div v-if="tool.video && /youtube/.test(tool.video)">
            <div class="write-up" v-html="writeUpSplit[0]" />
            <youtube id="video" ref="video" :videoId="tool.video" />
            <div class="write-up" v-html="writeUpSplit[1]" />
          </div>
          <div v-else class="write-up" v-html="writeUp" />
          <div class="clear" />


          <div v-if="tool['key-modules']" class="key-tools">
            <expander v-for="(v, k) of tool['key-modules']" :key="k" :open="true" :name="k" :class="keyTextByEntry[k][2]">
              <template v-slot:title>
                <img svg-inline v-if="keyTextByEntry[k][2] == 'tactic'" class="icon" src="./assets/tactic.svg">
                <img svg-inline v-else-if="keyTextByEntry[k][2] == 'theory'" class="icon" src="./assets/theory.svg">
                <img svg-inline v-else-if="keyTextByEntry[k][2] == 'story'" class="icon" src="./assets/story.svg">
                <img svg-inline v-else-if="keyTextByEntry[k][2] == 'principle'" class="icon" src="./assets/principle.svg">
                <img svg-inline v-else-if="keyTextByEntry[k][2] == 'methodology'" class="icon" src="./assets/methodology.svg">
                {{ keyTextByEntry[k][+(v.length > 1)] }}
              </template>
              <div v-for="(each, i) in v" :key="i">
                <div v-html="markdown(`[**${each[0]}**](/tool/${each[2]}) – ${each[1]}`)"/>
              </div>
            </expander>
          </div>
          <expander :key="`how-${tool.slug}`" :open="true" class="methodology" :name="'how-to-use'" v-if="tool['how-to-use']">
            <template v-slot:title>HOW TO USE</template>
            <div v-html="markdown(tool['how-to-use'])" />
          </expander>
          <expander :key="`rwe-${tool.slug}`" :open="true" :name="'real-world-examples'"
            v-if="tool['real-world-examples'] && tool['real-world-examples'].length">
            <template v-slot:title>REAL WORLD EXAMPLES</template>
            <div v-for="(rwe, i) in tool['real-world-examples']" :key="i" class="rwe">
              <a :href="rwe.link" target="_blank">
                <h5>{{ rwe.title }}</h5>
                <div v-html="markdown(rwe.description)" />
                <img v-if="rwe.image" :src="`${config.imagePrefix}/${rwe.image}`">
              </a>
            </div>
          </expander>
          <expander :key="`learn-${tool.slug}`" :open="true" :name="'learn-more'"
            v-if="tool['learn-more'] && tool['learn-more'].length">
            <template v-slot:title>LEARN MORE</template>
            <div v-for="(lm, i) in tool['learn-more']" :key="i">
              <a :href="lm.link" target="_blank" class="lm">
                <h5>{{ lm.title }}</h5><span v-if="lm.source">&nbsp; | &nbsp;{{ lm.source }}</span><span v-if="lm.year">, {{ lm.year }}</span>
              </a>
            </div>
          </expander>
          <expander :open="false" :name="'contribute'">
            <template v-slot:title>HAVE YOU SEEN OR USED THIS {{ typeTextBySlug[tool.type][0] }}?</template>
          </expander>
        </div>
      </article>

      <!-- Sidebar -->
      <aside>
        <section class="actions">
          <span @click="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)">
            <img v-if="$store.state.savedTools.has(tool.slug)"
              svg-inline :class="['icon', 'active', tool.type]" src="./assets/favorite-active.svg">
            <img v-else svg-inline class="icon" src="./assets/favorite.svg">
          </span>
          <a :href="`${config.pdf}/download?tools=${tool.slug}`" target="_blank">
            <img svg-inline class="icon" src="./assets/download.svg">
          </a>
          <a :href="shareUrlFacebook" target="_blank" rel="external">
            <img svg-inline class="icon" src="./assets/facebook.svg">
          </a>
          <a :href="shareUrlTwitter" target="_blank" rel="external">
            <img svg-inline class="icon" src="./assets/twitter.svg">
          </a>
          <a :href="shareUrlEmail" target="_blank" rel="external">
            <img svg-inline class="icon" src="./assets/email.svg">
          </a>
        </section>
        <section v-if="tool['potential-risks']" class="risks">
          <h4>POTENTIAL RISKS</h4>
          <div v-html="markdown(tool['potential-risks'])" />
          <hr>
        </section>
        <section v-if="tool['why-it-worked']" class="worked">
          <h4>WHY IT WORKED</h4>
          <div v-html="markdown(tool['why-it-worked'])" />
          <hr>
        </section>
        <section v-if="tool['why-it-failed']" class="failed">
          <h4>WHY IT FAILED</h4>
          <div v-html="markdown(tool['why-it-failed'])" />
          <hr>
        </section>
        <section class="related">
          <h4>RELATED TOOLS</h4>
          <div v-for="T in Object.keys(randomRelated)" :key="T" :class="T">
            <div class="type">
              <router-link :to="{name: `toolbox-${T}`}">
                <img svg-inline v-if="T == 'tactic'" class="icon" src="./assets/tactic.svg">
                <img svg-inline v-else-if="T == 'theory'" class="icon" src="./assets/theory.svg">
                <img svg-inline v-else-if="T == 'story'" class="icon" src="./assets/story.svg">
                <img svg-inline v-else-if="T == 'principle'" class="icon" src="./assets/principle.svg">
                <img svg-inline v-else-if="T == 'methodology'" class="icon" src="./assets/methodology.svg">
                <h2>{{ typeTextBySlug[T][1] }}</h2>
              </router-link>
              <span :class="{T: true, open: expandRelated[T]}" v-if="randomRelated[T].length > 5"
                @click="$set(expandRelated, T, !expandRelated[T])" />
            </div>
            <div class="titles">
              <div class="related-link" v-for="[s, show] in randomRelated[T]" :key="s">
                <transition name="fade">
                  <div v-if="expandRelated[T] || show">
                    <router-link :to="{name: 'tool', params: {slug: s}}"
                      :class="{'key-related': keySlugs.has(s)}">
                      {{ $store.state.toolsBySlug[s].title }}
                      <popup :tools="[s]" light class="tool-popup" />
                    </router-link>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          <hr>
        </section>
        <section v-if="authors && authors.length" class="authors">
          <h4>{{ ['CONTRIBUTOR', 'CONTRIBUTORS'][+(authors.length > 1)] }}</h4>
          <div v-for="a in authors" :key="a.slug">
            <div class="upper">
              <img :src="`${config.imagePrefix}/icon-${a.image}`">
              <div>
                <h3>{{ a.title }}</h3>
                <div>{{ a['team-title'] }}</div>
              </div>
            </div>
            <div class="lower" v-html="markdown(a.bio)" />
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<script>
import Expander from './Expander'
import typeTextByLang from './types'
import keyTextByLang from './keys'

const crlf = '%0d%0a'

export default {
  name: 'Tool',
  data: () => ({
    authors: null,
    showDocumentLinks: window.btData.showDocumentLinks,
    types: {story: 'stories', tactic: 'tactics', theory: 'theories', principle: 'principles', methodology: 'methodologies'},
    expandRelated: {},
  }),
  components: {
    Expander,
    Popup: () => import(/* webpackPrefetch: true */ './Popup.vue'),
    Youtube: () => import('./Youtube.vue'),
    //Youtube: () => import(/* webpackPrefetch: true */ './Youtube.vue'),
  },
  computed: {
    tool() {
      return this.$store.state.toolsBySlug[this.$route.params.slug]
    },
    keySlugs() {
      let slugs = new Set()
      Object.values(this.tool['key-modules'] || []).forEach(a => a.forEach(i => slugs.add(i[2])))
      return slugs
    },
    keyTextByEntry() { // 'key-type-plural' -> ['Key singular', 'Key plural', 'type-slug']
      let text = keyTextByLang[this.$store.state.lang]
      return Object.fromEntries(
        Object.entries(this.types).map(([k, v]) => [`key-${v}`, [text[`key-${k}`], text[`key-${v}`], k]])
      )
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    },
    writeUp() {
      return this.writeUpAsParagraphArray.join(' ')
    },
    writeUpAsParagraphArray() {
      // TODO: module-type-effective logic (see RED text document prepared for Troels)
      let text = this.tool['full-write-up'] || this.tool['short-write-up'] || this.tool['snapshot']
      text = this.markdown(text)
      // Remove outermost <p>...</p> tags, split to array on inner </p><p> junctions, and re-wrap
      let paragraphs = text.replace(/(^<p>|<\/p>$)/g, '').split(/<\/p>\s*<p>/).map(p => `<p>${p}</p>`)
      if (this.tool['pull-quote']) {
        if (paragraphs.length > 1) {
          let quote = `<blockquote class="pull-quote">${this.markdown(this.tool['pull-quote'])}</blockquote>`
          paragraphs.splice(paragraphs.length < 4 ? 1 : 2, 0, quote)
        }
      }
      return paragraphs
    },
    writeUpSplit() {
      return [
        this.writeUpAsParagraphArray.slice(0, 5).join(' '),
        this.writeUpAsParagraphArray.slice(5).join(' ')
      ]
    },
    randomRelated() {
      // TODO use keySlugs
      return Object.fromEntries(
        Object.keys(this.types)
          .filter(T => (this.tool[this.types[T]] || []).length)
          .map(T => {
            // this.types.forEach
            let slugs = this.tool[this.types[T]]
            let indices = new Set([...Array(slugs.length).keys()].sort(() => 0.5 - Math.random()).slice(0, 5))
            //console.log('i', indices)
            return [T, slugs.map((s, i) => [s, indices.has(i)])]
          })
      )
    },
    shareUrlEmail() {
      return `mailto:?subject=${this.capitalize(this.typeTextBySlug[this.tool.type][0])}: ${this.tool.title}&body=${this.tool.snapshot}${crlf}${crlf}${this.config.siteUrl}/${this.$store.state.lang}/${this.tool.slug}`
    },
    shareUrlFacebook() {
      return `https://facebook.com/sharer/sharer.php?u=${this.config.siteUrl}/${this.$store.state.lang}/${this.tool.slug}`
    },
    shareUrlTwitter() {
      return `https://twitter.com/intent/tweet?text=${this.tool.title}&url=${this.config.siteUrl}/${this.$store.state.lang}/${this.tool.slug}`
    },
  },
  methods: {
    handleLink($event) {
      let { target } = $event
      // Ascend elements to reach the link
      while (target && target.tagName != 'A') target = target.parentNode
      // Only match local links
      if (target && target.href && target.rel != 'external' &&
          (target.matches(`.tool a[href*="://${this.config.siteDomain}"]`)
           || target.matches('.tool a:not([href*="://"])'))) {
        const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } = $event
        if (altKey || ctrlKey || metaKey || shiftKey) return
        if (defaultPrevented) return
        if (button !== undefined && button !== 0) return
        const url = new URL(target.href)
        if ($event.preventDefault) {
          $event.preventDefault()
          if (window.location.pathname != url.pathname || window.location.hash != url.hash) {
            // For some reason this throws an undefined exception on language-setting links
            this.$router.push({path: url.pathname, hash: url.hash}).catch(e => e)
          }
        }
      }
    },
    initPage() {
      this.expandRelated = {story: false, tactic: false, theory: false, principle: false, methodology: false}
      this.authors = []
      if (this.tool)
        this.tool.authors.map(a => this.$http.get(`${this.config.api}/person/${a}?lang=${this.$store.state.lang}`)
                                     .then(r => this.authors.push(r.data)))
    },
  },
  watch: {
    $route() {
      this.initPage()
    },
  },
  created() {
    this.initPage()
  },
};
</script>

<style lang="scss">
@import 'common.scss';

//$image-height: 45rem;
$image-height: calc(100vh - #{$uppermenu + $lowermenu});
$image-height-max: 60rem;
$sidebar: 18rem;

.tool {
  .lazy-background {
    position: absolute;
    z-index: 0;
    height: $image-height;
    max-height: $image-height-max;
  }
  .lazy-background-image {
    background: black;
    transition: all .4s linear;
    &::before {
      content: "";
      //transition: opacity .1s ease-in-out;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.3) 80%, rgba(0,0,0,.7) 100%);
      position: absolute;
      top: 0; left: 0;
      bottom: 0; right: 0;
    }
  }
  header {
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    height: $image-height;
    max-height: $image-height-max;
    a {
      text-decoration: none;
    }
    h1, h3 {
      text-align: center;
      text-shadow: 1px 0px 6px rgba(black, .5);
    }
    h1 {
      color: white;
      margin: 0 3rem;
    }
    h3 {
      margin: 0;
    }
    .edit {
      cursor: pointer;
      position: absolute;
      height: 2rem;
      width: 2rem;
      top: 1rem; right: 1rem;
      filter: drop-shadow(0 0 1.5rem black);
      path {
        fill: white;
      }
    }
    .icon {
      margin-bottom: .5rem;
      filter: drop-shadow(0px 0px 20px rgba(black, .2));
    }
    .upper {
      //height: 70%; // Adjusted because of calc-based $image-height
      height: 80%;
      margin-top: 10rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .lower {
      width: 100%;
      //min-height: 20rem; // Disabled because of calc-based $image-height
      text-align: initial;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    }
    .caption {
      text-shadow: 1.5px 1.5px 1.5px rgba(black, .5);
      max-width: 25rem;
      padding: 0 1rem;
      margin: 2rem 3rem;
      border-style: solid;
      border-width: 0 0 0 .3rem;
      transition: all .1s ease-in-out;
      &:hover {
        border-width: 0 0 0 .6rem;
      }
      .rtl & {
        border-width: 0 .3rem 0 0;
      }
      p {
        margin: 0;
      }
    }
    .video {
      margin: 1rem 2.5rem;
      fill: white;
      max-width: 2.5rem;
      max-height: 3.5rem;
    }
  }
  main {
    //position: absolute;
    display: flex;
    flex-direction: row;
    background: $bggray;
    padding: 1rem 0;
    &::before {
      content: "";
      height: 5rem;
      top: -5rem;
      left: 0; right: 0;
      position: absolute;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.2) 100%);
      pointer-events: none;
    }
    a {
      text-decoration: none;
    }
    h4 {
      color: $text;
      margin: .5rem 0;
    }
    .expander {
      h4 {
        text-transform: uppercase;
      }
    }
  }
  article {
    flex: 1 0 66%;
    background: white;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    box-shadow: .3rem 0 .5rem .25rem $shadow;
    padding: 2rem;
    blockquote p {
      margin: 0;
    }
    blockquote.pull-quote {
      display: block;
      position: relative;
      float: left;
      //text-transform: uppercase;
      color: $text;
      font-size: 1.25rem;
      user-select: none;
      margin: 3rem 1rem 3rem -20%;
      padding: 0 1rem;
      border-width: .3rem;
      border-left-style: solid;
      width: 25rem;
      max-width: 50%;
      transition: all .1s ease-in-out;
      &:hover {
        border-width: .6rem;
      }
      .rtl & {
        margin: 3rem -5rem 3rem 1rem;
        float: right;
        border-left-style: none;
        border-right-style: solid;
      }
      p {
        margin: 0;
      }
    }
    h6 {
      font-size: 1rem;
      margin: .25rem;
    }
    .inner {
      flex: 0 0 66%;
      // TODO: Figure out how to achieve this while placing it correctly
      //max-width: 800px;
      img {
        max-width: 100%;
      }
    }
    .breadcrumbs {
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .breadcrumbs.tactic { color: $tactic; }
    .breadcrumbs.theory { color: $theory; }
    .breadcrumbs.story { color: $story; }
    .breadcrumbs.principle { color: $principle; }
    .breadcrumbs.methodology { color: $methodology; }
    .epigraphs {
      margin: 0 1rem 1.5rem 1rem;
      p {
        margin: 0;
        font-size: .9rem;
        font-style: italic;
      }
      .quote {
      }
      .attribution {
        color: $bgdark3;
        margin-bottom: 1rem;
      }
    }
    .origins {
      p:first-of-type {
        display: inline;
      }
      margin-bottom: 1.5rem;
    }
    .learn-more, .real-world-examples {
      img {
        max-height: 20rem;
        margin: .5rem 0 .5rem 0;
        border: 1px solid $bgdark1;
      }
      p {
        margin: 0;
      }
    }
    .rwe {
      margin-bottom: .5rem;
    }
    .lm {
      display: block;
      margin-bottom: .5rem;
    }
    .key-tools {
      p:first-of-type {
        margin-top: .25rem;
      }
      .icon {
        display: inline;
        max-height: 1.5rem;
        max-width: 1.5rem;
        margin: 0 .25rem -.4rem 0;
        .rtl & {
          margin: .25rem 0 -.4rem .5rem;
        }
      }
    }
  }
  aside {
    height: 100%;
    flex: 2 0 33%;
    padding: 0 2rem;
    h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    hr {
      max-width: 10rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      align-items: center;
      .icon {
        max-width: 3rem;
        cursor: pointer;
        margin: 0 .5rem 0 0;
        .rtl & {
          margin: 0 0 0 .5rem;
        }
        &.tactic { fill: $tactic; }
        &.theory { fill: $theory; }
        &.story { fill: $story; }
        &.principle { fill: $principle; }
        &.methodology { fill: $methodology; }
        &.active {
          animation-name: add-favorite;
          animation-duration: .5s;
          animation-iteration-count: 1;
        }
      }
    }
    .risks, .worked, .failed {
      max-width: $sidebar;
    }
    .related {
      .type {
        display: flex;
        position: relative;
        flex-direction: row;
        svg, h2 {
          display: inline-block;
        }
        span {
          padding: .25rem .5rem;
          width: 3rem;
          cursor: pointer;
          &.open::after {
            transform: scaleY(-1);
          }
          &::after {
            transition: all .2s ease-out;
            position: absolute;
            top: .5rem;
            content: "";
            border-top-width: .7rem;
            border-top-style: solid;
            border-left: .5rem solid transparent;
            border-right: .5rem solid transparent;
          }
        }
      }
      .titles {
        margin-bottom: 1rem;
      }
      .icon {
        max-height: 1.5rem;
        max-width: 1.5rem;
        margin: 0 .25rem 0 0;
        margin-bottom: -.2rem;
        .rtl & {
          margin: .25rem 0 0 .5rem;
        }
      }
      .related-link {
        a {
          position: relative;
          display: inline-block;
          z-index: 2;
        }
        @include breakpoint($upper) {
          &:hover {
            a {
              text-decoration: underline;
              &::before {
                // Disabled until a better design emerges
                //content: "";
                top: -1px; bottom: -3px;
                left: -2rem; right: -1rem;
                background: white;
                box-shadow: .3rem 0 .5rem white;
                outline: 1px solid white;
                position: absolute;
                z-index: -1;
                .rtl & {
                  left: -1rem; right: -2rem;
                }
              }
            }
            .tool-popup {
              display: initial;
            }
          }
        }
      }
      .key-related::after {
        content: "*";
        position: absolute;
        left: -10px;
        top: 3px;
        .rtl & {
          left: unset;
          right: -10px;
        }
      }
      @mixin type-related($color) {
        a, h2, h3 { color: $color; }
        span::after { border-top-color: $color; }
      }
      .tactic { @include type-related($tactic); }
      .theory { @include type-related($theory); }
      .story { @include type-related($story); }
      .principle { @include type-related($principle); }
      .methodology { @include type-related($methodology); }
      .tool-popup {
        display: flex;
        position: absolute;
        top: -.5rem;
        right: 100%;
        margin: 0 1rem 0 0;
        display: none;
        box-shadow: .1rem 0 .2rem .2rem $shadow;
        border: 4px soild $methodology;
        .icon {
          max-width: 3rem;
          margin: 0;
        }
        .rtl & {
          right: unset;
          left: 100%;
          margin: 0 0 0 1rem;
        }
      }
    }
    .authors {
      max-width: $sidebar;
      img {
        border-radius: 50%;
        margin: 0 1rem 0 0;
        .rtl & {
          margin: 0 0 0 1rem;
        }
      }
      .upper {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        h3 {
          font-weight: normal;
          color: $text;
          margin: 0 0 .1rem 0;
        }
        div {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
        }
      }
    }
  }
}
.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

</style>
