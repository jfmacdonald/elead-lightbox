<?php
/*
 * (c) 2017 John Farrell MacDonald <john@jfmacdonald.com>
 */


namespace eLeadLightbox;

require __DIR__ . '/vendor/autoload.php';
use Jaybizzle\CrawlerDetect\CrawlerDetect;
use GeoIp2\Database\Reader;


/**
 * @since      1.2.0
 * @package    elead-lightbox
 * @author     John Farrell MacDonald <john@jfmacdonald.com>
 */
class ELeadLightboxAnalyzer {

	private $input = array(
		'action' => '',
		'id'     => '',
		'class'  => '',
		'route'  => '',
		'modal'  => '',
		'wppath' => '',
	);
	private $debug = true;
	private $log = '/var/tmp/php_error.log';
	private $botDetect = null;
	private $geoDetect = null;
	private $form_table = '';
	private $activity_table = '';
	private $db;

	function __construct() {
		foreach ( $this->input as $property => $value ) {
			if ( array_key_exists( $property, $_POST ) ) {
				$this->input[ $property ] = $this->sanitize( $_POST[ $property ] );
			}
			$this->debug( "PROPERTY $property VALUE " . $this->input[ $property ] );
		}
		$this->debug( 'Loading WordPress.' );
		$this->load_wordpress();
		$this->debug( 'CrawlerDetect' );
		$this->botDetect = new CrawlerDetect();
		// $this->debug( 'GeoDetect' );
		// $this->geoDetect = new Reader( __DIR__ . '/GeoLite2-Country.mmdb' );
		global $wpdb;
		$this->debug( 'Connecting WP database ' . var_export( $wpdb ) );
		$this->db             = $wpdb;
		$this->form_table     = $wpdb->prefix . 'eleadlightbox_forms';
		$this->activity_table = $wpdb->prefix . 'eleadlightbox_activity';
	}

	private function find_wordpress_base_path() {
		$dir = dirname( __FILE__ );
		do {
			$this->debug( "Looking for wp-load.php in $dir" );
			if ( file_exists( $dir . "/wp-load.php" ) ) {
				return $dir;
			}
			if ( $dir === '/' ) {
				$this->debug( 'Could not find WordPress!!' );
				exit( 2 );
			}
		} while ( $dir = realpath( "$dir/.." ) );

		return '';
	}

	private function load_wordpress() {
		$wp = $this->input['wppath'];
		// look for wordpress if posted wppath is invalid
		if ( ! $wp || ! file_exists( $wp . 'wp-load.php' ) ) {
			$wp = $this->find_wordpress_base_path();
		}
		if ( $wp ) {
			define( 'BASE_PATH', $wp . "/" );
			define( 'WP_USE_THEMES', false );
			global $wp, $wp_query, $wp_the_query, $wp_rewrite, $wp_did_header;
			require( BASE_PATH . '/wp-load.php' );
			$this->wp = $wp;
			$this->debug( 'WordPress loaded.' );
		}
	}

	function debug( $string ) {
		if ( $this->debug ) {
			error_log( $string . PHP_EOL, 3, $this->log );
		}
	}

	function sanitize( $string ) {
		return htmlentities(
			str_replace( array( "\r", "\n" ), array( " ", " " ),
				strip_tags( $string ) ),
			ENT_QUOTES );
	}

	function is_bot() {
		$bot = $this->botDetect->isCrawler();
		if ( $bot ) {
			$this->debug( 'Bots! ' . $this->botDetect->getMatches() );
		}

		return $bot;
	}

	function save_activity() {
		$action     = $this->input['action'];
		$form_id    = $this->input['id'];
		$form_class = $this->input['class'];
		$form_route = $this->input['route'];
		$is_modal   = (int) $this->input['modal'];
		$digest     = md5( $form_route . '#' . $form_id );
		$date       = date( 'Y-m-d' );

		$this->debug( "Saving activity: $action, $form_id, $form_route, $digest, $date" );

		// form in db?
		$form_table = $this->form_table;
		$row        = $this->db->get_row( $this->db->prepare(
			"SELECT * FROM $form_table WHERE digest = %s",
			$digest ) );

		$saved = false;

		if ( ! $row ) {
			$saved = $this->db->insert(
				$this->form_table, array(
				'digest' => $digest,
				'route'  => $form_route,
				'formid' => $form_id,
				'class'  => $form_class,
				'modal'  => $is_modal
			), array( '%s', '%s', '%s', '%s', '%d' ) );
		}

		// activity
		$activity_table = $this->activity_table;
		$row            = $this->db->get_row( $this->db->prepare(
			"SELECT * FROM $activity_table WHERE digest = %s AND date = %s",
			$digest, $date ) );

		$view   = $row ? $row->view : 0;
		$focus  = $row ? $row->focus : 0;
		$submit = $row ? $row->submit : 0;

		$valid = true;
		switch ( $action ) {
			case "view" :
				$view ++;
				break;
			case "focus":
				$focus ++;
				break;
			case "submit":
				$submit ++;
				break;
			default:
				$valid = false;
		}
		if ( $valid ) {
			$saved = $this->db->replace( $this->activity_table,
				array(
					'date'   => $date,
					'digest' => $digest,
					'view'   => $view,
					'focus'  => $focus,
					'submit' => $submit
				),
				array( '%s', '%s', '%d', '%d', '%d' ) );
		}

		return $saved;
	}

}

$analyzer = new ELeadLightboxAnalyzer();

$status = 1;

if ( ! $analyzer->is_bot() ) {
	if ( $analyzer->save_activity() ) {
		$status = 0;
	}
}

exit( $status );

