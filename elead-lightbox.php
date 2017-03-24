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
 * Version:           1.1.5
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

function get_elead_lightbox_form() {
	$rtn_url = get_permalink( get_page_by_path( 'thank-you' ) );
	// error_log( sprintf( "rtn_url is %s\n", $rtn_url ), 3, '/var/tmp/php-error.log' );
	$test     = true;
	$endpoint = $test ?
		'https://dteng-12546a52479-developer-edition.na7.force.com/services/apexrest/i360/eLead?encoding=UTF-8' :
		'https://rcenergysolutions.secure.force.com/services/apexrest/i360/eLead';
	$form     = new ELeadLightboxForm();
	$form->set_endpoint( $endpoint );
	$form->set_returnURL( $rtn_url );
	$services = array(
		'Solar',
		'Windows',
		'Insulation',
		'Roofing'
	);
	foreach ( $services as $service ) {
		$form->set_service( $service );
	}
	$form->set_service_header( 'I am interested in' );

	return $form;
}

function elead_lightbox_form() {
	$form = get_elead_lightbox_form();

	return $form->get_form();
}

function elead_lightbox_cta() {
	$form = get_elead_lightbox_form();
	$form->set_legend( 'Get a free home-energy consultation in <span class="elead-lightbox-form__city"></span>.' );
	$cta  = new ELeadLightboxCTA( $form );

	return $cta->get_html();
}

function get_elead_lightbox_qqform() {
	$test     = true;
	$endpoint = $test ?
		'https://dteng-12546a52479-developer-edition.na7.force.com/services/apexrest/i360/eLead?encoding=UTF-8' :
		'https://rcenergysolutions.secure.force.com/services/apexrest/i360/eLead';
	$form     = new ELeadLightboxQQForm();
	$form->set_endpoint( $endpoint );
	$form->set_legend(   '<div>Your solar system size is</div>'
	                   . '<div class="elead-lightbox-qqform__systemsize"></div>'
	                   . '<div>Get an instant quote.</div>' );

	return $form;
}

function elead_lightbox_quickquote() {
	$form = get_elead_lightbox_qqform();
	$cta  = new ELeadLightboxQuickQuote( $form );

	return $cta->get_html();
}

function elead_lightbox_shortcode_init() {
	add_shortcode( 'elead-lightbox-form', 'elead_lightbox_form' );
	add_shortcode( 'elead-lightbox-cta', 'elead_lightbox_cta' );
	add_shortcode( 'elead-lightbox-instant-quote', 'elead_lightbox_quickquote' );
}

add_action( 'init', 'elead_lightbox_shortcode_init' );
