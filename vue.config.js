module.exports = {
  chainWebpack: config => config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
        .loader('vue-svg-inline-loader')
        .options({
          addTitle: true,
        }),
  configureWebpack: {
    output: {
      // Add querystring so webpackChunkName will get reloaded
      chunkFilename: '[name].js?id=[chunkhash]'
    }
  },
  css: {
    loaderOptions: {
      // Expose NODE_ENV to scss
      sass: {prependData: '$NODE_ENV: ' + process.env.NODE_ENV + ';'}
    }
  },
  // Output looks to wordpress like the index.php of a theme.
  indexPath: process.env.NODE_ENV == 'production' ? 'index.php' : 'index.html',
  // Make file paths relative to deploy path; router should have a different configuration
  publicPath: process.env.NODE_ENV == 'production' ? 'wp-content/themes/bt' : '/',
  // Place the built site in theme location
  outputDir: 'wp-content/themes/bt'
}
