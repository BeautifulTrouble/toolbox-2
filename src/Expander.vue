<template>
  <div :class="['box', 'expander', name]">
    <h4 :class="{open: isOpen}" @click="isOpen = !isOpen">
      <slot name="title" />
    </h4>
    <transition name="slide-fade">
      <div v-if="isOpen">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  name: 'Expander',
  data: () => ({
    isOpen: false,
  }),
  props: {
    open: {type: Boolean, default: false},
    name: {type: String, default: ''},
  },
  created() {
    this.isOpen = this.open
  },
};
</script>

<style lang="scss">
@import 'common.scss';
.box.expander {
  padding: 3.5rem 2rem 1rem 2rem; // padding-top assumes a padded h4 title
  h4 {
    cursor: pointer;
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    user-select: none;
    padding: 1.5rem 4rem 1.5rem 2rem; // also .rtl &
    margin: 0;
    .rtl & {
      padding: 1.5rem 2rem 1.5rem 4rem;
    }
    &::after {
      content: "";
      top: 1.7rem;
      right: 2rem;
      border-bottom: 1rem solid $text;
      border-left: .75rem solid transparent;
      border-right: .75rem solid transparent;
      position: absolute;
      transition: all .2s ease-out;
      transform: scaleY(-1);
    }
    .rtl &::after {
      right: unset; left: 2rem;
    }
  }
  h4.open::after {
    top: 1.5rem;
    transform: scaleY(1);
  }
}
</style>
