(function ($) {
    'use strict';

    var geocode = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

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

    function systemSize(dailyKiloWattHrs) {
        const hrsSun = 5;
        const kWsolar = 1150;
        return Number(Math.round(kWsolar * (dailyKiloWattHrs / hrsSun) / 100) / 10).toFixed(1);
    }

    function titleCase(str) {
        if ('string' !== typeof str || !str.trim()) return '';
        return str
            .trim()
            .toLowerCase()
            .split(' ')
            .map(function (word) {
                return word[0].toUpperCase() + word.substr(1);
            })
            .join(' ');
    }

    function getCity(zipcode, results) {
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

    function displayQuoteModal(zipcode, city, $modal) {
        var $form = $modal.find('.elead-lightbox-quote-form');
        if ($form.length) {
            var $city = $form.find('.elead-lightbox-quote-form__city');
            var $cityinput = $form.find('input[name="city"]');
            if ($city.length) {
                $city.text(city);
                if ($cityinput.length) {
                    $cityinput.val(city);
                }
            }
            var $zipinput = $form.find('input[name="zip"]');
            if ($zipinput.length) {
                $zipinput.val(zipcode);
            }
            $modal.css('display', 'table');
            updateDb($form, 'view');
        }
    }

    function clearError($errors) {
        $errors.each(function () {
            $(this).html('');
            $(this).removeAttr('style');
        });
    }

    function displayError($error, message) {
        $error.text(message);
        $error.css({display: 'block', opacity: '1'});
    }

    function processZipCta($form, $modal) {
        var $input = $form.find('.elead-lightbox-quote-cta__input');
        var $error = $form.find('.elead-lightbox-quote-cta__error');
        clearError($error);

        var entry = $input.length ? $input.val() : '';
        if (!entry) {
            displayError($error, 'Please enter a valid zip code');
            return;
        }
        var match = /([0-9]{5})/.exec(entry);
        if (!match) {
            displayError($error, 'Please enter a valid zip code');
            return;
        }
        var zipcode = match[1];
        var city = '';
        if (zipCity[zipcode]) {
            city = zipCity[zipcode];
            updateDb($form, 'submit');
            displayQuoteModal(zipcode, city, $modal);
            return;
        }
        if (!window.XMLHttpRequest) {
            displayError($error, 'Cannot retrieve location for that zip code');
            return;
        }
        var url = geocode + zipcode + '&sensor=true';
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status !== 200) {
                displayError($error, 'Cannot retrieve location for that zip code');
            } else {
                var json = JSON.parse(xhr.responseText);
                if (json.results) {
                    city = getCity(zipcode, json.results);
                    if (city) {
                        updateDb($form, 'submit');
                        displayQuoteModal(zipcode, city, $modal);
                    } else {
                        displayError($error, 'Please enter a valid zip code');
                    }
                } else {
                    displayError($error, 'Cannot retrieve location for that zip code');
                }
            }
        };
        xhr.onerror = function () {
            displayError($error, 'Cannot retrieve location for that zip code');
        };
        xhr.ontimeout = function () {
            displayError($error, 'Cannot retrieve location for that zip code');
        };
        xhr.open('GET', url);
        xhr.timeout = 2000;
        xhr.send(null);
    }

    function handleQuoteCta() {
        var $cta = $('.elead-lightbox-quote-cta__button');
        var $error = $('.elead-lightbox-quote-cta__error');
        if ($cta.length) {
            $cta.on('click', function (e) {
                var $form = $(this).closest('form');
                var $modal = $form.next('.elead-lightbox-modal');
                if ($form.length && $modal.length) {
                    processZipCta($form, $modal);
                }
            });
        }

        var $input = $('.elead-lightbox-quote-cta__input');
        if ($input.length) {
            $input.on('keypress', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var $form = $(this).closest('form');
                    var $modal = $form.next('.elead-lightbox-modal');
                    if ($form.length && $modal.length) {
                        processZipCta($form, $modal);
                    }
                }
            });
            $input.on('focus', function () {
                clearError($error);
            });
        }

        var $modal = $('.elead-lightbox-modal');
        if ($modal.length) {
            $modal.find('.elead-lightbox-modal__close').on('click', function (e) {
                var $thisModal = $(this).closest('.elead-lightbox-modal');
                $thisModal.css('display', 'none');
                var $spinner = $thisModal.find('.fa-spinner');
                if ($spinner.length) $spinner.removeClass('fa-spinner');
                var $hideafter = $thisModal.find('.hideafter');
                if ($hideafter.length) $hideafter.removeClass('hideafter');
            });
        }
    }

    function displayCalculatorModal(value, $modal) {
        var $form = $modal.find('.elead-lightbox-cal-form');
        if ($form.length) {
            var $size = $form.find('.elead-lightbox-cal-form__systemsize');
            $size.text(value + ' kW');
            var $fillme = $form.find('input[name="dailyavekwh"]');
            if ($fillme.length) {
                $fillme.val(value);
            }
            $modal.css('display', 'table');
            updateDb($form, 'view');
        }
    }

    function processCalculatorCta($form, $modal) {
        var $input = $form.find('.elead-lightbox-cal-cta__input');
        var $error = $form.find('.elead-lightbox-cal-cta__error');
        clearError($error);

        var entry = $input.length ? $input.val().trim() : '';
        if (!entry) {
            displayError($error, 'Please enter a valid value.');
            return;
        }
        var match = /^([0-9]*\.?[0-9]+)/.exec(entry);
        if (!match) {
            displayError($error, 'Please enter a valid value.');
            return;
        }
        var value = systemSize(match[1]);
        updateDb($form, 'submit');
        displayCalculatorModal(value, $modal);
    }

    function handleCalculatorCta() {
        var $cta = $('.elead-lightbox-cal-cta__button');
        var $error = $('.elead-lightbox-cal-cta__error');
        if ($cta.length) {
            $cta.on('click', function (e) {
                var $form = $(this).closest('form');
                var $modal = $form.next('.elead-lightbox-modal');
                if ($form.length && $modal.length) {
                    processCalculatorCta($form, $modal);
                }
            });
        }

        var $input = $('.elead-lightbox-cal-cta__input');
        if ($input.length) {
            $input.on('keypress', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var $form = $(this).closest('form');
                    var $modal = $form.next('.elead-lightbox-modal');
                    if ($form.length && $modal.length) {
                        processCalculatorCta($form, $modal);
                    }
                }
            });
            $input.on('focus', function (e) {
                clearError($error);
            });
        }

        var $modal = $('.elead-lightbox-modal');
        if ($modal.length) {
            $modal.find('.elead-lightbox-modal__close').on('click', function (e) {
                var $m = $(this).closest('.elead-lightbox-modal');
                $m.css('display', 'none');
                var $spinner = $m.find('.fa-spinner');
                if ($spinner.length) $spinner.removeClass('fa-spinner');
                var $hideafter = $m.find('.hideafter');
                if ($hideafter.length) $hideafter.removeClass('hideafter');
                $('.elead-lightbox-cal-form__target').off('load');
                $('.elead-lightbox-cal-form').css({display: 'block'});
                $('.elead-lightbox-cal-form-response').css({display: 'none', position: 'absolute'});
                $('.elead-lightbox-quote-form__target').off('load');
                $('.elead-lightbox-quote-form').css({display: 'block'});
                $('.elead-lightbox-quote-form-response').css({display: 'none', position: 'absolute'});
            });
        }
    }

    function handleQuoteForm() {
        var validators = [];
        $('.elead-lightbox-quote-form').each(function (i) {
                var $form = $(this);
                var $iframe = $form.parent().find('.elead-lightbox-quote-form__target');
                var $response = $form.parent().find('.elead-lightbox-quote-form-response');
                validators[i] = new FormValidator(this.id, [
                    {name: 'firstname', display: 'first name', rules: 'required'},
                    {name: 'lastname', display: 'last name', rules: 'required'},
                    {name: 'email', display: 'email', rules: 'valid_email'},
                    {name: 'phone1', display: 'phone number', rules: 'required|callback_valid_phone'},
                    {name: 'zip', display: 'Quote Code', rules: 'required|callback_valid_zipcode'}
                ], function (errors, event) {
                    for (var n = 0; n < errors.length; n++) {
                        var name = errors[n].name;
                        var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                        displayError($errorBox, errors[n].message);
                    }
                });
                validators[i].registerCallback('valid_zipcode', function (value) {
                    return /^\d{5}$/.test(value.trim());
                });
                validators[i].registerCallback('valid_phone', function (value) {
                    return /^[(]?\d{3}[ ]*[-)]?[ ]*\d{3}[ ]*[\-]?[ ]*\d{4}/.test(value.trim());
                });
                validators[i].setMessage('required', 'Please provide %s.');
                validators[i].setMessage('valid_email', 'Please enter a valid email address.');
                validators[i].setMessage('valid_zipcode', 'Please enter a valid zip code.');
                validators[i].setMessage('valid_phone', 'Please enter a valid phone number.');
                $(this).submit(function (e) {
                    // form validated?
                    if (e.isDefaultPrevented()) return false;
                    // spinner
                    var $button = $form.find('.elead-lightbox-quote-form__submit button');
                    var $icon = $form.find('.elead-lightbox-quote-form__submit i');
                    if ($button.length && $icon.length) {
                        $icon.addClass('fa-spinner');
                        $button.addClass('hideafter');
                    }
                    // collect services checkboxes
                    var $components = $form.find('input[name="i360__Components__c"]');
                    var $interests = $form.find('input[name="i360__Interests__c"]');
                    var $services = $form.find('input:checkbox:checked');
                    if ($services.length) {
                        var services = '';
                        $services.each(function () {
                            services += $(this).val() + ' ';
                        });
                        services = titleCase(services);
                        if ($components.length) {
                            $components.val(services);
                        }
                        if ($interests.length) {
                            $interests.val(services);
                        }
                        $services.removeAttr('checked');
                    }
                    // response handler
                    $iframe.on('load', function (e) {
                        if ($icon.length && $button.length) {
                            $icon.removeClass('fa-spinner');
                            $button.removeClass('hideafter');
                        }
                        $form.css({display: 'none'});
                        $response.css({
                            display: 'block',
                            position: 'relative'
                        });
                    });
                });
            }
        );
        $('.elead-lightbox-quote-form__input > input ').on('focus', function (e) {
            clearError($(this).siblings());
        });
    }

    function handleCalculatorForm() {
        // eLeadLightbox must be created by wp_localize_script
        if (typeof eLeadLightbox === 'undefined' || !(eLeadLightbox instanceof Object )) return;
        var mailer_url = eLeadLightbox.mailer_url;
        if (!mailer_url) return;

        var validators = [];
        $('.elead-lightbox-cal-form').each(function (i) {
            var $form = $(this);
            var $response = $form.parent().find('.elead-lightbox-cal-form-response');
            var $emailSpan = $form.parent().find('.elead-lightbox-cal-form-response__email');
            var $iframe = $form.parent().find('.elead-lightbox-cal-form__target');
            validators[i] = new FormValidator(this.id, [
                {name: 'firstname', display: 'first name', rules: 'required'},
                {name: 'lastname', display: 'last name', rules: ''},
                {name: 'email', display: 'email', rules: 'required|valid_email'},
                {name: 'phone1', display: 'phone', rules: 'required|callback_valid_phone'},
                {name: 'dailyavekwh', display: 'daily average kWh', rules: 'required|callback_valid_decimal'},
                {name: 'zip', display: 'Quote Code', rules: 'callback_valid_zipcode'}
            ], function (errors, event) {
                for (var n = 0; n < errors.length; n++) {
                    var name = errors[n].name;
                    var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                    displayError($errorBox, errors[n].message);
                    // $errorBox.text(errors[n].message);
                }
            });
            validators[i].registerCallback('valid_zipcode', function (value) {
                return /^\d{5}$/.test(value.trim());
            });
            validators[i].registerCallback('valid_phone', function (value) {
                return /^[(]?\d{3}[ ]*[-)]?[ ]*\d{3}[ ]*[\-]?[ ]*\d{4}/.test(value.trim());
            });
            validators[i].setMessage('required', 'Please provide %s.');
            validators[i].setMessage('valid_email', 'Please enter a valid email address.');
            validators[i].setMessage('valid_zipcode', 'Please enter a valid zip code.');
            validators[i].setMessage('valid_phone', 'Please enter a valid phone number.');
            validators[i].setMessage('valid_decimal', 'Please enter a positive number.');
            // handle submit
            $(this).submit(function (e) {
                // form validated?
                if (e.isDefaultPrevented()) return false;
                // spinner
                var $button = $form.find('.elead-lightbox-cal-form__submit button');
                var $icon = $form.find('.elead-lightbox-cal-form__submit i');
                if ($button.length && $icon.length) {
                    $icon.addClass('fa-spinner');
                    $button.addClass('hideafter');
                }
                // send email
                var address = $form.find('input[name="email"]').val();
                $.ajax({
                    url: mailer_url,
                    method: 'POST',
                    data: $(this).serialize(),
                    dataType: 'json',
                    error: function (data) {
                    },
                    success: function (data) {
                    },
                    complete: function (data) {
                    }
                })
                    .done(function (data) {
                        $iframe.on('load', function (e) {
                            if ($button.length && $icon.length) {
                                $icon.removeClass('fa-spinner');
                                $button.removeClass('hideafter');
                            }
                            $form.css({display: 'none'});
                            $emailSpan.text(address);
                            $response.css({
                                display: 'block',
                                position: 'relative'
                            });
                        });

                    });
                // hold off on form submission until email is sent
                // e.preventDefault();
            });
        });
        $('.elead-lightbox-cal-form__input > input ').on('focus', function (e) {
            clearError($(this).siblings());
        });
    }

    function saveState() {
        var visitor_state = eLeadLightbox.state;
        console.log('Visitor State: ' + visitor_state);
        if (visitor_state) {
            sessionStorage.setItem('elead-lightbox', visitor_state);
        }
    }

    function setStore($form, value) {
        var form = document.location.pathname + '#' + $form.attr('id');
        var store = sessionStorage.getItem('elead-lightbox');
        console.log('sessionStorage: ' + store);
        var data = JSON.parse(store);
        console.dir(data);
        if (!data) {
            data = {};
        }
        data[form] = value;
        sessionStorage.setItem('elead-lightbox', JSON.stringify(data));
    }

    function getStore($form) {
        var form = document.location.pathname + '#' + $form.attr('id');
        var data = JSON.parse(sessionStorage.getItem('elead-lightbox'));
        if (!data) return null;
        if (!data[form]) return null;
        return data[form];
    }

    function updateDb($form, action) {

        // done this before?
        var level = 0;
        switch (action) {
            case 'view':
                level = 1;
                break;
            case 'focus':
                level = 2;
                break;
            case 'submit':
                level = 3;
        }
        var status = getStore($form) || 0;
        if (status >= level) return;

        // nope - proceed with update
        setStore($form, level);
        var route = document.location.pathname;
        var id = $form.attr('id') || '';
        var cls = $form.attr('class') || '';
        var cta = '';
        var target = '';
        var $modal = undefined;
        var parentClass = $form.parent().attr('class');
        if (parentClass && parentClass.search(/elead-lightbox-modal/) > -1) {
            $modal = $form.closest('.elead-lightbox-modal');
            if ($modal.length) {
                cta = $modal.prev('form').attr('id') || '';
            }
        }
        if (cls.search(/-cta/)) {
            $modal = $form.next('.elead-lightbox-modal');
            if ($modal.length) {
                target = $modal.find('form').attr('id');
            }
        }
        // session store
        var sessionData = sessionStorage.getItem('elead-lightbox');
        // ajax to store view in db
        $.ajax({
            url: eLeadLightbox.analyzer_url,
            method: 'POST',
            data: {
                action: action,
                class: cls,
                cta: cta,
                formid: id,
                ip: eLeadLightbox.ip,
                route: route,
                state: sessionData,
                target: target,
                wppath: eLeadLightbox.wp_path
            }
        });
    }

    // determine if the site visitor is worth gathering analytics
    function maybeEnableAnalytics() {
        if (eLeadLightbox.is_guest) enableAnalytics();
        /**
         var endpoint = 'http://ipinfo.io/json';
         $.get(endpoint, function (response) {
         if (response.region === 'California') enableAnalytics();
         }, 'json');
         */
    }

    function enableAnalytics() {

        // eLeadLightbox must be created by wp_localize_script
        if (typeof eLeadLightbox === 'undefined' || !(eLeadLightbox instanceof Object )) return;

        // collect visible plugin forms
        var $forms = $('.elead-lightbox-quote-cta')
            .add('.elead-lightbox-cal-cta')
            .add('.elead-lightbox-quote-form')
            .add('.elead-lightbox-cal-form');
        var $visible = $forms
            .not('.elead-lightbox-modal .elead-lightbox-quote-form')
            .not('.elead-lightbox-modal .elead-lightbox-cal-form');

        // view
        $visible.each(function () {
            var element = this;
            var $form = $(this);
            var waypoint = new Waypoint({
                element: element,
                handler: function () {
                    updateDb($form, 'view');
                },
                offset: '60%',
                continuous: true
            });
        });

        // focus
        $forms.each(function () {
            var $form = $(this);
            $(this).find('input[type="text"]')
                .on('focus', function () {
                    updateDb($form, 'focus');
                });
        });

        // submit -- no such event for CTA forms!
        $forms.each(function () {
            $(this).on('submit', function (e) {
                // form validated?
                if (e.isDefaultPrevented()) return false;
                // OK
                var $form = $(this);
                updateDb($form, 'submit');
            });
        });
    }

    $(function () {
        if (typeof eLeadLightbox !== 'undefined') {
            saveState();
            handleQuoteCta();
            handleQuoteForm();
            handleCalculatorCta();
            handleCalculatorForm();
            maybeEnableAnalytics();
        }
    });

})(jQuery);
