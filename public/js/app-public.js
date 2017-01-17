(function ($) {
    'use strict';

    var ctaEntry = 'zipcode';
    var geocode = 'http://maps.googleapis.com/maps/api/geocode/json?address=';

    var zipCity = {
        91901: 'Alpine',
        91902: 'Bonita',
        91903: 'Alpine',
        91905: 'Boulevard',
        91906: 'Campo',
        91908: 'Bonita',
        91909: 'Chula Vista',
        91910: 'Chula Vista',
        91911: 'Chula Vista',
        91912: 'Chula Vista',
        91913: 'Chula Vista',
        91914: 'Chula Vista',
        91915: 'Chula Vista',
        91916: 'Descanso',
        91917: 'Dulzura',
        91921: 'Chula Vista',
        91931: 'Guatay',
        91932: 'Imperial Beach',
        91933: 'Imperial Beach',
        91934: 'Jacumba',
        91935: 'Jamul',
        91941: 'La Mesa',
        91942: 'La Mesa',
        91943: 'La Mesa',
        91944: 'La Mesa',
        91945: 'Lemon Grove',
        91946: 'Lemon Grove',
        91948: 'Mount Laguna',
        91950: 'National City',
        91951: 'National City',
        91962: 'Pine Valley',
        91963: 'Potrero',
        91976: 'Spring Valley',
        91977: 'Spring Valley',
        91978: 'Spring Valley',
        91979: 'Spring Valley',
        91980: 'Tecate',
        91987: 'Tecate',
        92003: 'Bonsall',
        92004: 'Borrego Springs',
        92007: 'Cardiff By The Sea',
        92008: 'Carlsbad',
        92009: 'Carlsbad',
        92010: 'Carlsbad',
        92011: 'Carlsbad',
        92013: 'Carlsbad',
        92014: 'Del Mar',
        92018: 'Carlsbad',
        92019: 'El Cajon',
        92020: 'El Cajon',
        92021: 'El Cajon',
        92022: 'El Cajon',
        92023: 'Encinitas',
        92024: 'Encinitas',
        92025: 'Escondido',
        92026: 'Escondido',
        92027: 'Escondido',
        92028: 'Fallbrook',
        92029: 'Escondido',
        92030: 'Escondido',
        92033: 'Escondido',
        92036: 'Julian',
        92037: 'La Jolla',
        92038: 'La Jolla',
        92039: 'La Jolla',
        92040: 'Lakeside',
        92046: 'Escondido',
        92049: 'Oceanside',
        92051: 'Oceanside',
        92052: 'Oceanside',
        92054: 'Oceanside',
        92055: 'Camp Pendleton',
        92056: 'Oceanside',
        92057: 'Oceanside',
        92058: 'Oceanside',
        92059: 'Pala',
        92060: 'Palomar Mountain',
        92061: 'Pauma Valley',
        92064: 'Poway',
        92065: 'Ramona',
        92066: 'Ranchita',
        92067: 'Rancho Santa Fe',
        92068: 'San Luis Rey',
        92069: 'San Marcos',
        92070: 'Santa Ysabel',
        92071: 'Santee',
        92072: 'Santee',
        92074: 'Poway',
        92075: 'Solana Beach',
        92078: 'San Marcos',
        92079: 'San Marcos',
        92081: 'Vista',
        92082: 'Valley Center',
        92083: 'Vista',
        92084: 'Vista',
        92085: 'Vista',
        92086: 'Warner Springs',
        92088: 'Fallbrook',
        92091: 'Rancho Santa Fe',
        92092: 'La Jolla',
        92093: 'La Jolla',
        92096: 'San Marcos',
        92101: 'Downtown San Diego',
        92102: 'San Diego',
        92103: 'Hillcrest',
        92104: 'North Park',
        92105: 'East San Diego',
        92106: 'Point Loma',
        92107: 'Ocean Beach',
        92108: 'Mission Valley',
        92109: 'Pacific Beach',
        92110: 'Morena',
        92111: 'Linda Vista',
        92112: 'San Diego',
        92113: 'Logan Heights',
        92114: 'Encanto',
        92115: 'College Grove',
        92116: 'Normal Heights',
        92117: 'Clarimont',
        92118: 'Coronado',
        92119: 'Navajo',
        92120: 'Grantville',
        92121: 'Sorrento',
        92122: 'University City',
        92123: 'Mission Village',
        92124: 'Tierrasanta',
        92126: 'Mira Mesa',
        92127: 'Rancho Bernardo',
        92128: 'Rancho Bernardo',
        92129: 'Rancho Penasquitos',
        92130: 'Carmel Valley',
        92131: 'Scripps Ranch',
        92132: 'San Diego',
        92134: 'San Diego',
        92135: 'San Diego',
        92136: 'San Diego',
        92137: 'Midway',
        92138: 'Midway',
        92139: 'Paradise Hills',
        92140: 'San Diego',
        92142: 'Tierrasanta',
        92143: 'San Ysidro',
        92145: 'San Diego',
        92147: 'San Diego',
        92149: 'Paradise Hills',
        92150: 'Downtown San Diego',
        92152: 'San Diego',
        92153: 'Otay Mesa',
        92154: 'San Diego',
        92155: 'San Diego',
        92158: 'San Diego',
        92159: 'Navajo',
        92160: 'Grantville',
        92161: 'San Diego',
        92162: 'Golden Hill',
        92163: 'Hillcrest',
        92165: 'North Park',
        92166: 'Point Loma',
        92167: 'Ocean Beach',
        92168: 'Mission Valley',
        92169: 'Pacific Beach',
        92170: 'Southeastern San Diego',
        92171: 'Linda Vista',
        92172: 'Rancho Penasquitos',
        92173: 'San Ysidro',
        92174: 'Encanto',
        92175: 'San Diego',
        92176: 'Normal Heights',
        92177: 'Clairemont',
        92178: 'Coronado',
        92179: 'San Diego',
        92182: 'San Diego State University',
        92186: 'Loma Portal',
        92187: 'San Diego',
        92190: 'Grantville',
        92191: 'Sorrento Valley',
        92192: 'University City',
        92193: 'Serra Mesa',
        92194: 'Serra Mesa',
        92195: 'Rolando',
        92196: 'Mira Mesa',
        92197: 'Rancho Bernardo',
        92198: 'Rancho Bernardo',
        92199: 'Rancho Bernardo'
    };


    function fill_modal(zipcode, city, $modal) {
        var $form = $modal.find('.elead-lightbox-form');
        var $header = $modal.find('.elead-lightbox-modal__header');
        if ($form.length) {
            if ($header.length) {
                $header.html('<p>Get a free quote for solar in <strong>' + city + '</strong>.</p>');
            }
            var $fillme = $form.find('input[name="' + ctaEntry + '"]');
            if ($fillme.length) {
                $fillme.val(zipcode);
            }

        }
        $modal.css('display', 'table');
    }

    function invalid_zipcode($error) {
        $error.html('<p>Please enter a valid zip code.</p>');
    }

    function unsupported_browser($error) {
        cannot_get_zip($error);
        // $error.html('<p>Browser does not support pop-up form. Please call for quote.</p>');
    }

    function cannot_get_zip($error) {
        $error.html('<p>Could not locate that zip code!</p>');
    }

    function get_city_from_json(zipcode, results) {
        var city = '';
        var i, j, component;
        if (results && Array.isArray(results)) {
            for (i = 0; i < results.length; i++) {
                if (!results[i]['address_components']) continue;
                if (!Array.isArray(results[i]['address_components'])) continue;
                var address_components = results[i]['address_components'];
                var postal_code = '';
                var locality = '';
                for (j = 0; j < address_components.length; j++) {
                    component = address_components[j];
                    if (component.types.indexOf('postal_code') > -1) {
                        postal_code = component['long_name'];
                    }
                    if (component.types.indexOf('locality') > -1) {
                        locality = component['long_name'];
                    }
                }
                if (locality && postal_code === zipcode) {
                    city = locality;
                    break;
                }
            }
        }
        return city;
    }

    function process_cta($cta, $modal) {
        var $input = $cta.find('.elead-lightbox-cta__input');
        var $error = $cta.find('.elead-lightbox-cta__error');
        $error.html('');

        var entry = $input.length ? $input.val() : '';
        if (!entry) {
            invalid_zipcode($error);
            return;
        }
        var match = /([0-9]{5})/.exec(entry);
        if (!match) {
            invalid_zipcode($error);
            return;
        }
        var zipcode = match[1];
        var city = '';
        if (zipCity[zipcode]) {
            city = zipCity[zipcode];
            fill_modal(zipcode, city, $modal);
            return;
        }
        if (!window.XMLHttpRequest) {
            unsupported_browser($error);
            return;
        }
        var url = geocode + zipcode + '&sensor=true';
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status !== 200) {
                cannot_get_zip($error);
            } else {
                var json = JSON.parse(xhr.responseText);
                if (json.results) {
                    city = get_city_from_json(zipcode, json.results);
                    if (city) {
                        fill_modal(zipcode, city, $modal);
                    } else {
                        invalid_zipcode($error);
                    }
                } else {
                    cannot_get_zip($error);
                }
            }
        };
        xhr.onerror = function () {
            invalid_zipcode($error);
        };
        xhr.ontimeout = function () {
            cannot_get_zip($error);
        };
        xhr.open('GET', url);
        xhr.timeout = 2000;
        xhr.send(null);
    }

    function handle_cta($) {
        var $cta = $('.elead-lightbox-cta__button');
        if ($cta.length) {
            $cta.on('click', function (e) {
                var $form = $(this).closest('form');
                var $modal = $form.next('.elead-lightbox-modal');
                if ($form.length && $modal.length) {
                    process_cta($form, $modal);
                }
            });
        }

        var $zipbox = $('.elead-lightbox-cta__input');
        if ($zipbox.length) {
            $zipbox.on('keypress', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var $form = $(this).closest('form');
                    var $modal = $form.next('.elead-lightbox-modal');
                    if ($form.length && $modal.length) {
                        process_cta($form, $modal);
                    }
                }
            });
            $zipbox.on('focus', function(e) {
               $('.elead-lightbox-cta__error').text('');
            });
        }


        var $modal = $('.elead-lightbox-modal');
        if ($modal.length) {
            $modal.find('.elead-lightbox-modal__close').on('click', function (e) {
                $(this).closest('.elead-lightbox-modal').css('display', 'none');
            });
        }
    }

    function handle_form($) {
        var validators = [];
        $('.elead-lightbox-form').each(function (i) {
            var $form = $(this);
            validators[i] = new FormValidator(this.id, [
                {name: 'firstname', display: 'first name', rules: 'required'},
                {name: 'lastname', display: 'last name', rules: 'required'},
                {name: 'email', display: 'email', rules: 'valid_email'},
                {name: 'phonenumber', display: 'phone number', rules: 'required|callback_valid_phone'},
                {name: 'zipcode', display: 'Zip Code', rules: 'required|callback_valid_zipcode'}
            ], function (errors, event) {
                for (var n = 0; n < errors.length; n++) {
                    var name = errors[n].name;
                    var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                    $errorBox.text(errors[n].message);
                }
            });
            validators[i].registerCallback('valid_zipcode', function (value) {
                return /^\d{5}$/.test(value.trim());
            });
            validators[i].registerCallback('valid_phone', function (value) {
                return /^[(]?\d{3}[ ]*[-)]?[ ]*\d{3}[ ]*[\-]?[ ]*\d{4}/.test(value.trim());
            });
            validators[i].setMessage('required', 'Please provide %s.');
            validators[i].setMessage('valid_email', 'Email is invalid.');
            validators[i].setMessage('valid_zipcode', 'Zip code is invalid.');
            validators[i].setMessage('valid_phone', 'Phone number is invalid.');
        });
        $('.elead-lightbox-form__input > input ').on('focus', function (e) {
           $(this).siblings().text('');
        });
    }

    $(function () {
        handle_cta($);
        handle_form($);
    });

})(jQuery);
