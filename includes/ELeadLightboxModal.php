<?php

/**
 * Created by PhpStorm.
 * User: johnmac
 * Date: 11/28/16
 * Time: 4:34 PM
 */
class ELeadLightboxModal {

	const PREFIX = 'elead-lightbox-modal';
	static $modaln = 0;
	private $id = '';
	private $header = '';
	private $body = '';
	private $footer = '';

	/**
	 * ELeadLightboxModal constructor.
	 *
	 * @param $content
	 */
	function __construct( $content ) {
		self::$modaln ++;
		$this->id = sprintf( '%s-%d', self::PREFIX, self::$modaln );
		if ( $content ) {
			$this->body = $content;
		}
	}

	/**
	 * @param $html
	 */
	function set_header( $html ) {
		$this->header = $html;
	}

	/**
	 * @param $html
	 */
	function set_body( $html ) {
		$this->body = $html;
	}

	/**
	 * @param $html
	 */
	function set_footer( $html ) {
		$this->footer = $html;
	}

	/**
	 * @return string
	 */
	function get_html() {
		if ( ! $this->body ) {
			return '';
		}

		$html = "  <!-- Modal eLead -->\n";
		$html .= sprintf( '  <div id="%s" class="%s" aria-hidden="true">' . "\n", $this->id, self::PREFIX );
		$html .= sprintf( '    <div class="%s__wrapper">' . "\n", self::PREFIX );
		$html .= sprintf( '      <div class="%s__lightbox">' . "\n", self::PREFIX );
		$html .= sprintf( '        <a class="%s__close" href="#%s" aria-hidden="true">&times;</a>' . "\n", self::PREFIX, self::PREFIX );
		$html .= sprintf( '        <div class="%s__body">' . "\n", self::PREFIX );
		$html .= sprintf( "           %s\n", $this->body );
		$html .= sprintf( "        </div>\n" );
		$html .= sprintf( "      </div>\n" );
		$html .= sprintf( "    </div>\n" );
		$html .= sprintf( "  </div>\n" );

		return $html;
	}

}
