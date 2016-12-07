<?php
/**
 * Use the PHP for https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate
 *
 * @package   elead-lightbox
 * @author    John Farrell MacDonald <john@jfmacdonald.com>
 * @license   GPL-2.0+
 * @link      http://example.com
 * @copyright 2014 Your Name or Company Name
 *
 * @wordpress-plugin
 * Plugin Name:       ELead Lightbox
 * Plugin URI:        @TODO
 * Description:       @TODO
 * Version:           1.0.0
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

function jfm_save_error() {
	file_put_contents( '/Users/johnmac/errors', ob_get_contents() );
}

add_action( 'activated_plugin', 'jfm_save_error' );


if ( ! class_exists( 'ELeadLightbox' ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'includes/ELeadLightbox.php';
	ELeadLightbox::bootstrap();
}

/**
 * The code that runs during plugin activation.
 */
if ( ! class_exists( 'ELeadLightbox_Activator' ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'includes/ELeadLightboxActivator.php';
	register_activation_hook( __FILE__, 'ELeadLightboxActivator::activate' );
}

/**
 * The code that runs during plugin deactivation.
 */
if ( ! class_exists( 'ELeadLightbox_Activator' ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'includes/ELeadLightboxDeactivator.php';
	register_deactivation_hook( __FILE__, 'ELeadLightboxDeactivator::deactivate' );
}

function elead_lightbox_register_public_hooks() {
	$stylesheet = plugins_url( 'public/css/elead-lightbox-public.css', __FILE__ );
	$scripts    = plugins_url( 'public/js/elead-lightbox-public.js', __FILE__ );
	$style_handle = 'elead-lightbox-styles';
	$script_handle = 'elead-lightbox-scripts';
	wp_register_style( $style_handle, $stylesheet );
	wp_enqueue_style( $style_handle );
	wp_register_script( $script_handle, $scripts, array( 'jquery' ) );
	wp_enqueue_script( $script_handle );
}
// add_action('wp_enqueue_scripts', 'elead_lightbox_register_public_hooks');

function get_elead_lightbox_form() {
	$rtn_page = get_page_by_path('thank-you');
	if ( $rtn_page ) {
		$rtn_url = get_page_uri($rtn_page);
	} else {
		$rtn_url = get_page_uri();
	}
	$form     = new ELeadLightboxForm(
		$endpoint = 'https://dteng-12546a52479-developer-edition.na7.force.com/services/apexrest/i360/eLead?encoding=UTF-8',
		$returnURL = $rtn_url
	);
	$services = array(
		'Solar',
		'Windows',
		'Insulation',
		'Roofing',
		'Other'
	);
	foreach ( $services as $service ) {
		$form->set_service( $service );
	}
	$form->set_service_header( 'I am interested in the following services.' );
	return $form;
}

function elead_lightbox_form() {
	$form = get_elead_lightbox_form();
	return $form->get_form();
}

function elead_lightbox_cta() {
	$form = get_elead_lightbox_form();
	$cta = new ELeadLightboxCTA( $form );
	return $cta->get_html();
}

function elead_lightbox_shortcode_init() {
	add_shortcode( 'elead-lightbox-form', 'elead_lightbox_form' );
	add_shortcode( 'elead-lightbox-cta', 'elead_lightbox_cta' );
}

add_action( 'init', 'elead_lightbox_shortcode_init' );
