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
  indexPath: 'index.php',
  // Place the built site in theme location
  outputDir: 'wp-content/themes/bt',
  // Make file paths relative to deploy path; router should have a different configuration
  publicPath: 'wp-content/themes/bt'
}
