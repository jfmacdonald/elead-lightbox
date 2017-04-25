<?php
/*
 * (c) 2017 John Farrell MacDonald <john@jfmacdonald.com>
 */

namespace eLeadLightbox;


/**
 * @since      1.1.0
 * @package    elead-lightbox
 * @author     John Farrell MacDonald <john@jfmacdonald.com>
 */
class ELeadLightboxMailer {

	private $wp = '';

	private $email = '';

	private $size = 0;

	private $input = array(
		'firstname'     => '',
		'lastname'      => '',
		'email'         => '',
		'phonenumber'   => '',
		'streetaddress' => '',
		'zipcode'       => '',
		'dailyavekwh'   => '',
		'wppath'        => '',
	);

	private $response = array(
		'sent'    => FALSE,
		'message' => '',
	);

	private $debug = FALSE;

	private $log = '/var/tmp/php_error.log';

	function __construct() {
		foreach ( $this->input as $property => $value ) {
			if ( array_key_exists( $property, $_POST ) ) {
				$this->input[ $property ] = $this->sanitize( $_POST[ $property ] );
			}
			$this->debug( "PROPERTY $property VALUE " . $this->input[ $property ] );
		}
		if ( $this->input['email'] ) {
			$this->email = filter_var( $this->input['email'],
				FILTER_VALIDATE_EMAIL );
		}
		if ( $this->input['dailyavekwh'] ) {
			$this->size = floatval( $this->input['dailyavekwh'] );
		}
		$this->mincost  = 3.35;
		$this->maxcost  = 5.0;
		$this->provider = 'contact@rcenergysolutions.com';
		$this->header   = array(
			'From: ' . $this->provider,
			'Reply-to: ' . $this->provider,
			'Bcc: ' . $this->provider,
			'Bcc: ' . 'jose@datalinkseo.com',
		);
		$this->load_wordpress();
	}

	private function find_wordpress_base_path() {
		$dir = dirname( __FILE__ );
		do {
			if ( file_exists( $dir . "/wp-load.php" ) ) {
				return $dir;
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
			define( 'WP_USE_THEMES', FALSE );
			global $wp, $wp_query, $wp_the_query, $wp_rewrite, $wp_did_header;
			require( BASE_PATH . 'wp-load.php' );
			$this->wp = $wp;
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

	function validate() {
		return $this->email && $this->size;
	}

	function get_name() {
		$name = $this->input['firstname'] . ' ' . $this->input['lastname'];

		return $name;
	}

	function get_email() {
		return $this->email;
	}

	function get_size() {
		return $this->size;
	}

	function min_cost() {
		return '$' . number_format( 1000 * $this->mincost * $this->size );
	}

	function max_cost() {
		return '$' . number_format( 1000 * $this->maxcost * $this->size );
	}

	function get_message() {
		$name    = $this->get_name();
		$size    = $this->get_size();
		$min     = $this->min_cost();
		$max     = $this->max_cost();
		$message = <<< EOM
		
Hello {$name},

Thanks for using the RC Energy Solutions solar cost calculator. We estimate that your solar installation providing {$size} kW will cost between {$min} and {$max}.

There are many factors that can influence where you fall within this range. Here are just a few:

- Roof pitch
- Available roof space
- Type of roofing material
- Average daily sunlight at your home
- Type of solar panel
- A need for electrical work
	

One of our team members will be in touch shortly to schedule a free, no-pressure in-home consultation so we can provide you with more information and an exact quote.
	
Thank you for contacting RC Energy Solutions about your solar power needs. We look forward to working with you! 

Justin Lonson

President, RC Energy Solutions

(760) 504-9273

contact@rcenergysolutions.com 

EOM;

		return $message;
	}

	// send email
	function send() {
		$this->response['sent'] = FALSE;
		if ( ! $this->validate() ) {
			if ( $this->size ) {
				$this->response['message'] = 'Please enter a valid email address.';
				$this->debug( 'invalid email address' );
			} elseif ( $this->email ) {
				$this->response['message'] = 'Please enter daily average kWh.';
				$this->debug( 'missing data entry' );
			} else {
				$this->response['message'] = 'invalid email and missing entry.';
			}

			return $this->response;
		}

		// email header and body
		$address = $this->email;
		$subject = "Your solar estimate";
		$message = $this->get_message();
		$this->debug( "MESSAGE: " . $message );


		if ( $this->wp ) {
			$this->debug( "MAILER: wp_mail" . PHP_EOL );
			$this->response['sent'] = wp_mail( $address, $subject, $message,
				$this->header );
		} else {
			$header = join('\n\r', $this->header);
			$this->debug( "MAILER: mail" . PHP_EOL );
			$this->response['sent'] = mail( $address, $subject, $message,
				$header );
		}

		if ( ! $this->response['sent'] ) {
			$this->response['message'] = 'Not able to send email.';
			$this->debug( 'Not able to send email.' );
		} else {
			$this->response['message'] = 'Please check your email for your solar estimate.';
			$this->debug( 'email sent' );
		}

		return $this->response;
	}

}

$mailer = new ELeadLightboxMailer();

$response = $mailer->send();

echo json_encode( $response );

$status = $response['sent'] ? 0 : 1;
exit( $status );

