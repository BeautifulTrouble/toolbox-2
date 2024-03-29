<template>
  <div v-if="tool" :class="['tool', tool.type]" @click="handleLink">
    <Teleport to="head">
      <title>{{ tool.title }} — Beautiful Trouble</title>
      <link rel="canonical" :href="`${config.siteUrl}/toolbox/tool/${tool.slug}`">
      <meta name="meta" :content="tool.snapshot">
      <meta property="og:title" name="meta" :content="tool.title">
      <meta property="og:site_name" name="meta" content="Beautiful Trouble">
      <meta property="og:description" name="meta" :content="tool.snapshot">
      <meta property="og:type" name="meta" content="article">
      <meta property="og:url" name="meta" :content="`${config.siteUrl}/toolbox/tool/${tool.slug}`">
      <meta property="og:image" name="meta" :content="`${config.imagePrefix}/${tool.image}`">
      <meta itemprop="name" name="meta" :content="tool.title">
      <meta itemprop="url" name="meta" :content="`${config.siteUrl}/toolbox/tool/${tool.slug}`">
      <meta itemprop="thumbnailUrl" name="meta" :content="`${config.imagePrefix}/thumbnail-${tool.image}`">
      <meta itemprop="description" name="meta" :content="tool.snapshot">
      <meta itemprop="image" name="meta" :content="`${config.imagePrefix}/${tool.image}`">
    </Teleport>

    <header slot="content" :style="'background-image: url(' + tool['hero-image'] + ')'">
      <div class="upper">
        <router-link :to="{name: 'toolbox', params: {collection: tool.type}}">
          <img svg-inline v-if="tool.type == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
          <img svg-inline v-else-if="tool.type == 'theory'" class="bt-icon" src="./assets/theory.svg">
          <img svg-inline v-else-if="tool.type == 'story'" class="bt-icon" src="./assets/story.svg">
          <img svg-inline v-else-if="tool.type == 'principle'" class="bt-icon" src="./assets/principle.svg">
          <img svg-inline v-else-if="tool.type == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
          <div class="h2">{{ text[`type.${tool.type}`] }}</div>
        </router-link>
        <div class="h1" @dblclick="openTab(tool.document_link)">{{ tool.title }}</div>
      </div>
      <div class="lower">
        <div><!-- Always render two divs to ensure proper placement -->
          <div v-if="tool['image-caption']" :class="['caption', tool.type]" v-html="markdown(tool['image-caption'])" />
        </div>
        <a href="#" v-scroll-to="{el: '#video', offset: -16 * 10.0, duration: 200}">
          <img svg-inline v-if="tool.video" class="bt-icon video" src="./assets/video.svg">
        </a>
      </div>
    </header>

    <nav>
      <div class="breadcrumbs">
        <div class="inner">
          <div :class="tool.type">
            <router-link :to="{name: 'toolbox'}">{{ text['site.toolbox'] }}</router-link><span class="bullet">&bullet;</span>
            <router-link :to="{name: 'toolbox', params: {collection: tool.type}}">{{ text[`type.${tool.type}.plural`] }}</router-link><span class="bullet">&bullet;</span>
            <router-link :to="{name: 'tool', params: {slug: tool.slug}}">{{ tool.title }}</router-link>
          </div>
        </div>
      </div>
      <aside>
        <section class="actions">
          <span @click="$store.dispatch('TOOL_SAVE_TOGGLE', tool.slug)" :title="text['site.saved']">
            <img v-if="$store.state.savedTools.has(tool.slug)"
              svg-inline :class="['bt-icon', 'active', tool.type]" src="./assets/favorite-active.svg">
            <img v-else svg-inline class="bt-icon" src="./assets/favorite.svg">
          </span>
          <div @click="downloadPDF(tool.slug)" :title="text['site.downloadpdf']">
            <img svg-inline class="bt-icon" src="./assets/download.svg">
          </div>
          <a :href="shareUrlFacebook" target="_blank" rel="external">
            <img svg-inline class="bt-icon" src="./assets/facebook.svg">
          </a>
          <a :href="shareUrlTwitter" target="_blank" rel="external">
            <img svg-inline class="bt-icon" src="./assets/twitter.svg">
          </a>
          <a :href="shareUrlEmail" target="_blank" rel="external">
            <img svg-inline class="bt-icon" src="./assets/email.svg">
          </a>
        </section>
      </aside>
    </nav>

    <main>
      <!-- Tool -->
      <article>
        <div class="inner">
          <div v-html="markdown(tool['snapshot'])" :class="['box', tool.type, 'snapshot']" />
          <!-- Snapshot-only write up -->
          <!-- TODO: clean up these classes
          <div v-if="!writeUp || moreThanASnapshotInEnglish">
            <div :class="[moreThanASnapshotInEnglish ? 'snapshot' : 'snapshot-only']" v-html="markdown(tool['snapshot'])" />
          </div>
          -->


          <div class="epigraphs" v-if="tool.epigraphs">
            <div v-for="(e, i) in tool.epigraphs" :key="i">
              <div class="quote" v-html="markdown(e.split(/—([^—]+)$/)[0])" />
              <div class="attribution" v-html="markdown(e.split(/—([^—]+)$/)[1])" />
            </div>
          </div>
          <div class="origins" v-if="tool.origins">
            <strong>{{ text['meta.origins'] }}</strong>: <em v-html="markdown(tool.origins)" />
          </div>
          <div class="image" v-if="tool['image-2']">
            <p><img :src="`${config.imagePrefix}/medium-${tool['image-2']}`"></p>
          </div>

          <!-- Write up -->
          <div v-if="tool.video && /youtube/.test(tool.video)">
            <div class="write-up" v-html="writeUpSplit[0]" />
            <youtube-component id="video" ref="video" :videoId="tool.video" />
            <div class="write-up" v-html="writeUpSplit[1]" />
          </div>
          <div v-else class="write-up" v-html="writeUp" />
          <div class="clear" />


          <div v-if="tool['key-modules']" class="key-tools">
            <content-expander v-for="(v, k) of tool['key-modules']" :key="k" :open="true" :name="k" :class="keyType[k]">
              <template v-slot:title>
                <img svg-inline v-if="k == 'key-tactics'" class="bt-icon" src="./assets/tactic.svg">
                <img svg-inline v-else-if="k == 'key-theories'" class="bt-icon" src="./assets/theory.svg">
                <img svg-inline v-else-if="k == 'key-principles'" class="bt-icon" src="./assets/principle.svg">
                <img svg-inline v-else-if="k == 'key-methodologies'" class="bt-icon" src="./assets/methodology.svg">
                {{ text[`type.${keyType[k]}.key${v.length > 1 ? 's' : ''}`] }}
              </template>
              <div v-for="(each, i) in v" :key="i">
                <div v-if="each[2]" v-html="markdown(`[**${each[0]}**](/tool/${each[2]}) – ${each[1]}`)"/>
                <div v-else v-html="markdown(`**${each[0]}** – ${each[1]}`)"/>
              </div>
            </content-expander>
          </div>
          <content-expander :key="`how-${tool.slug}`" :open="true" class="methodology" :name="'how-to-use'" v-if="tool['how-to-use']">
          <template v-slot:title>{{ text['meta.howtouse'] }}</template>
            <div v-html="markdown(tool['how-to-use'])" />
          </content-expander>
          <content-expander :key="`rwe-${tool.slug}`" :open="true" :name="'real-world-examples'"
            v-if="tool['real-world-examples'] && tool['real-world-examples'].length">
            <template v-slot:title>{{ text['meta.rwe'] }}</template>
            <div v-for="(rwe, i) in tool['real-world-examples']" :key="i" class="rwe">
              <a :href="rwe.link" target="_blank">
                <div class="h5">{{ rwe.title }}</div>
                <div v-html="markdown(rwe.description)" />
                <img v-if="rwe.image" :src="`${config.imagePrefix}/${rwe.image}`">
              </a>
            </div>
          </content-expander>
          <content-expander :key="`learn-${tool.slug}`" :open="true" :name="'learn-more'"
            v-if="tool['learn-more'] && tool['learn-more'].length">
            <template v-slot:title>{{ text['meta.learnmore'] }}</template>
            <div v-for="(lm, i) in tool['learn-more']" :key="i">
              <a :href="lm.link" target="_blank" class="lm">
                <div class="h5">{{ lm.title }}</div><span v-if="lm.source">&nbsp; | &nbsp;{{ lm.source }}</span><span v-if="lm.year">, {{ lm.year }}</span>
              </a>
            </div>
          </content-expander>
          <!-- TODO: Add this "have you seen" section
          <content-expander :open="false" :name="'contribute'">
            <template v-slot:title>{{ text['site.contribute'] }}</template>
          </content-expander>
          -->
        </div>
      </article>

      <!-- Sidebar -->
      <aside>
        <section v-if="tool['potential-risks']" class="risks">
          <div class="h4">{{ text['meta.risks'] }}</div>
          <div v-html="markdown(tool['potential-risks'])" />
          <hr>
        </section>
        <section v-if="tool['why-it-worked']" class="worked">
          <div class="h4">{{ text['meta.whyworked'] }}</div>
          <div v-html="markdown(tool['why-it-worked'])" />
          <hr>
        </section>
        <section v-if="tool['why-it-failed']" class="failed">
          <div class="h4">{{ text['meta.whyfailed'] }}</div>
          <div v-html="markdown(tool['why-it-failed'])" />
          <hr>
        </section>
        <section v-if="Object.keys(randomRelated).length" class="related">
          <div class="h4">{{ text['meta.related'] }}</div>
          <div v-for="T in Object.keys(randomRelated)" :key="T" :class="T">
            <div class="type">
              <router-link :to="{name: 'toolbox', params: {collection: T}}">
                <img svg-inline v-if="T == 'tactic'" class="bt-icon" src="./assets/tactic.svg">
                <img svg-inline v-else-if="T == 'theory'" class="bt-icon" src="./assets/theory.svg">
                <img svg-inline v-else-if="T == 'story'" class="bt-icon" src="./assets/story.svg">
                <img svg-inline v-else-if="T == 'principle'" class="bt-icon" src="./assets/principle.svg">
                <img svg-inline v-else-if="T == 'methodology'" class="bt-icon" src="./assets/methodology.svg">
                <div class="h2">{{ text[`type.${T}.plural`] }}</div>
              </router-link>
              <span :class="{T: true, open: expandRelated[T]}" v-if="randomRelated[T].length > 5"
                @click="expandRelated[T] = !expandRelated[T]" />
            </div>
            <div class="titles">
              <div class="related-link" v-for="[s, show] in randomRelated[T]" :key="s">
                <transition name="fade">
                  <div v-if="expandRelated[T] || show">
                    <router-link :to="{name: 'tool', params: {slug: s}}"
                      :class="{'key-related': keySlugs.has(s)}">
                      {{ $store.state.toolsBySlug[s].title }}
                      <popup-snapshot :tools="[s]" light class="tool-popup" />
                    </router-link>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </section>
        <section v-if="authors && authors.length" class="authors">
          <hr>
          <div class="h4">{{ text[`meta.contributor${authors.length > 1 ? '.plural' : ''}`] }}</div>
          <div v-for="a in authors" :key="a.slug">
            <div class="upper">
              <!-- TODO set search for name -->
              <router-link :to="{name: 'toolbox'}">
                <img :src="`${config.imagePrefix}/tile-${a.image}`">
                <div>
                  <div class="h3">{{ a.title }}</div>
                  <div>{{ a['team-title'] }}</div>
                </div>
              </router-link>
            </div>
            <div class="lower" v-html="markdown(a.bio)" />
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<script>
import ContentExpander from './ContentExpander'
import PopupSnapshot from './PopupSnapshot'
import YoutubeComponent from './YoutubeComponent'


