<template>
  <div id="app">
    <h1>Site Language set to: {{ $store.state.lang }}</h1>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/en/about">En About</router-link> |
      <router-link to="/es/about">Sp About</router-link> |
      <router-link to="/ar/about">Ar About</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/privacy-policy">pp</router-link> |
      <router-link to="/privacy-policy/another">pp another</router-link> |
      <router-link to="/top">top</router-link> |
      <router-link to="/top/">top/</router-link> |
      <router-link to="/top/another">top another</router-link> |
      <router-link to="/does/not/exist">404</router-link>
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
