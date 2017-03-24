<?php

/**
 * Fired during plugin activation
 *
 * @package    elead-lightbox
 * @subpackage elead-lightbox/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    elead-lightbox
 * @subpackage elead-lightbox/includes
 * @author     John Farrell MacDonald <john@jfmacdonald.com>
 */
class ELeadLightboxActivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {

		global $wpdb;
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		// Collation
		$charset_collate = $wpdb->get_charset_collate();

		// Forms DB table
		$form_table = $wpdb->prefix . 'eleadlbox_forms';
		$form_sql   = <<<FORM_TABLE
CREATE TABLE $form_table (
	digest char(32) NOT NULL,
	route  char(64) NOT NULL,
	formid char(64) NOT NULL,
	class  char(64),
	modal  tinyint DEFAULT 0,
	PRIMARY KEY  (digest)
) $charset_collate;
FORM_TABLE;
		dbDelta( $form_sql );

		// Activity DB table
		$act_table = $wpdb->prefix . 'eleadlbox_activity';
		$act_sql   = <<<ACTIVITY_TABLE
CREATE TABLE $act_table (
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

		add_option( 'elead_lightbox_db_version', '1.0' );
	}

}
