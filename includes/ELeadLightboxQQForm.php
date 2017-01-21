<?php

/**
 * Created by PhpStorm.
 * User: John
 * Date: 11/28/16
 * Time: 12:21 PM
 */
class ELeadLightboxQQForm {

	const PREFIX = 'elead-lightbox-qqform';
	protected static $formn = 0;
	protected static $fieldn = 0;
	private $action, $url, $cta;
	private $header = '';
	private $formid = '';
	private $legend = 'Please provide';
	private $show = array(
		'usage'   => false,
		'address' => true,
		'zipcode' => true
	);

	function __construct(
		$endpoint = '#',
		$returnURL = '#',
		$call_to_action = 'get quote'
	) {
		if ( $endpoint ) {
			$this->action = $endpoint;
		}

		if ( $returnURL ) {
			$this->url = $returnURL;
		}
		$this->cta = trim( strip_tags( $call_to_action ) );
		self::$formn ++;
		$this->formid = self::PREFIX . '-' . self::$formn;
	}

	function set_endpoint( $endpoint ) {
		if ( $endpoint ) {
			$this->action = $endpoint;
		}
	}

	function set_returnURL( $returnURL ) {
		if ( $returnURL ) {
			$this->url = $returnURL;
		}
	}

	function set_header( $text ) {
		$this->header = trim( $text );
	}

	function hide( $field ) {
		if ( array_key_exists( $field, $this->show ) ) {
			$this->show[ $field ] = false;
		}
	}

	function show( $field ) {
		if ( array_key_exists( $field, $this->show ) ) {
			$this->show[ $field ] = true;
		}
	}

	function get_id() {
		return $this->formid;
	}

	private
	function get_text_input(
		$placeholder, $required = false, $minlength = 2, $maxlength = 100
	) {
		self::$fieldn ++;
		$id          = sprintf( '%s-input-%d', $this->formid, self::$fieldn );
		$placeholder = strtolower( trim( strip_tags( $placeholder ) ) );
		$name        = strtolower( preg_replace( '/\W+/', '', $placeholder ) );
		$required    = $required ? 'required' : '';
		$html        = sprintf( '  <label for="%s" class="%s">' . PHP_EOL, $id, self::PREFIX . '__input' );
		$html .= sprintf( '    <input type="text" id="%s" name="%s" minlength="%d" maxlength="%d" %s placeholder="%s">',
			$id, $name, $minlength, $maxlength, $required, $placeholder );
		$html .= sprintf( '    <div class="%s__error"></div>' . PHP_EOL, self::PREFIX );
		$html .= '  </label>' . PHP_EOL;

		return $html;
	}

	private
	function get_submit_button() {
		self::$fieldn ++;
		$id   = sprintf( '%s-input-%d', $this->formid, self::$fieldn );
		$html = sprintf( '  <label for="%s" class="%s">' . PHP_EOL, $id, self::PREFIX . '__submit' );
		$html .= sprintf( '    <input id="%s" type="submit" name="submit" value="%s">' . PHP_EOL, $id, $this->cta );
		$html .= '  </label>' . PHP_EOL;

		return $html;
	}


	function get_form() {
		if ( ! $this->action ) {
			return '';
		}
		// $url = filter_var( $this->url, FILTER_VALIDATE_URL );
		$url = $this->url;
		if ( ! $url ) {
			$url = '#';
		}
		$form = sprintf( '<form id="%s" name="%s" class="%s" action="%s" method="POST" autocomplete="off">' . PHP_EOL,
			$this->formid, $this->formid, self::PREFIX, $this->action );
		$form .= sprintf( '   <legend class="%s__legend"></legend>' . PHP_EOL, self::PREFIX );
		$form .= sprintf( '   <fieldset class=%s__fieldset>' . PHP_EOL, self::PREFIX );
		$form .= sprintf( '   <legend>%s</legend>' . PHP_EOL, $this->legend );

		// hidden input
		$form .= sprintf( '  <input type="hidden" name="sourcetype" value="%s">' . PHP_EOL, 'Website' );
		$form .= sprintf( '  <input type="hidden" name="source" value="%s">' . PHP_EOL, 'eLead Form' );
		$form .= sprintf( '  <input type="hidden" name="retURL" value="%s">' . PHP_EOL, $url );

		// form input fields
		$form .= $this->get_text_input( 'First Name' );
		$form .= $this->get_text_input( 'Last Name' );
		$form .= $this->get_text_input( 'Email' );
		$form .= $this->get_text_input( 'Phone Number' );
		if ( $this->show['address'] ) {
			$form .= $this->get_text_input( 'Street Address' );
		}
		if ( $this->show['zipcode'] ) {
			$form .= $this->get_text_input( 'Zip Code' );
		}
		if ( $this->show['usage'] ) {
			$form .= $this->get_text_input( 'Daily Average kWh' );
		} else {
			$form .= sprintf( '  <input type="hidden" name="dailyaveragekwh" value="">' . PHP_EOL );
		}
		$form .= '  </fieldset>' . PHP_EOL;

		// submit
		$form .= $this->get_submit_button();

		//close and return
		$form .= '</form>' . PHP_EOL;

		return $form;
	}

	function get_html() {
		$html = '';

		$form = $this->get_form();
		if ( $form ) {
			return sprintf( '  <div class="%s__wrapper">' . PHP_EOL . $form . '  </div>' . PHP_EOL, self::PREFIX );
		} else {
			return '';
		}
	}

}

