module.exports = {
  configureWebpack: {
    //output: {filename: ''}
  },
  css: {
    loaderOptions: {
      // Expose NODE_ENV to scss
      sass: {prependData: '$NODE_ENV: ' + process.env.NODE_ENV + ';'}
    }
  },
  outputDir: 'wp-content/themes/bt'
}
