<template>
  <div v-if="tool" :class="['tool', tool.type]">
    <!-- Use VueLazyImageLoading for fade-in effect on load -->
    <lazy-background position="50% 0%" no-ratio :blur="0"
      :src="`${config.imagePrefix}/hero-${tool.image}`"
      placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
      >
      <header slot="content">
        <div class="upper">
          <img svg-inline svg-sprite v-if="tool.type == 'tactic'" class="icon" src="./assets/tactic.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'theory'" class="icon" src="./assets/theory.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'story'" class="icon" src="./assets/story.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'principle'" class="icon" src="./assets/principle.svg">
          <img svg-inline svg-sprite v-if="tool.type == 'methodology'" class="icon" src="./assets/methodology.svg">
          <h3>{{ typeTextBySlug[tool.type][0] }}</h3>
          <h1>{{ tool.title }}</h1>
        </div>
        <div class="lower">
          <div><!-- Two divs ensure that flexbox' space-between places them appropriately -->
            <div v-if="tool['image-caption']" :class="['caption', tool.type]" v-html="markdown(tool['image-caption'])" />
          </div>
          <div>
            <img svg-inline svg-sprite v-if="tool.video" class="icon video" src="./assets/video.svg">
          </div>
        </div>
      </header>
    </lazy-background>

    <main>
      <!-- Tool -->
      <article>
        <div class="inner">
          <div :class="['breadcrumbs', tool.type]">
            <router-link to="/toolbox">TOOLBOX</router-link> /
            <router-link :to="{name: 'toolbox', params: {collection: tool.type}}">{{ typeTextBySlug[tool.type][0] }}</router-link> /
            <router-link :to="{name: 'tool', params: {slug: tool.slug}}">{{ tool.title }}</router-link></div>
          <div class="write-up" @click="handleLink" v-html="markdown(writeUp)" />
        </div>
      </article>

      <!-- Sidebar -->
      <aside>
        <div class="actions">
        </div>
        <div class="risks">
        </div>
        <div class="related">
          <div v-for="T in Object.keys(types)" :key="T"
            v-if="tool[types[T]] && tool[types[T]].length" :class="T">
            <div class="type">
              <img svg-inline svg-sprite v-if="T == 'tactic'" class="icon" src="./assets/tactic.svg">
              <img svg-inline svg-sprite v-if="T == 'theory'" class="icon" src="./assets/theory.svg">
              <img svg-inline svg-sprite v-if="T == 'story'" class="icon" src="./assets/story.svg">
              <img svg-inline svg-sprite v-if="T == 'principle'" class="icon" src="./assets/principle.svg">
              <img svg-inline svg-sprite v-if="T == 'methodology'" class="icon" src="./assets/methodology.svg">
              <h5>{{ typeTextBySlug[T][1] }}</h5>
            </div>
            <div class="titles">
              <div v-for="m in randomRelated[T]">
                <router-link :to="{name: 'tool', params: {slug: m}}">{{ $store.state.toolsBySlug[m].title }}</router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="author">
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import typeTextByLang from './types'
import config from '../bt.config'

export default {
  name: 'Tool',
  data: () => ({
    config,
    types: {story: 'stories', tactic: 'tactics', theory: 'theories', principle: 'principles', methodology: 'methodologies'},
  }),
  computed: {
    tool() {
      return this.$store.state.toolsBySlug[this.$route.params.slug]
    },
    typeTextBySlug() {
      return typeTextByLang[this.$store.state.lang]
    },
    writeUp() {
      return this.tool['full-write-up'] || this.tool['short-write-up'] || this.tool['snapshot']
    },
    randomRelated() {
      let related = {nonce: this.$route.params.slug}
      for (let T in this.types) {
        if (this.tool[this.types[T]]) {
          related[T] = this.tool[this.types[T]].sort(() => 0.5 - Math.random()).slice(0, 5)
        }
      }
      return related
    }
  },
  methods: {
    otherTool(slug) {
      return this.$store.state.toolsBySlug[slug] || {}
    },
    /*
    randomRelated(arr, n = 5) {
      return arr.sort(() => 0.5 - Math.random()).slice(0, n)
    },
    */
    handleLink($event) {
      let { target } = $event
      // Ascend elements to the link
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

.tool {
  .lazy-background-image {
    background: black;
    transition: all .1s ease-in-out;
    &:after {
      content: "";
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
    height: 45rem;
    .icon {
      margin-bottom: .5rem;
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
    .icon {
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
      max-width: 400px;
      padding: 0 1rem;
      margin: 2rem 3rem;
      p {
        margin: 0;
      }
    }
    .caption.tactic { border-left: .5rem solid $tactic; }
    .caption.theory { border-left: .5rem solid $theory; }
    .caption.story { border-left: .5rem solid $story; }
    .caption.principle { border-left: .5rem solid $principle; }
    .caption.methodology { border-left: .5rem solid $methodology; }
  }
  main {
    display: flex;
    flex-direction: row;
    background: $bggray;
    padding-top: 1rem;
  }
  article {
    flex: 1 0 66%;
    background: white;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    box-shadow: 5px 0 8px #d3d3d3;
    padding: 2rem;
    .inner {
      flex: 0 0 66%;
    }
    .breadcrumbs {
      font-weight: bold;
      a {
        text-decoration: none;
      }
    }
    .breadcrumbs.tactic { color: $tactic; }
    .breadcrumbs.theory { color: $theory; }
    .breadcrumbs.story { color: $story; }
    .breadcrumbs.principle { color: $principle; }
    .breadcrumbs.methodology { color: $methodology; }
  }
  aside {
    height: 100%;
    flex: 1 0 33%;
    .related {
      padding: 0 2rem;
      h5 {
        margin: 0;
        font-size: 1.5rem;
      }
      .type {
        display: flex;
        flex-direction: row;
        margin: .5rem 0;
      }
      .titles {
        margin-bottom: 1.5rem;
      }
      .icon {
        max-height: 1.5rem;
        margin: .25rem .5rem 0 0;
        .rtl & {
          margin: .25rem 0 0 .5rem;
        }
      }
      .tactic { a, h5 { color: $tactic; } }
      .theory { a, h5 { color: $theory; } }
      .story { a, h5 { color: $story; } }
      .principle { a, h5 { color: $principle; } }
      .methodology { a, h5 { color: $methodology; } }
    }
  }
}
</style>
