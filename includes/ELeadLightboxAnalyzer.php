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
		$this->add_actions();
	}

	/**
	 * Adds required action hooks.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function add_actions() {
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
		$templates = plugin_dir_path( dirname( __FILE__ ) ) . 'templates';
		include "$templates/page-analyzer.php";
	}
}

ELeadLightboxAnalyzer::get_instance();
