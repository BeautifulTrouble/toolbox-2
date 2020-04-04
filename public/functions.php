<?php
// Pass a nonce to the front-end which can be used to fetch draft previews
function bt_preview_post_link($link) {
  return $link . '&_wpnonce=' . wp_create_nonce('wp_rest');
}
add_filter('preview_post_link', 'bt_preview_post_link');
