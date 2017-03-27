<?php

/**
 * Created by PhpStorm.
 * User: John
 * Date: 11/28/16
 * Time: 12:21 PM
 */
class ELeadLightboxForm {

	const PREFIX = 'elead-lightbox-form';
	protected static $formn = 0;
	protected static $fieldn = 0;
	private $action, $url, $cta;
	private $service = array();
	private $service_header = '';
	private $formid = '';
	private $legend = 'Get a free home-energy consultation.';

	function __construct(
		$endpoint = '#',
		$returnURL = '#',
		$call_to_action = 'free quote'
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

	function set_legend( $text ) {
		$this->legend = trim( $text );
	}

	function set_service( $description ) {
		$trimmed = trim( $description );
		if ( $trimmed ) {
			$id                   = self::PREFIX . '-' . strtolower( preg_replace( '/\W+/', '-', $trimmed ) );
			$this->service[ $id ] = $trimmed;
		}
	}

	function set_service_header( $string ) {
		$trimmed              = trim( strip_tags( $string ) );
		$this->service_header = $trimmed;
	}

	function get_id() {
		return $this->formid;
	}

	private function get_text_input( $placeholder, $fieldname='', $required = false, $minlength = 2, $maxlength = 100 ) {
		self::$fieldn ++;
		$id          = sprintf( '%s-input-%d', $this->formid, self::$fieldn );
		$placeholder = strtolower( trim( strip_tags( $placeholder ) ) );
		$name        = $fieldname ? $fieldname : strtolower( preg_replace( '/\W+/', '', $placeholder ) );
		$required    = $required ? 'required' : '';
		$html        = sprintf( '  <label for="%s" class="%s">' . PHP_EOL, $id, self::PREFIX . '__input' );
		$html .= sprintf( '    <input type="text" id="%s" name="%s" minlength="%d" maxlength="%d" %s placeholder="%s">',
			$id, $name, $minlength, $maxlength, $required, $placeholder );
		$html .= sprintf( '    <div class="%s__error"></div>' . PHP_EOL, self::PREFIX );
		$html .= '  </label>' . PHP_EOL;

		return $html;
	}

	private function get_checkbox_input( $name, $description ) {
		self::$fieldn ++;
		$id          = sprintf( '%s-checkbox-%d', $this->formid, self::$fieldn );
		$description = trim( strip_tags( $description ) );
		$parts       = preg_split('/\-/', $name);
		$html        = sprintf( '  <label for="%s" class="%s">', $id, self::PREFIX . '__checkbox' );
		$html .= sprintf( '<input type="checkbox" id="%s" name="%s" value="%s">', $id, $name, end($parts) );
		$html .= sprintf( ' %s </label>' . PHP_EOL, $description );

		return $html;
	}

	private function get_submit_button() {
		self::$fieldn ++;
		$id   = sprintf( '%s-input-%d', $this->formid, self::$fieldn );
		$html = sprintf( '  <div class="%s">' . PHP_EOL, self::PREFIX . '__submit' );
		$html .= sprintf( '    <button id="%s" type="submit" name="submit">%s <i class="fa fa-spin"></i></button>' . PHP_EOL,
			$id, $this->cta );
		$html .= '</div>' . PHP_EOL;

		return $html;
	}

	function get_response() {

		$class = self::PREFIX . '-response';

		$html = <<<EOM
		<div class="{$class}">
		<p>Thank you for contacting RC Energy Solutions about your home energy needs.</p>
		<p>One of our team members will be in touch shortly to schedule a free, no-pressure, in-home consultation so we can provide you with more information and an exact quote.</p>
		<p>We look forward to working with you!</p>
		</div>
		
EOM;

		return $html;
	}


	function get_html( $hide_zipcode = false, $show_address = false ) {
		if ( ! $this->action ) {
			return '';
		}
		// $url = filter_var( $this->url, FILTER_VALIDATE_URL );
		$url = $this->url;
		if ( ! $url ) {
			$url = '#';
		}
		$form = $this->get_response();
		$form .= sprintf( '<form id="%s" name="%s" class="%s" action="%s" method="POST" target="target-%s">' . PHP_EOL,
			$this->formid, $this->formid, self::PREFIX, $this->action, $this->formid );
		$form .= sprintf( '   <legend class="%s__legend">%s</legend>' . PHP_EOL, self::PREFIX, $this->legend );
		$form .= sprintf( '   <fieldset class=%s__fieldset>' . PHP_EOL, self::PREFIX );

		// hidden input
		$form .= sprintf( '  <input type="hidden" name="sourcetype" value="%s">' . PHP_EOL, 'Website' );
		$form .= sprintf( '  <input type="hidden" name="source" value="%s">' . PHP_EOL, 'eLead Form' );
		$form .= sprintf( '  <input type="hidden" name="i360__Components__c" id="components-%s" value="">'. PHP_EOL, $this->formid);
		$form .= sprintf( '  <input type="hidden" name="i360__Interests__c" id="interests-%s" value="">'. PHP_EOL, $this->formid);

		// $form .= sprintf( '  <input type="hidden" name="retURL" value="%s">' . PHP_EOL, $url );

		// form input fields
		$form .= $this->get_text_input( 'First Name' );
		$form .= $this->get_text_input( 'Last Name', $required = false );
		$form .= $this->get_text_input( 'Email', $required = false );
		$form .= $this->get_text_input( 'Phone', 'phone1' );
		if ( $show_address ) {
			$form .= $this->get_text_input( 'Street Address' );
		}
		if ( $hide_zipcode ) {
			$form .= sprintf( '  <input type="hidden" name="zip" value="">' . PHP_EOL );
			$form .= sprintf( '  <input type="hidden" name="city" value="">' . PHP_EOL );
		} else {
			$form .= $this->get_text_input( 'Zipcode', 'zip' );
		}
		$form .= '  </fieldset>' . PHP_EOL;

		// services
		$form .= sprintf( '   <fieldset class=%s__fieldset>' . PHP_EOL, self::PREFIX );
		$form .= sprintf( '   <p>%s</p>' . PHP_EOL, $this->service_header );

		foreach ( $this->service as $service_name => $service_description ) {
			$form .= $this->get_checkbox_input( $service_name, $service_description );
		}
		$form .= '  </fieldset>' . PHP_EOL;

		// submit
		$form .= $this->get_submit_button();

		//close and return
		$form .= '</form>' . PHP_EOL;

		$form .= sprintf( '<iframe class="%s__target" name="target-%s" height="0"></iframe>' . PHP_EOL, self::PREFIX, $this->formid );

		return $form;
	}

	function get_wrapped_html() {
		$form_html = $this->get_html();
		if ( $form ) {
			return sprintf( '  <div class="%s__wrapper">' . PHP_EOL . $form_html . '  </div>' . PHP_EOL, self::PREFIX );
		} else {
			return '';
		}
	}

}

