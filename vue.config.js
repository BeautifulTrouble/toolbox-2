module.exports = {
  configureWebpack: {
    //output: {filename: ''}
  },
  css: {
    loaderOptions: {
      sass: { // Expose NODE_ENV to scss
        data: '$NODE_ENV: ' + process.env.NODE_ENV + ';'
      }
    }
  }
}
