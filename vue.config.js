module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
        .loader('vue-svg-inline-loader')
        .options({
          addTitle: true,
        })
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  },
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    output: {
      // Add querystring so webpackChunkName will get reloaded
      chunkFilename: '[name].js?id=[chunkhash]',
      // Force output filename
      filename: 'toolbox.js',
    }
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
