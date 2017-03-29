<?php

require dirname(__DIR__) . '/vendor/autoload.php';
use Jaybizzle\CrawlerDetect\CrawlerDetect;
use GeoIp2\Database\Reader;

/**
 * The core plugin class.
 *
 * @since      0.1.0
 * @package    ELeadLightbox
 * @subpackage ELeadLightbox/includes
 * @author     John Farrell MacDonald <john@jfmacdonald.com>
 */
class ELeadLightbox {
	const FONTAWESOME = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css';

	private static $instance;
	private $visitor_table = '';

	public static function bootstrap() {
		if ( self::$instance == null ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Create database tables when plugin is activated
	 */
	public static function activate() {

		global $wpdb;
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		// Collation
		$charset_collate = $wpdb->get_charset_collate();

		// Forms DB table
		$form_table = $wpdb->prefix . 'eleadlightbox_forms';
		$form_sql   = <<<FORM_TABLE
CREATE TABLE $form_table (
	digest char(32) NOT NULL,
	route  char(64) NOT NULL,
	formid char(64) NOT NULL,
	class  char(64),
	cta    char(64),
	target char(64),
	PRIMARY KEY  (digest)
) $charset_collate;
FORM_TABLE;
		dbDelta( $form_sql );

		// Activity DB table
		$activity_table = $wpdb->prefix . 'eleadlightbox_activity';
		$act_sql        = <<<ACTIVITY_TABLE
CREATE TABLE $activity_table (
	date date NOT NULL,
	digest char(32) NOT NULL,
	view int DEFAULT 0,
	focus int DEFAULT 0,
	submit int DEFAULT 0,
	PRIMARY KEY  (date, digest),
	FOREIGN KEY  (digest) REFERENCES $form_table(digest)
) $charset_collate;
ACTIVITY_TABLE;
		dbDelta( $act_sql );

		// Visitor DB table
		$visitor_table = $wpdb->prefix . 'eleadlightbox_visitor';
		$visitor_sql   = <<<VISITOR_TABLE
CREATE TABLE $visitor_table (
	ip char(40) NOT NULL,
	date date NOT NULL,
	state varchar(1024) DEFAULT '{}',
	PRIMARY KEY  (ip)
) $charset_collate;
VISITOR_TABLE;
		dbDelta( $visitor_sql );

		add_option( 'elead_lightbox_db_version', '1.0' );
	}


	/**
	 * @since   0.1.0
	 * @access  protected
	 * @var     string $plugin_name This plugin name
	 * @var     string $version Current plugin version
	 * @var     string $style_handle Stylesheet handle for enqueue
	 * @var     string $script_handle JavaScript handle for enqueue
	 */
	protected $plugin_name, $version, $style_handle, $script_handle, $botDetect, $geoDetect;

	/**
	 * @since   0.1.0
	 * @access  private
	 * @var     string $endpoint CRM target endpoint -- the form action
	 * @var     string $returnURL URL that CRM should return
	 * @var     array $services list of services -- the form will have checkbox for each
	 */
	public $endpoint, $returnURL, $services, $test;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * @since    0.1.0
	 */
	private function __construct() {

		$this->plugin_name   = 'elead-lightbox';
		$this->version       = '1.1.0';
		$this->style_handle  = $this->plugin_name . '-styles';
		$this->script_handle = $this->plugin_name . '-script';
		$this->services      = array(
			'Solar',
			'Windows',
			'Insulation',
			'Roofing'
		);
		$this->debug         = false;
		$this->test          = false;
		$this->endpoint      = $this->test ?
			'https://dteng-12546a52479-developer-edition.na7.force.com/services/apexrest/i360/eLead?encoding=UTF-8' :
			'https://rcenergysolutions.secure.force.com/services/apexrest/i360/eLead';
		$this->returnURL     = '';

		$this->botDetect = new CrawlerDetect();
		$this->geoDetect = new Reader( plugin_dir_path( dirname( __FILE__ ) ) . 'GeoLite2-Country.mmdb' );

		$this->load_dependencies();
		$this->set_locale();
		$this->add_actions();
		$this->register_shortcodes();

	}

	function debug( $string ) {
		if ( $this->debug ) {
			error_log( $string );
		}
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * @since    0.1.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * internationalization
		 */
		$includes = plugin_dir_path( dirname( __FILE__ ) ) . 'includes';
		require_once( "$includes/ELeadLightboxCalculatorCTA.php" );
		require_once( "$includes/ELeadLightboxCalculatorForm.php" );
		require_once( "$includes/ELeadLightboxI18n.php" );
		require_once( "$includes/ELeadLightboxModal.php" );
		require_once( "$includes/ELeadLightboxQuoteCTA.php" );
		require_once( "$includes/ELeadLightboxQuoteForm.php" );
	}

	private function is_bot() {
		$bot = $this->botDetect->isCrawler();
		if ( $bot ) {
			$this->debug( 'Bots! ' . $this->botDetect->getMatches() );
		}

		return $bot;
	}

	private function is_foreign() {
		$ip      = $this->get_ip();
		$country = '';
		try {
			$record  = $this->geoDetect->country( $ip );
			$country = $record->country->isoCode();
		} catch ( Exception $e ) {
			$this->debug( $e->getMessage() );
			$country = 'US';
		}

		return $country != 'US';
	}

	private function get_ip() {
		return $_SERVER['REMOTE_ADDR'];
	}

	private function get_visitor_state() {
		global $wpdb;
		$visitor_table = $wpdb->prefix . 'eleadlightbox_visitor';
		$query         = $wpdb->prepare( "SELECT * FROM $visitor_table WHERE ip = '%s'",
			$this->get_ip() );
		$row           = $wpdb->get_row( $query );
		if ( $row ) {
			$state = $row->state;
			$this->debug( $state );
		} else {
			$state = '{}';
		}

		return $state;
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the ELeadLightbox_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    0.1.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new ELeadLightboxI18n();
		add_action( 'plugins_loaded',
			array( $plugin_i18n, 'load_plugin_textdomain' ) );

	}

	private function add_actions() {
		add_action( 'init', array( $this, 'init' ) );
		add_action( 'wp_enqueue_scripts',
			array( $this, 'register_public_hooks' ) );
		add_action( 'admin_enqueue_scripts',
			array( $this, 'register_admin_hooks' ) );
	}

	function init() {
		$includes = plugin_dir_path( dirname( __FILE__ ) ) . 'includes';
		if ( is_admin() ) {
			require_once( "$includes/ELeadLightboxAnalyzer.php" );
		}
	}

	/**
	 * Register admin dashboard hooks
	 *
	 * @access   private
	 */
	function register_admin_hooks() {
		$plugin_dir = plugin_dir_url( dirname( __FILE__ ) );
		wp_register_style( $this->style_handle . '-admin',
			$plugin_dir . '/admin/css/' . $this->plugin_name . '-admin.css' );
		wp_enqueue_style( $this->style_handle . '-admin');
	}

	/**
	 * Register hooks for public-facing function
	 *
	 * @access   public
	 */
	function register_public_hooks() {
		$plugin_dir = plugin_dir_url( dirname( __FILE__ ) );
		wp_register_style( $this->style_handle,
			$plugin_dir . '/public/css/' . $this->plugin_name . '-public.css' );
		wp_register_style( $this->style_handle . '-fa', self::FONTAWESOME );
		wp_enqueue_style( $this->style_handle );
		wp_enqueue_style( $this->style_handle . '-fa' );
		wp_register_script( $this->script_handle,
			$plugin_dir . '/public/js/' . $this->plugin_name . '-public.min.js',
			array( 'jquery' ), '', true );
		wp_enqueue_script( $this->script_handle );
		wp_localize_script( $this->script_handle, 'eLeadLightbox', array(
			'state'        => $this->get_visitor_state(),
			'analyzer_url' => $plugin_dir . '/analyzer.php',
			'ip'           => $this->get_ip(),
			'is_guest'     => $this->is_bot() || $this->is_foreign() ? 0 : 1,
			'mailer_url'   => $plugin_dir . '/mailer.php',
			'wp_path'      => ABSPATH,
		) );
	}

	public function register_shortcodes() {
		add_shortcode( 'elead-lightbox-form',
			array( $this, 'elead_lightbox_quote_form' ) );
		add_shortcode( 'elead-lightbox-cta',
			array( $this, 'elead_lightbox_quote_cta' ) );
		add_shortcode( 'elead-lightbox-instant-quote',
			array( $this, 'elead_lightbox_calculator' ) );
	}


	/**
	 * Plugin name
	 * @since     0.1.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * Current plugin version
	 *
	 * @since     0.1.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

	public function set_endpoint( $string ) {
		$this->endpoint = filter_var( $string, FILTER_VALIDATE_URL );
	}

	public function set_return_url( $string ) {
		$this->returnURL = filter_var( $string, FILTER_VALIDATE_URL );
	}

	public function add_service( $string ) {
		$lowercase = strtolower( trim( strip_tags( $string ) ) );
		if ( ! in_array( $lowercase, $this->services ) ) {
			$this->services[] = $lowercase;
		}
	}

	function get_quote_form() {
		$rtn_url = get_permalink( get_page_by_path( 'thank-you' ) );
		$form    = new ELeadLightboxQuoteForm();
		$form->set_endpoint( $this->endpoint );
		$form->set_returnURL( $rtn_url );
		foreach ( $this->services as $service ) {
			$form->set_service( $service );
		}
		$form->set_service_header( 'I am interested in' );

		return $form;
	}

	function elead_lightbox_quote_form() {
		$form = $this->get_quote_form();
		if ( $form ) {
			return $form->get_html();
		} else {
			return '';
		}
	}

	function elead_lightbox_quote_cta() {
		$form = $this->get_quote_form();
		$form->set_legend( 'Get a free home-energy consultation in <span class="elead-lightbox-quote-form__city"></span>.' );
		$cta = new ELeadLightboxQuoteCTA( $form );

		return $cta->get_html();
	}

	function elead_lightbox_calculator() {
		$form = new ELeadLightboxCalculatorForm();
		$form->set_endpoint( $this->endpoint );
		$form->set_legend( '<div>Your solar system size is</div>'
		                   . '<div class="elead-lightbox-cal-form__systemsize"></div>'
		                   . '<div>Get an instant quote.</div>' );
		$cta = new ELeadLightboxCalculatorCTA( $form );

		return $cta->get_html();
	}

}
