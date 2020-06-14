<?php
// Pass a nonce to the front-end which can be used to fetch draft previews
function bt_preview_post_link($link) {
  return $link . '&_wpnonce=' . wp_create_nonce('wp_rest');
}
add_filter('preview_post_link', 'bt_preview_post_link');


// Expose menu items via REST
// TODO: Does this work?
// register_post_type('nav_menu_item', array('show_in_rest' => true));
function bt_get_menus() {
    return [
        wp_get_nav_menu_items('main-menu'), 
        wp_get_nav_menu_items('secondary-menu')
    ]; 
}
add_action('rest_api_init', function() {
    register_rest_route('wp/v2', 'menu', [
        'methods' => 'GET',
        'callback' => 'bt_get_menus',
    ]);
});
