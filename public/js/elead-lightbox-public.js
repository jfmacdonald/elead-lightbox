(function ($) {
    'use strict';

    var ctaEntry = 'zipcode';

    $(function () {
        var $cta = $('.elead-lightbox-cta__button');
        if ($cta.length) {
            $cta.on('click', function (e) {
                var $input = $(this).siblings('input');
                var $form = $(this).closest('form');
                var id = $form.prop('id');
                console.log("clicked on "+id);
                var $modal = $form.next('.elead-lightbox-modal');
                if ( $modal.length ) {
                    console.log('found modal');
                    $modal.css('display', 'table');
                    var entry = $input.length ? $input.val() : '';
                    var $fillme = $form.find('input[name="'+ctaEntry+'"]');
                    if ( entry && $fillme.length ) {
                        $fillme.val(entry);
                    }
                }
            });
        }

        var $modal = $('.elead-lightbox-modal');
        if ( $modal.length ) {
            $modal.find('.elead-lightbox-modal__close').on('click', function (e) {
                $(this).closest('.elead-lightbox-modal').css('display', 'none');
            });
        }

    });

})(jQuery);
