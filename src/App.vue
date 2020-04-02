<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/en/about">English About</router-link> |
      <router-link to="/es/about">Spanish About</router-link> |
      <router-link to="/ar/about">Arabic About</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/blog">Some WordPress page</router-link>
    </div>
    <router-view/>
    <div v-if="$store.state.langRequested">
      Loading...</div>
  </div>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
