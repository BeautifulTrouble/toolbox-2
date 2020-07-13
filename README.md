# Beautiful Trouble 2020

## Install Wordpress and local build environment
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

## Conventions

As this site is designed to be a hybrid of WordPress and VueJS, a number of special considerations worth documenting. Briefly, the `yarn build` command produces a WordPress theme based on the VueJS app in `src` and additional files under `public`.

  * `./bt` - Live output directory containing the theme produced by `yarn build`.
  * `./plugins` - Live WordPress plugin directory, intended to be tracked by git, not managed by WP admins.
  * `./public` - Effectively the input directory for the `bt` theme and vuejs-related public assets. Vue is configured (in `vue.config.js`) to output an `index.php` file from the provided `index.html`.
  * `./public/index.html` - This "html" file uses ejs directives to determine whether it's being served by the webpack development server or php. The development portion provides some runtime variables to the js environment directly, while the production portion relies on php to produce this data (some stuff just doesn't warrant an AJAX wp-api call!)
  * `./wordpress` - Live submodule containing the official WordPress upstream repo. The `yarn wp-link` script (in `package.json`) removes the "`twenty\*`" themes and symlinks the `bt` output (build) directory, replaces `{wp-content/{plugins,uploads}}` with symlinks, and symlinks `wp-config.php`. This submodule can be updated to update WordPress.

