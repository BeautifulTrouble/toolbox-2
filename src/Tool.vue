<template>
  <div v-if="tool" :class="['tool', tool.type]" @click="handleLink">
    <!-- Use VueLazyImageLoading for fade-in effect on load -->
    <lazy-background position="50% 0%" no-ratio :blur="0"
      :src="`${config.imagePrefix}/hero-${tool.image}`"
      placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=">
    </lazy-background>

    <header slot="content">
      <div class="upper">
        <router-link :to="{name: 'toolbox', params: {collection: tool.type}}">
          <img svg-inline v-if="tool.type == 'tactic'" class="icon" src="./assets/tactic.svg">
          <img svg-inline v-if="tool.type == 'theory'" class="icon" src="./assets/theory.svg">
          <img svg-inline v-if="tool.type == 'story'" class="icon" src="./assets/story.svg">
          <img svg-inline v-if="tool.type == 'principle'" class="icon" src="./assets/principle.svg">
          <img svg-inline v-if="tool.type == 'methodology'" class="icon" src="./assets/methodology.svg">
          <h3>{{ typeTextBySlug[tool.type][0] }}</h3>
        </router-link>
        <h1>{{ tool.title }}</h1>
        <img svg-inline v-if="showDocumentLinks" @click="openDocument" class="edit" alt="Edit this Google Doc" src="./assets/edit.svg">
      </div>
      <div class="lower">
        <div><!-- Always render two divs to ensure proper placement -->
          <div v-if="tool['image-caption']" :class="['caption', tool.type]" v-html="markdown(tool['image-caption'])" />
        </div>
        <div>
          <img svg-inline v-if="tool.video" class="icon video" src="./assets/video.svg">
        </div>
      </div>
    </header>

    <main>
      <!-- Tool -->
      <article>
        <div class="inner">
          <div :class="['breadcrumbs', tool.type]">
            <router-link to="/toolbox">TOOLBOX</router-link> /
            <router-link :to="{name: 'toolbox', params: {collection: tool.type}}">{{ typeTextBySlug[tool.type][0] }}</router-link> /
            <router-link :to="{name: 'tool', params: {slug: tool.slug}}">{{ tool.title }}</router-link>
          </div>
          <div class="origins" v-if="tool.origins">
            <strong>ORIGINS</strong>: <em v-html="markdown(tool.origins)" />
          </div>
          <div class="image" v-if="tool['image-2']">
            <p><img :src="`${config.imagePrefix}/medium-${tool['image-2']}`"></p>
          </div>

          <div class="write-up" v-html="markdown(writeUp)" />
          <div class="clear" />

          <expander :key="`how-${tool.slug}`" :open="true" :name="'how-to-use'" v-if="tool['how-to-use']">
            <template v-slot:title>HOW TO USE</template>
            <div v-html="markdown(tool['how-to-use'])" />
          </expander>
          <expander :key="`rwe-${tool.slug}`" :open="true" :name="'real-world-examples'"
            v-if="tool['real-world-examples'] && tool['real-world-examples'].length">
            <template v-slot:title>REAL WORLD EXAMPLES</template>
              <div v-for="(rwe, i) in tool['real-world-examples']" :key="i">
                <a :href="rwe.link" target="_blank">
                  <h5>{{ rwe.title }}</h5>
                  <div v-html="markdown(rwe.description)" />
                  <img v-if="rwe.image" :src="`${config.imagePrefix}/${rwe.image}`">
                </a>
              </div>
            </span>
          </expander>
          <expander :key="`learn-${tool.slug}`" :open="true" :name="'learn-more'"
            v-if="tool['learn-more'] && tool['learn-more'].length">
            <template v-slot:title>LEARN MORE</template>
            <div v-for="(lm, i) in tool['learn-more']" :key="i">
              <a :href="lm.link" target="_blank">
                <h5>{{ lm.title }}</h5><span v-if="lm.source"> | {{ lm.source }}</span><span v-if="lm.year">, {{ lm.year }}</span>
              </a>
            </div>
          </expander>
          <expander :open="true" :name="'contribute'">
            <template v-slot:title>HAVE YOU SEEN OR USED THIS {{ typeTextBySlug[tool.type][0] }}?</template>
          </expander>
        </div>
      </article>

      <!-- Sidebar -->
      <aside>
        <div class="actions">
          <img svg-inline class="icon" src="./assets/favorite.svg">
        </div>
        <div v-if="tool['potential-risks']" class="risks">
          <h4>POTENTIAL RISKS</h4>
          <div v-html="markdown(tool['potential-risks'])" />
          <hr>
        </div>
        <div class="related">
          <h4>RELATED TOOLS</h4>
          <div v-for="T in Object.keys(randomRelated)" :key="T" :class="T">
            <div class="type">
              <router-link :to="{name: 'toolbox', params: {collection: T}}">
                <img svg-inline v-if="T == 'tactic'" class="icon" src="./assets/tactic.svg">
                <img svg-inline v-if="T == 'theory'" class="icon" src="./assets/theory.svg">
                <img svg-inline v-if="T == 'story'" class="icon" src="./assets/story.svg">
                <img svg-inline v-if="T == 'principle'" class="icon" src="./assets/principle.svg">
                <img svg-inline v-if="T == 'methodology'" class="icon" src="./assets/methodology.svg">
                <h2>{{ typeTextBySlug[T][1] }}</h2>
              </router-link>
            </div>
            <div class="titles">
              <div v-for="m in randomRelated[T]" :key="m">
                <router-link :to="{name: 'tool', params: {slug: m}}">{{ $store.state.toolsBySlug[m].title }}</router-link>
              </div>
            </div>
          </div>
          <hr>
        </div>
        <div class="author">
          <hr>
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import Expander from './Expander'
import typeTextByLang from './types'
import config from '../bt.config'

