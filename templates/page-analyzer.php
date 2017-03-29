<?php
/**
 * Created by PhpStorm.
 * User: johnmac
 * Date: 3/26/17
 * Time: 8:02 PM
 */

defined( 'ABSPATH' ) or die( 'Must be included in WordPress.' );
is_object( $analyzer ) or die( 'No analyzer.' );
$forms     = $analyzer->get_visible_forms();
$allforms  = $analyzer->get_all_forms();
$week_ends = $analyzer->get_week_end_dates();
$headings  = array_merge(
	array( 'Page', 'Form' ),
	$week_ends,
	array( 'All Time' )
);
?>

<div class="wrap">
    <h1><?php echo 'eLead Lightbox Activity Analyzer'; ?> </h1>
    <div>
		<?php if ( ! count( $forms ) ): ?>
            <h2>No eLead-Lightbox forms.</h2>
		<?php else: ?>

            <h2 class="elead-lightbox-report__heading">Conversion Rates</h2>
            <p class="elead-lightbox-report__note">Weekly
                <em>conversion-rate (of impressions)</em> shown by
                week-ending date.</p>
            <table class="elead-lightbox-report__table">
                <thead>
				<?php foreach ( $headings as $heading ): ?>
                    <th><?php echo $heading; ?></th>
				<?php endforeach; ?>
                </thead>
                <tbody>
				<?php foreach ( $forms as $form ) : ?>
                    <tr>
                        <td>
							<?php echo $analyzer->get_form_route( $form ); ?>
                        </td>
                        <td>
							<?php echo $analyzer->get_form_description( $form ); ?>
                        </td>
						<?php for ( $week = 0; $week < count( $week_ends ); $week ++ ): ?>
                            <td> <?php
								echo $analyzer->get_form_conversion( $form,
									$week ); ?>
                            </td>
						<?php endfor; ?>
                        <td>
							<?php echo $analyzer->get_form_conversion( $form ); ?>
                        </td>
                    </tr>
				<?php endforeach; ?>
                </tbody>
            </table>

            <h2 class="elead-lightbox-report__heading">Form Activity</h2>
            <p class="elead-lightbox-report__note">Weekly
                <em>impressions-focus-events-submissions</em> shown by
                week-ending date.</p>
            <table class="elead-lightbox-report__table">
                <thead>
				<?php foreach ( $headings as $heading ): ?>
                    <th><?php echo $heading; ?></th>
				<?php endforeach; ?>
                </thead>
                <tbody>
				<?php foreach ( $allforms as $form ) : ?>
                    <tr>
                        <td>
							<?php echo $analyzer->get_form_route( $form ); ?>
                        </td>
                        <td>
							<?php echo $analyzer->get_form_description( $form ); ?>
                        </td>
						<?php for ( $week = 0; $week < count( $week_ends ); $week ++ ): ?>
                            <td> <?php echo $analyzer->get_form_activity( $form,
									$week ); ?>
                            </td>
						<?php endfor; ?>
                        <td>
							<?php echo $analyzer->get_form_activity( $form ); ?>
                        </td>
                    </tr>
				<?php endforeach; ?>
                </tbody>
            </table>

		<?php endif; // if !count(forms) ?>

    </div>
</div>

