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
  // Output looks to wordpress like the index.php of a theme.
  indexPath: process.env.NODE_ENV == 'production' ? 'index.php' : 'index.html',
  // Make file paths relative to deploy path; router should have a different configuration
  publicPath: process.env.NODE_ENV == 'production' ? 'wp-content/themes/bt' : '/',
  // Place the built site in theme location
  outputDir: 'wp-content/themes/bt'
}
