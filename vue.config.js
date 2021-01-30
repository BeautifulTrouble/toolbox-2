module.exports = {
  chainWebpack: config => config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
        .loader('vue-svg-inline-loader')
        .options({
          addTitle: true,
        }),
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    /*
    output: {
      // Add querystring so webpackChunkName will get reloaded
      chunkFilename: '[name].js?id=[chunkhash]'
    }
    */
  },
  css: {
    extract: false,
    loaderOptions: {
      // Expose NODE_ENV to scss
      sass: {prependData: '$NODE_ENV: ' + process.env.NODE_ENV + ';'}
    }
  },
  indexPath: 'index.html',
  publicPath: '/',
  outputDir: 'bt'
}
