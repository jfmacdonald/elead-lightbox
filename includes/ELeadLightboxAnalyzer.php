<?php

/**
 * Created by PhpStorm.
 * User: johnmac
 * Date: 3/26/17
 * Time: 7:11 PM
 */
class ELeadLightboxAnalyzer {

	/**
	 * Static variables
	 *
	 * @since 1.2.0
	 * @access private
	 * @var $instance , $slug
	 */
	private static $instance;
	private static $slug = 'elead-lightbox-analyzer';

	/**
	 * Instance variables;
	 * @since 1.2.0
	 */
	private $dt;
	private $description;
	private $forms = array();

	/**
	 * Returns a singleton instance of the  page.
	 *
	 * @since 1.0.0
	 *
	 * @return ELeadLightboxAnalyzer instance
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	function __construct() {
		$tz                = new \DateTimeZone( 'America/Los_Angeles' );
		$this->debug       = false;
		$this->dt          = new \DateTime( '2017-01-01', $tz );
		$this->forms       = array();
		$this->description = array(
			'elead-lightbox-quote-cta'  => 'Zip Code Quote CTA',
			'elead-lightbox-quote-form' => 'Zip Code Quote Form',
			'elead-lightbox-cal-cta'    => 'Calculator Quote CTA',
			'elead-lightbox-cal-form'   => 'Calculator Quote Form'
		);
		$this->add_actions();
	}


	/**
	 * Adds required action hooks.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	function add_actions() {
		add_action( 'admin_menu', array( $this, 'register_page' ) );
	}

	/**
	 * Adds the analyzer page.
	 *
	 * @since 1.2.0
	 */
	function register_page() {
		$page_title = 'eLead Lightbox Activity Analyzer';
		$menu_entry = 'eLead Activity';

		add_management_page( $page_title, $menu_entry, 'edit_dashboard',
			self::$slug, array( $this, 'render_page' ) );
	}

	function render_page() {
		$this->update_history();
		$analyzer  = $this;
		$templates = plugin_dir_path( dirname( __FILE__ ) ) . 'templates';
		include "$templates/page-analyzer.php";
	}

	function retrieve_form_digests() {
		global $wpdb;
		$table   = $wpdb->prefix . 'eleadlightbox_forms';
		$query   = "SELECT digest FROM $table ORDER BY formid";
		$digests = $wpdb->get_col( $query );

		return $digests;
	}

	function retrieve_form_data( $digest ) {
		global $wpdb;
		$forms_table = $wpdb->prefix . 'eleadlightbox_forms';
		$row         = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM $forms_table WHERE digest = %s", $digest ) );

		return (object) $row;
	}

	function get_end_date( $week ) {
		$this->dt->setTimestamp( time() - $week * 604800 );

		return $this->dt->format( 'Y-m-d' );
	}

	function get_begin_date( $week ) {
		$this->dt->setTimestamp( time() - 518400 - $week * 604800 );

		return $this->dt->format( 'Y-m-d' );
	}

	function retrieve_sum( $action, $digest, $week = null ) {
		global $wpdb;
		$table = $wpdb->prefix . 'eleadlightbox_activity';
		if ( ! in_array( $action, array( 'view', 'focus', 'submit' ) ) ) {
			die( "get_sum() illegal action $action" );
		}
		$query = "SELECT SUM($action) FROM $table WHERE digest = '$digest' ";
		if ( is_int( $week ) ) {
			$begin = $this->get_begin_date( $week );
			$end   = $this->get_end_date( $week );
			$query .= " AND date BETWEEN '$begin' AND '$end' ";
		}
		$sum = $wpdb->get_var( $query );
		if ( $sum == null ) {
			$sum = 0;
		}

		return (int) $sum;
	}

	function update_history() {
		$this->forms = array();
		$digests     = $this->retrieve_form_digests();
		$actions     = array( 'view', 'focus', 'submit' );
		foreach ( $digests as $digest ) {
			$form          = $this->retrieve_form_data( $digest );
			$form->history = array( array() );
			foreach ( $actions as $action ) {
				$form->history[0][ $action ] = $this->retrieve_sum( $action,
					$digest );
			}
			for ( $week = 0; $week < 4; $week ++ ) {
				$form->history[] = array();
				foreach ( $actions as $action ) {
					$form->history[ $week + 1 ][ $action ] = $this->retrieve_sum( $action,
						$digest, $week );
				}
			}
			$this->forms[] = $form;
		}
	}

	function get_week_end_dates() {
		$dates = array();
		for ( $week = 0; $week < 4; $week ++ ) {
			$dates[] = $this->get_end_date( $week );
		}

		return $dates;
	}

	function get_all_forms() {
		return $this->forms;
	}

	function get_forms() {
		$forms = array();
		foreach ( $this->forms as $form ) {
			if ( preg_match( '/-form/', $form->class ) ) {
				$forms[] = $form;
			}
		}

		return $forms;
	}

	function get_form_from_digest( $digest ) {
		foreach ( $this->forms as $form ) {
			if ( $form->digest == $digest ) {
				return $form;
			}
		}

		return null;
	}

	function get_form_route( $form ) {
		return $form->route;
	}

	function get_form_description( $form ) {
		$class = $form->class;
		$description = $form->formid;
		if ( array_key_exists( $class, $this->description ) ) {
			$description = $this->description[ $class ];
			if ( preg_match('/-(\d+)/', $form->formid, $matches ) ) {
				$description .= " " . $matches[1];
			}
		}
		return $description;
	}

	function get_form_id( $form ) {
		return $form->formid;
	}

	function get_form_submits( $form, $week = null ) {
		$index    = is_int( $week ) ? $week + 1 : 0;
		$activity = $form->history[ $index ]['submit'];

		return (int) $activity;
	}

	function get_form_focus( $form, $week = null ) {
		$index    = is_int( $week ) ? $week + 1 : 0;
		$activity = $form->history[ $index ]['focus'];

		return (int) $activity;
	}

	function get_form_views( $form, $week = null ) {
		$index = is_int( $week ) ? $week + 1 : 0;
		$views = $form->history[ $index ]['view'];

		return (int) $views;
	}

	function get_form_cta( $form ) {
		if ( ! $form->cta ) {
			return null;
		}
		foreach ( $this->forms as $cta ) {
			if ( $cta->formid == $form->cta && $cta->route == $form->route ) {
				return $cta;
			}
		}

		return null;
	}

	function get_form_activity( $form, $week = null ) {
		$index   = is_int( $week ) ? $week + 1 : 0;
		$nview   = (int) $form->history[ $index ]['view'];
		$nfocus  = (int) $form->history[ $index ]['focus'];
		$nsubmit = (int) $form->history[ $index ]['submit'];

		return sprintf( "%d-%d-%d", $nview, $nfocus, $nsubmit );

	}

	function get_form_conversion( $form, $week = null ) {
		if ( ! is_object( $form ) ) {
			die( "get_form_conversion: not an object" );
		}
		$submits = $this->get_form_submits( $form, $week );
		$cta     = $this->get_form_cta( $form );
		if ( ! $cta ) {
			$cta = $form;
		}
		$views = $this->get_form_views( $cta, $week );
		$rate  = $views > 0 ? 100 * $submits / floatval( $views ) : 0;

		return sprintf( "%d (%d%%)", $views, round( $rate ) );
	}
}

ELeadLightboxAnalyzer::get_instance();
