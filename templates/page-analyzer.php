<?php
/**
 * Created by PhpStorm.
 * User: johnmac
 * Date: 3/26/17
 * Time: 8:02 PM
 */

defined( 'ABSPATH' ) or die( 'Must be included in WordPress.' );

// db queries
global $wpdb;
$activity_table        = $wpdb->prefix . 'eleadlightbox_activity';
$forms_table           = $wpdb->prefix . 'eleadlightbox_forms';
$activity_table_exists = $wpdb->get_var( "SHOW TABLES LIKE '$activity_table'" ) == $activity_table;
$forms_table_exists    = $wpdb->get_var( "SHOW TABLES LIKE '$forms_table'" ) == $forms_table;
$digest_query          = "SELECT digest FROM $forms_table ORDER BY formid";

$textdomain = 'elead-lightbox-locale';

$form_type = array(
	'elead-lightbox-quote-cta'  => 'Zip Code Quote CTA',
	'elead-lightbox-quote-form' => 'Zip Code Quote Form',
	'elead-lightbox-cal-cta'    => 'Calculator Quote CTA',
	'elead-lightbox-cal-form'   => 'Calculator Quote Form'
)

?>

<div class="wrap">
    <h1 class="elead-lightbox-page__title"><?php _e( 'eLead Lightbox Activity Analyzer',
			$textdomain ); ?> </h1>
    <div>
		<?php
		if ( $forms_table_exists ) {
			$digests = $wpdb->get_col( $digest_query );
			echo '<h2>Forms</h2>' . PHP_EOL;
			echo '<table>' . PHP_EOL;
			echo '<thead>';
			echo '<th>Form ID</th>';
			echo '<th>Description</th>';
			echo '<th>Impressions</th>';
			echo '<th>Focus Events</th>';
			echo '<th>Submissions</th>';
			echo '</thead>';
			echo '<tbody>' . PHP_EOL;
			foreach ( $digests as $digest ) {
				$row      = $wpdb->get_row( $wpdb->prepare(
					"SELECT * FROM $forms_table WHERE digest = %s",
					$digest ) );
				$form     = "{$row->route}#{$row->formid}";
				$type     = $form_type[ $row->class ];
				$modal    = $row->cta ? '(modal)' : '';
				$n_view   = $wpdb->get_var( "SELECT sum(view) FROM $activity_table WHERE digest = '$digest'" );
				$n_focus  = $wpdb->get_var( "SELECT sum(focus) FROM $activity_table WHERE digest = '$digest'" );
				$n_submit = $wpdb->get_var( "SELECT sum(submit) FROM $activity_table WHERE digest = '$digest'" );
				echo '<tr>';
				echo "<td>{$row->route}#{$row->formid}</td>";
				echo "<td>{$type} {$modal}</td>";
				echo "<td>{$n_view}</td>";
				echo "<td>{$n_focus}</td>";
				echo "<td>{$n_submit}</td>";
				echo '</tr>';
			}
			echo '</body>' . PHP_EOL;
			echo '</table>' . PHP_EOL;

		} else {
			_e( 'No eLead Lightbox forms found.', $textdomain );
		} // end if forms_table_exists
		?>
    </div>
</div>

