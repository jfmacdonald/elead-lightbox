<?php

define( '__ROOT__', dirname( __FILE__ ) );
require_once( __ROOT__ . '/includes/ELeadLightboxCTA.php' );
require_once( __ROOT__ . '/includes/ELeadLightboxForm.php' );
require_once( __ROOT__ . '/includes/ELeadLightboxModal.php' );

$form = new ELeadLightboxForm();
foreach ( array( 'Solar', 'Roofing', 'Tunnel Digging' ) as $service ) {
	$form->set_service( $service );
}
$form->set_service_header( 'I am interested in the following services.' );
$cta  = new ELeadLightboxCTA($form);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sandbox</title>
    <link rel="stylesheet" href="public/css/elead-lightbox-public.css">
</head>
<body>

<?php echo $cta->get_html(); ?>


<?php echo $form->get_html(); ?>


<!--
<form class="elead-lightbox-cta" action="">
    <fieldset class="elead-lightbox-cta__fieldset">
        <input class="elead-lightbox-cta__input" type="text" placeholder="Zipcode" pattern="[0-9]{5}" title="Zipcode" minlength="5" required>
        <button class="elead-lightbox-cta__button" type="button" name="button">Free Quote</button>
    </fieldset>
</form>
-->

<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
<script src="public/js/elead-lightbox-public.js"></script>
</body>
</html>