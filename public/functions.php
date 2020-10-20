<?php
// Theme support
function bt_setup() {
    register_nav_menus([
        'main-menu' => __('Main menu', 'bt'),
        'secondary-menu' => __('Secondary menu', 'bt'),
        'footer-menu' => __('Footer menu', 'bt'),
    ]);
}
add_action('after_setup_theme', 'bt_setup');


// Expose menu items via REST
function bt_get_menus() {
    // TODO: Does the following line work?
    // register_post_type('nav_menu_item', array('show_in_rest' => true));
    return [
        wp_get_nav_menu_items('main-menu'), 
        wp_get_nav_menu_items('secondary-menu'),
        wp_get_nav_menu_items('footer-menu'),
    ]; 
}
add_action('rest_api_init', function() {
    register_rest_route('wp/v2', 'menu', [
        'methods' => 'GET',
        'callback' => 'bt_get_menus',
    ]);
});


// Pass a nonce to the front-end which can be used to fetch draft previews
function bt_preview_post_link($link) {
  return $link . '&_wpnonce=' . wp_create_nonce('wp_rest');
}
add_filter('preview_post_link', 'bt_preview_post_link');


// Expose per-languge posts 