export default {
  name: 'Tool',
  data: () => ({
    config,
    showDocumentLinks: window.btOptions.showDocumentLinks,
    types: {story: 'stories', tactic: 'tactics', theory: 'theories', principle: 'principles', methodology: 'methodologies'},
    expand: {
      risks: false,
      use: true,
      rwe: true,
      learn: true,
      contribute: false,
    },
  }),
  components: {
    Expander,
  },
  computed: {
    tool() {
      return this.$store.state.toolsBySlug[this.$route.params.slug]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    },
    writeUp() {
      // TODO: module-type-effective logic (see RED text document prepared for Troels)
      let text = this.tool['full-write-up'] || this.tool['short-write-up'] || this.tool['snapshot']
      text = this.markdown(text)
      if (this.tool['pull-quote']) {
        // Remove outermost <p>...</p> tags, split to array on inner </p><p> junctions, and re-wrap
        let paragraphs = text.replace(/(^<p>|<\/p>$)/g, '').split(/<\/p>\s*<p>/).map(p => `<p>${p}</p>`)
        if (paragraphs.length > 1) {
          let quote = `<blockquote class="pull-quote">${this.markdown(this.tool['pull-quote'])}</blockquote>`
          paragraphs.splice(paragraphs.length < 4 ? 1 : 2, 0, quote)
          text = paragraphs.join(' ')
        }
      }
      return text
    },
    randomRelated() {
      return Object.fromEntries(
        Object.keys(this.types)
          .filter(T => (this.tool[this.types[T]] || []).length)
          .map(T => [T, [...this.tool[this.types[T]]].sort(() => 0.5 - Math.random()).slice(0, 5)])
      )
    }
  },
  methods: {
    openDocument() {
      window.open(this.tool.document_link, '_blank')
    },
    otherTool(slug) {
      return this.$store.state.toolsBySlug[slug] || {}
    },
    handleLink($event) {
      let { target } = $event
      // Ascend elements to reach the link
      while (target && target.tagName != 'A') target = target.parentNode
      // Only match local links
      if (target && target.href &&
          (target.matches(`.tool a[href*="://${config.siteDomain}"]`)
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
    }
  },
  // beforeRouteEnter
  // beforeRouteUpdate
  created() {
    console.log('created tool')
  }
};
</script>

<style lang="scss">
@import 'common.scss';

$image-height: 45rem;

.tool {
  .lazy-background {
    position: fixed;
  }
  .lazy-background-image {
    background: black;
    transition: all .2s ease-in-out;
    &::before {
      content: "";
      transition: opacity .5s ease-in-out;
      background: linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(0,0,0,1) 100%);
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
    a {
      text-decoration: none;
    }
    h1, h3 {
      margin: 0;
      text-align: center;
      text-transform: uppercase;
      text-shadow: 1px 0px 6px rgba(black, .5);
    }
    h1 {
      color: white;
    }
    h3 {
      margin-bottom: .5rem;
    }
    .edit {
      cursor: pointer;
      position: absolute;
      height: 2rem;
      width: 2rem;
      top: 1rem; right: 1rem;
      filter: drop-shadow(0px 0px 10px black);
      path {
        fill: white;
      }
    }
    .icon {
      margin-bottom: .5rem;
      filter: drop-shadow(0px 0px 20px rgba(black, .2));
    }
    .upper {
      height: 70%;
      margin-top: 10rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .lower {
      width: 100%;
      min-height: 20rem;
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
  }
  main {
    position: absolute;
    display: flex;
    flex-direction: row;
    background: $bggray;
    padding-top: 1rem;
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
      h5 {
        //text-decoration: underline;
      }
    }
    h4 {
      color: $text;
      margin: .5rem 0;
    }
  }
  article {
    flex: 1 0 66%;
    background: white;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    box-shadow: 5px 0 8px #d3d3d3;
    padding: 2rem;
    blockquote.pull-quote {
      display: block;
      position: relative;
      float: left;
      text-transform: uppercase;
      color: $text;
      font-size: 1.1rem;
      font-style: normal;
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
      &::before {
        content: none;
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
    .origins {
      p {
        display: inline;
      }
    }
    .learn-more, .real-world-examples {
      img {
        max-height: 20rem;
        margin: .5rem 0 .5rem 0;
      }
      p {
        margin: 0;
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
    .related {
      .type {
        display: flex;
        flex-direction: row;
        svg, h2 {
          display: inline-block;
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
      .tactic { a, h2 { color: $tactic; } }
      .theory { a, h2 { color: $theory; } }
      .story { a, h2 { color: $story; } }
      .principle { a, h2 { color: $principle; } }
      .methodology { a, h2 { color: $methodology; } }
    }
  }
}
</style>