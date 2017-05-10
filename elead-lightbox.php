<?php
/**
 * Use the PHP for https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate
 *
 * @package   elead-lightbox
 * @author    John Farrell MacDonald <john@jfmacdonald.com>
 * @license   GPL-2.0+
 * @link      http://jfmacdonald.com
 * @copyright 2017 John Farrell MacDonald
 *
 * @wordpress-plugin
 * Plugin Name:       ELead Lightbox
 * Plugin URI:        https://jfmacdonald.com
 * Description:       CTA and form for submitting a quote request to a Force.com CRM.
 * Version:           1.2.5
 * Author:            John Farrell MacDonald
 * Author URI:        https://jfmacdonald.com
 * Text Domain:       elead-lightbox-locale
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 * GitHub Plugin URI: https://github.com/<owner>/<repo>
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';
if ( ! class_exists( 'ELeadLightbox' ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'includes/ELeadLightbox.php';
}
register_activation_hook( __FILE__, 'ELeadLightbox::activate');
ELeadLightbox::bootstrap();

