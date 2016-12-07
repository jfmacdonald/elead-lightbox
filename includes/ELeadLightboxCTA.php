<?php

/**
 * Created by PhpStorm.
 * User: John
 * Date: 11/28/16
 * Time: 12:21 PM
 */
class ELeadLightboxCTA {

	const PREFIX = 'elead-lightbox-cta';
	private $id = '';
	private $input = '';
	private $cta = '';
	private $modal = null;
	protected static $ctan = 0;

	function __construct( $form, $call_to_action = 'free quote', $input = 'zip code' ) {
		self::$ctan ++;
		$this->cta = trim( strip_tags( $call_to_action ) );
		$this->id  = self::PREFIX . '-' . self::$ctan;
		$this->set_input( $input );
		if ( $form instanceof ELeadLightboxForm ) {
			$this->modal = new ELeadLightboxModal( $form->get_form($hide_zipcode=true) );
		}
	}

	function set_call_to_action( $call_to_action ) {
		$this->cta = trim( strip_tags( $call_to_action ) );
	}

	function set_input( $input ) {
		$this->input = trim( strip_tags( $input ) );
	}

	function get_id() {
		return $this->id;
	}

	function get_button() {
		$html = sprintf( '  <form id="%s" class="%s" action="">' . PHP_EOL, $this->id, self::PREFIX );
		$html .= sprintf( '    <fieldset class="%s__fieldset">' . PHP_EOL, self::PREFIX );
		$html .= sprintf( '      <input class="%s__input" type="text" placeholder="%s" title="%s" minlength="%d" %s>' . PHP_EOL,
			self::PREFIX, ucwords( strtolower( $this->input ) ), $this->input, 5, 'required' );
		$html .= sprintf( '      <button class="%s__button" type="button" name="%s"> %s </button>' . PHP_EOL,
			self::PREFIX, self::PREFIX, ucwords( strtolower( $this->cta ) ) );
		$html .= '    </fieldset>' . PHP_EOL;
		$html .= sprintf( '   <div class="%s__error"></div>'. PHP_EOL, self::PREFIX );
		$html .= '  </form>' . PHP_EOL;

		return $html;
	}

	function get_html() {
		$html = $this->get_button();
		if ( $this->modal ) {
			$html .= $this->modal->get_html();
		}

		return $html;
	}

}