const crlf = '%0d%0a'


export default {
  name: 'BTTool',
  data: () => ({
    authors: null,
    types: {story: 'stories', tactic: 'tactics', theory: 'theories', principle: 'principles', methodology: 'methodologies'},
    keyType: {'key-tactics': 'tactic', 'key-theories': 'theory', 'key-principles': 'principle', 'key-methodologies': 'methodology'},
    expandRelated: {},
    moduleType: 'full',
  }),
  components: {
    ContentExpander,
    PopupSnapshot,
    YoutubeComponent,
  },
  computed: {
    tool() {
      return this.$store.state.toolsBySlug[this.$route.params.slug]
    },
    moreThanASnapshotInEnglish() {
      return (this.tool['module-type-effective'] == 'snapshot' && (this.tool['full-write-up'] || this.tool['short-write-up']))
    },
    keySlugs() {
      let slugs = new Set()
      Object.values(this.tool['key-modules'] || []).forEach(a => a.forEach(i => slugs.add(i[2])))
      return slugs
    },
    writeUp() {
      return this.writeUpAsParagraphArray.join(' ')
    },
    writeUpAsParagraphArray() {
      // Weed out snapshot-only pieces by returning an empty array. This makes writeUp empty.
      let text = this.tool['module-type-effective'] == 'gallery' ? this.tool['short-write-up'] : this.tool['full-write-up']
      if (!text) return []

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
      let toolsBySlug = this.$store.state.toolsBySlug

      return Object.fromEntries(
        Object.keys(this.types)
          .filter(T => (this.tool[this.types[T]] || []).length)
          .map(T => {
            let slugs = this.tool[this.types[T]]
            let chosenIndices = new Set([...Array(slugs.length).keys()].sort(() => 0.5 - Math.random()).slice(0, 5))
            return [T, slugs
                        .map((s, i) => [s, chosenIndices.has(i)])
                        .sort((a, b) => {
                          let A = toolsBySlug[a[0]] || {}, B = toolsBySlug[b[0]] || {}
                          if (A.title > B.title) return 1
                          if (A.title < B.title) return -1
                          return 0
                        })]
          })
      )
    },
    shareUrl() {
      return `https://beautifultrouble.org/toolbox/${this.$store.state.lang}/tool/${this.tool.slug}`
    },
    shareUrlEmail() {
      return `mailto:?subject=${this.text['type.' + this.tool.type]}: ${this.tool.title}&body=${this.tool.snapshot}${crlf}${crlf}${this.shareUrl}`
    },
    shareUrlFacebook() {
      return `https://facebook.com/sharer/sharer.php?u=${this.shareUrl}`
    },
    shareUrlTwitter() {
      return `https://twitter.com/intent/tweet?text=${this.tool.title}&url=${this.shareUrl}`
    },
  },
  methods: {
    handleLink($event) {
      let { target } = $event
      // Ascend elements to reach the link
      while (target && target.tagName != 'A') target = target.parentNode
      // Only match local links
      if (target && target.href && target.rel != 'external' &&
          (target.matches(`.tool a[href*="${this.config.siteDomain}/tool/"]`)
           || target.matches(`.tool a[href*="${this.config.siteDomain}/toolbox/"]`)
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
      if (this.tool && this.tool.authors) {
        this.tool.authors.map(
          author => {
            window.fetchJSON(`${this.config.api}/person/${author}?lang=${this.$store.state.lang}`)
              .then(json => this.authors.push(json))
          }
        )
      }
      if (this.$store.state.tools.length && !this.tool) {
        this.$router.push({path: '/'})
        console.warn('missing tool')
      }
    },
  },
  watch: {
    $route(newRoute) {
      if (newRoute.name == 'tool') this.initPage()
    },
  },
  created() {
    this.initPage()
  },
};
</script>

<style lang="scss">
@import 'common.scss';

$image-height: 75vh;
$image-height-max: 60rem;
$sidebar: 18rem;

.tool {
  font-size: 1.1rem;
  header {
    background-size: cover;
    background-position: 50% 10%;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    height: $image-height;
    max-height: $image-height-max;
    margin-top: 5rem;
    @include breakpoint($sm) {
      margin-top: 6rem;
      height: calc(100vh - 9rem);
    }
    a {
      text-decoration: none;
    }
    .h1, .h2 {
      text-align: center;
      text-shadow: 1px 0px 6px rgba(black, .5);
      user-select: none;
    }
    .h1 {
      color: white;
      margin: 0 3rem;
      @include breakpoint($sm) {
        margin: 0 1rem;
      }
    }
    .h2 {
      margin: 0;
    }
    .bt-icon {
      margin-bottom: .5rem;
      filter: drop-shadow(0px 0px 20px rgba(black, .2));
    }
    .upper, .lower {
      z-index: 1;
    }
    .upper {
      height: 80%;
      margin-top: 10vh;
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
      border-width: 0 0 0 .5rem;
      transition: all .1s ease-in-out;
      font-size: 1rem;
      @include breakpoint($sm) {
        //font-size: .8rem;
      }
      .rtl & {
        border-width: 0 .5rem 0 0;
      }
      p {
        margin: 0;
      }
      @include breakpoint($upper) {
        &:hover {
          border-width: 0 0 0 .9rem;
        }
      }
    }
    .video {
      margin: 1rem 2.5rem;
      fill: white;
      max-width: 2.5rem;
      max-height: 3.5rem;
    }
    &::before {
      content: "";
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.3) 80%, rgba(0,0,0,.7) 100%);
      position: absolute;
      top: 0; left: 0;
      bottom: 0; right: 0;
      z-index: 0;
    }
  }
  // Notice the linkage between main + nav, and article + .breadcrumbs (for horizontal placement)
  main, nav {
    display: flex;
    flex-direction: row;
    background: $bggray;
    a {
      text-decoration: none;
    }
    @include breakpoint($sm) {
      flex-wrap: wrap;
    }
  }
  nav {
    .breadcrumbs .inner {
      @extend .h2;
    }
    .bullet {
      margin: 0 .5rem;
    }
    @include breakpoint($sm) {
      aside {
        padding-top: 0;
      }
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      align-items: center;
      height: 100%;
      .bt-icon {
        max-width: 2.5rem;
        max-height: 3rem;
        cursor: pointer;
        margin: 0 .5rem 0 0;
        @include breakpoint($md) {
          max-width: 1.75rem;
        }
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
  }
  main {
    padding-bottom: 1rem;
    .h4 {
      color: $text;
      margin: .5rem 0;
    }
    .content-expander {
      .h4 {
        text-transform: uppercase;
      }
    }
  }
  article, .breadcrumbs {
    flex: 1 0 66%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 2rem 3rem;

    @include breakpoint($sm) {
      flex: 0 0 100%;
      padding: 1.5rem;
    }
    @include breakpoint($md) {
      flex: 0 0 70%;
      padding: 1.5rem;
    }
    .inner {
      flex: 0 0 66%;
      img {
        max-width: 100%;
      }
      @include breakpoint($lg) {
        flex: 0 0 90%;
      }
      @include breakpoint($xl) {
        flex: 0 0 70%;
      }
      @include breakpoint($xxl) {
        flex: 0 0 65%;
      }
      @include breakpoint($lower) {
        flex: 0 0 100%;
      }
    }
  }
  article {
    background: white;
    box-shadow: .3rem 0 .5rem .25rem $shadow;
    h6 { // image captions
      margin-top: -.5rem;
    }
    blockquote p {
      margin: 0;
    }
    blockquote.pull-quote {
      @include breakpoint($lower) {
        margin: 2rem 1rem 2rem 0;
      }
      @include breakpoint($sm) {
        width: unset;
        max-width: unset;
        float: none;
      }
      display: block;
      position: relative;
      float: left;
      color: $text;
      font-size: 1.25rem;
      user-select: none;
      margin: 3rem 1rem 3rem -10%;
      padding: 0 1rem;
      border-width: .5rem;
      border-left-style: solid;
      width: 25rem;
      max-width: 50%;
      transition: all .1s ease-in-out;
      .rtl & {
        margin: 3rem -5rem 3rem 1rem;
        float: right;
        border-left-style: none;
        border-right-style: solid;
      }
      p {
        margin: 0;
      }
      @include breakpoint($upper) {
        &:hover {
          border-width: .9rem;
        }
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
    .snapshot-only {
      p {
        @extend .h2;
        line-height: .9;
        color: $text;
        margin: 2rem 0;
        padding: 1rem 2rem 1rem 2rem;
        @include breakpoint($lg) {
          width: unset;
        }
        @include breakpoint($lower) {
          width: 100%;
        }
        @include breakpoint($sm) {
          font-size: 1.6rem; // h2
          margin: 0;
        }
      }
    }
    .snapshot {
      margin-bottom: 2.5rem;
    }
    .epigraphs {
      margin: 0 1rem 1.5rem 1rem;
      .quote {
        p {
          font-style: italic;
          margin-bottom: 0;
        }
      }
      .attribution {
        color: $bgdark3;
        p {
          //margin: 0;
          margin-top: 0;
        }
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
        margin: 1rem 0 1.5rem 0;
        //border: 1px solid $bgdark3;
        border-radius: 1rem;
        background-color: $bgdark1;
        padding: .5rem;
      }
      p {
        margin: 0;
      }
      //font-size: .9rem;
    }
    .real-world-examples {
      .h5 {
        display: block;
        margin-bottom: .25rem;
      }
    }
    .rwe {
      //margin: 1rem 0;
    }
    .lm {
      display: block;
      margin-bottom: 1rem;
    }
    .key-tools {
      .bt-icon {
        display: inline;
        max-height: 2rem;
        max-width: 2rem;
        margin: -.4rem .5rem -.5rem 0;
        .rtl & {
          margin: -.4rem 0 -.5rem .5rem;
        }
      }
    }
  }
  aside {
    flex: 2 0 33%;
    padding: 0 2rem;
    @include breakpoint($md) {
      flex: 0 0 30%;
      padding: 0 1rem 0 1.5rem;
    }
    @include breakpoint($sm) {
      padding: 1.5rem;
    }
    blockquote {
      margin-inline-start: 1rem;
      margin-inline-end: 1rem;
    }
    .h2 {
      margin: 0;
    }
    .h4 {
      text-transform: uppercase;
    }
    .risks, .worked, .failed {
      max-width: $sidebar;
      @include breakpoint($sm) {
        max-width: unset;
      }
    }
    .related {
      .type {
        display: flex;
        position: relative;
        flex-direction: row;
        a:first-of-type {
          margin-bottom: .3rem;
        }
        svg, .h2 {
          display: inline-block;
        }
        .h2 {
          vertical-align: top;
        }
        span {
          padding: .25rem .25rem;
          width: 3rem;
          cursor: pointer;
          &.open::after {
            transform: rotate(180deg);
            top: .6rem;
          }
          &::after {
            transform: rotate(90deg);
            transition: all .1s ease-out;
            position: absolute;
            top: .5rem;
            content: "";
            border-bottom-width: 1rem;
            border-bottom-style: solid;
            border-left: .75rem solid transparent;
            border-right: .75rem solid transparent;
          }
        }
      }
      .titles {
        margin-bottom: 1rem;
      }
      .bt-icon {
        max-height: 2rem;
        max-width: 2rem;
        margin: 0 .5rem 0 0;
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
                // Module name highlighting disabled until a better design emerges
                // content: "";
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
        content: "•";
        position: absolute;
        left: -10px;
        .rtl & {
          left: unset;
          right: -10px;
        }
      }
      @mixin type-related($color) {
        a, .h2, .h3 { color: $color; }
        span::after { border-bottom-color: $color; }
        .tool-popup {
          //border: 1px solid $color;
          border-radius: .5rem;
          background: tint($color, 90%);
          box-shadow: 0 0 .5rem .25rem $shadow;
        }
      }
      .tactic { @include type-related($tactic); }
      .theory { @include type-related($theory); }
      .story { @include type-related($story); }
      .principle { @include type-related($principle); }
      .methodology { @include type-related($methodology); }
      .tool-popup {
        display: flex;
        position: absolute;
        top: -1rem;
        right: 100%;
        margin: 0 1rem 0 0;
        display: none;
        .content {
          //padding: 1rem;
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
      @include breakpoint($sm) {
        max-width: unset;
      }
      img {
        border-radius: 50%;
        margin: 0 1rem .5rem 0;
        width: 75%;
        .rtl & {
          margin: 0 0 .5rem 1rem;
        }
      }
      .upper {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        .h3 {
          font-weight: normal;
          color: $text;
          margin: 0 0 .2rem 0;
        }
        div {
          color: $text;
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
.list-enter-from, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

</style>
