<?php

/**
 * The core plugin class.
 *
 * @since      0.1.0
 * @package    ELeadLightbox
 * @subpackage ELeadLightbox/includes
 * @author     John Farrell MacDonald <john@jfmacdonald.com>
 */
class ELeadLightbox {
	private static $instance;

	public static function bootstrap() {
		if ( self::$instance == null ) {
			self::$instance = new self();
		}
	}

	/**
	 * @since   0.1.0
	 * @access  protected
	 * @var     string $plugin_name This plugin name
	 * @var     string $version Current plugin version
	 * @var     string $style_handle Stylesheet handle for enqueue
	 * @var     string $scripts_handle JavaScript handle for enqueue
	 */
	protected $plugin_name, $version, $style_handle, $scripts_handle;

	/**
	 * @since   0.1.0
	 * @access  private
	 * @var     string $endpoint CRM target endpoint -- the form action
	 * @var     string $returnURL URL that CRM should return
	 * @var     array $services list of services -- the form will have checkbox for each
	 */
	public $endpoint, $returnURL, $services;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * @since    0.1.0
	 */
	public function __construct() {

		$this->plugin_name    = 'elead-lightbox';
		$this->version        = '0.1.0';
		$this->style_handle   = $this->plugin_name . '-styles';
		$this->scripts_handle = $this->plugin_name . '-scripts';
		$this->services       = array(
			'Solar',
			'Windows',
			'Insulation',
			'Roofing',
			'Other'
		);
		$this->endpoint       = '';
		$this->returnURL      = '';

		$this->load_dependencies();
		$this->set_locale();
		$this->register_admin_hooks();
		$this->register_public_hooks();
		add_action( 'wp_enqueue_scripts', array( $this, 'register_public_hooks' ) );
		add_action( 'init', array( $this, 'register_shortcodes' ) );
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
		require_once( "$includes/ELeadLightboxI18n.php" );
		require_once( "$includes/ELeadLightboxForm.php" );
		require_once( "$includes/ELeadLightboxModal.php" );
		require_once( "$includes/ELeadLightboxCTA.php" );
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
		add_action( 'plugins_loaded', array( $plugin_i18n, 'load_plugin_textdomain' ) );

	}

	/**
	 * Register admin dashboard hooks
	 *
	 * @access   private
	 */
	private function register_admin_hooks() {

	}

	/**
	 * Register hooks for public-facing function
	 *
	 * @access   private
	 */
	function register_public_hooks() {
		$public = plugin_dir_url( dirname( __FILE__ ) ) . 'public';
		wp_register_style( $this->style_handle, $public . '/css/' . $this->plugin_name . '-public.css' );
		wp_enqueue_style( $this->style_handle );
		wp_register_script( $this->scripts_handle, $public . '/js/' . $this->plugin_name . '-public.js', array( 'jquery' ) );
		wp_enqueue_script( $this->scripts_handle );
	}

	public function register_shortcodes() {
		add_shortcode( 'elead-lightbox-form', array( $this, 'elead_form' ) );
		add_shortcode( 'elead-lightbox-cta', array( $this, 'elead_cta' ) );
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

	public function elead_form() {
		$form = new ELeadLightboxForm(
			$endpoint = $this->endpoint, $returnURL = $this->returnURL
		);
		foreach ( $this->services as $service ) {
			$form->set_service( $service );
		}
		$form->set_service_header( 'I am interested in the following services.' );
		echo $form->get_html();
	}

	public function elead_cta() {
		$form = new ELeadLightboxForm(
			$endpoint = $this->endpoint, $returnURL = $this->returnURL
		);
		foreach ( $this->services as $service ) {
			$form->set_service( $service );
		}
		$form->set_service_header( 'I am interested in the following services.' );
		$cta = new ELeadLightboxCTA( $form );
		echo $cta->get_html();
	}

}
