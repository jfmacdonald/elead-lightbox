'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * validate.js 1.4.1
 * Copyright (c) 2011 - 2014 Rick Harrison, http://rickharrison.me
 * validate.js is open sourced under the MIT license.
 * Portions of validate.js are inspired by CodeIgniter.
 * http://rickharrison.github.com/validate.js
 */

(function (window, document, undefined) {
    /*
     * If you would like an application-wide config, change these defaults.
     * Otherwise, use the setMessage() function to configure form specific messages.
     */

    var defaults = {
        messages: {
            required: 'The %s field is required.',
            matches: 'The %s field does not match the %s field.',
            "default": 'The %s field is still set to default, please change.',
            valid_email: 'The %s field must contain a valid email address.',
            valid_emails: 'The %s field must contain all valid email addresses.',
            min_length: 'The %s field must be at least %s characters in length.',
            max_length: 'The %s field must not exceed %s characters in length.',
            exact_length: 'The %s field must be exactly %s characters in length.',
            greater_than: 'The %s field must contain a number greater than %s.',
            less_than: 'The %s field must contain a number less than %s.',
            alpha: 'The %s field must only contain alphabetical characters.',
            alpha_numeric: 'The %s field must only contain alpha-numeric characters.',
            alpha_dash: 'The %s field must only contain alpha-numeric characters, underscores, and dashes.',
            numeric: 'The %s field must contain only numbers.',
            integer: 'The %s field must contain an integer.',
            decimal: 'The %s field must contain a decimal number.',
            is_natural: 'The %s field must contain only positive numbers.',
            is_natural_no_zero: 'The %s field must contain a number greater than zero.',
            valid_ip: 'The %s field must contain a valid IP.',
            valid_base64: 'The %s field must contain a base64 string.',
            valid_credit_card: 'The %s field must contain a valid credit card number.',
            is_file_type: 'The %s field must contain only %s files.',
            valid_url: 'The %s field must contain a valid URL.',
            greater_than_date: 'The %s field must contain a more recent date than %s.',
            less_than_date: 'The %s field must contain an older date than %s.',
            greater_than_or_equal_date: 'The %s field must contain a date that\'s at least as recent as %s.',
            less_than_or_equal_date: 'The %s field must contain a date that\'s %s or older.'
        },
        callback: function callback(errors) {}
    };

    /*
     * Define the regular expressions that will be used
     */

    var ruleRegex = /^(.+?)\[(.+)\]$/,
        numericRegex = /^[0-9]+$/,
        integerRegex = /^\-?[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        alphaRegex = /^[a-z]+$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        alphaDashRegex = /^[a-z0-9_\-]+$/i,
        naturalRegex = /^[0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        dateRegex = /\d{4}-\d{1,2}-\d{1,2}/;

    /*
     * The exposed public object to validate a form:
     *
     * @param formNameOrNode - String - The name attribute of the form (i.e. <form name="myForm"></form>) or node of the form element
     * @param fields - Array - [{
     *     name: The name of the element (i.e. <input name="myField" />)
     *     display: 'Field Name'
     *     rules: required|matches[password_confirm]
     * }]
     * @param callback - Function - The callback after validation has been performed.
     *     @argument errors - An array of validation errors
     *     @argument event - The javascript event
     */

    var FormValidator = function FormValidator(formNameOrNode, fields, callback) {
        this.callback = callback || defaults.callback;
        this.errors = [];
        this.fields = {};
        this.form = this._formByNameOrNode(formNameOrNode) || {};
        this.messages = {};
        this.handlers = {};
        this.conditionals = {};

        for (var i = 0, fieldLength = fields.length; i < fieldLength; i++) {
            var field = fields[i];

            // If passed in incorrectly, we need to skip the field.
            if (!field.name && !field.names || !field.rules) {
                continue;
            }

            /*
             * Build the master fields array that has all the information needed to validate
             */

            if (field.names) {
                for (var j = 0, fieldNamesLength = field.names.length; j < fieldNamesLength; j++) {
                    this._addField(field, field.names[j]);
                }
            } else {
                this._addField(field, field.name);
            }
        }

        /*
         * Attach an event callback for the form submission
         */

        var _onsubmit = this.form.onsubmit;

        this.form.onsubmit = function (that) {
            return function (evt) {
                try {
                    return that._validateForm(evt) && (_onsubmit === undefined || _onsubmit());
                } catch (e) {}
            };
        }(this);
    },
        attributeValue = function attributeValue(element, attributeName) {
        var i, elementLength;

        if (element.length > 0 && (element[0].type === 'radio' || element[0].type === 'checkbox')) {
            for (i = 0, elementLength = element.length; i < elementLength; i++) {
                if (element[i].checked) {
                    return element[i][attributeName];
                }
            }

            return;
        }

        return element[attributeName];
    };

    /*
     * @public
     * Sets a custom message for one of the rules
     */

    FormValidator.prototype.setMessage = function (rule, message) {
        this.messages[rule] = message;

        // return this for chaining
        return this;
    };

    /*
     * @public
     * Registers a callback for a custom rule (i.e. callback_username_check)
     */

    FormValidator.prototype.registerCallback = function (name, handler) {
        if (name && typeof name === 'string' && handler && typeof handler === 'function') {
            this.handlers[name] = handler;
        }

        // return this for chaining
        return this;
    };

    /*
     * @public
     * Registers a conditional for a custom 'depends' rule
     */

    FormValidator.prototype.registerConditional = function (name, conditional) {
        if (name && typeof name === 'string' && conditional && typeof conditional === 'function') {
            this.conditionals[name] = conditional;
        }

        // return this for chaining
        return this;
    };

    /*
     * @private
     * Determines if a form dom node was passed in or just a string representing the form name
     */

    FormValidator.prototype._formByNameOrNode = function (formNameOrNode) {
        return (typeof formNameOrNode === 'undefined' ? 'undefined' : _typeof(formNameOrNode)) === 'object' ? formNameOrNode : document.forms[formNameOrNode];
    };

    /*
     * @private
     * Adds a file to the master fields array
     */

    FormValidator.prototype._addField = function (field, nameValue) {
        this.fields[nameValue] = {
            name: nameValue,
            display: field.display || nameValue,
            rules: field.rules,
            depends: field.depends,
            id: null,
            element: null,
            type: null,
            value: null,
            checked: null
        };
    };

    /*
     * @private
     * Runs the validation when the form is submitted.
     */

    FormValidator.prototype._validateForm = function (evt) {
        this.errors = [];

        for (var key in this.fields) {
            if (this.fields.hasOwnProperty(key)) {
                var field = this.fields[key] || {},
                    element = this.form[field.name];

                if (element && element !== undefined) {
                    field.id = attributeValue(element, 'id');
                    field.element = element;
                    field.type = element.length > 0 ? element[0].type : element.type;
                    field.value = attributeValue(element, 'value');
                    field.checked = attributeValue(element, 'checked');

                    /*
                     * Run through the rules for each field.
                     * If the field has a depends conditional, only validate the field
                     * if it passes the custom function
                     */

                    if (field.depends && typeof field.depends === "function") {
                        if (field.depends.call(this, field)) {
                            this._validateField(field);
                        }
                    } else if (field.depends && typeof field.depends === "string" && this.conditionals[field.depends]) {
                        if (this.conditionals[field.depends].call(this, field)) {
                            this._validateField(field);
                        }
                    } else {
                        this._validateField(field);
                    }
                }
            }
        }

        if (typeof this.callback === 'function') {
            this.callback(this.errors, evt);
        }

        if (this.errors.length > 0) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            } else if (event) {
                // IE uses the global event variable
                event.returnValue = false;
            }
        }

        return true;
    };

    /*
     * @private
     * Looks at the fields value and evaluates it against the given rules
     */

    FormValidator.prototype._validateField = function (field) {
        var rules = field.rules.split('|'),
            indexOfRequired = field.rules.indexOf('required'),
            isEmpty = !field.value || field.value === '' || field.value === undefined;

        /*
         * Run through the rules and execute the validation methods as needed
         */

        for (var i = 0, ruleLength = rules.length; i < ruleLength; i++) {
            var method = rules[i],
                param = null,
                failed = false,
                parts = ruleRegex.exec(method);

            /*
             * If this field is not required and the value is empty, continue on to the next rule unless it's a callback.
             * This ensures that a callback will always be called but other rules will be skipped.
             */

            if (indexOfRequired === -1 && method.indexOf('!callback_') === -1 && isEmpty) {
                continue;
            }

            /*
             * If the rule has a parameter (i.e. matches[param]) split it out
             */

            if (parts) {
                method = parts[1];
                param = parts[2];
            }

            if (method.charAt(0) === '!') {
                method = method.substring(1, method.length);
            }

            /*
             * If the hook is defined, run it to find any validation errors
             */

            if (typeof this._hooks[method] === 'function') {
                if (!this._hooks[method].apply(this, [field, param])) {
                    failed = true;
                }
            } else if (method.substring(0, 9) === 'callback_') {
                // Custom method. Execute the handler if it was registered
                method = method.substring(9, method.length);

                if (typeof this.handlers[method] === 'function') {
                    if (this.handlers[method].apply(this, [field.value, param, field]) === false) {
                        failed = true;
                    }
                }
            }

            /*
             * If the hook failed, add a message to the errors array
             */

            if (failed) {
                // Make sure we have a message for this rule
                var source = this.messages[field.name + '.' + method] || this.messages[method] || defaults.messages[method],
                    message = 'An error has occurred with the ' + field.display + ' field.';

                if (source) {
                    message = source.replace('%s', field.display);

                    if (param) {
                        message = message.replace('%s', this.fields[param] ? this.fields[param].display : param);
                    }
                }

                this.errors.push({
                    id: field.id,
                    element: field.element,
                    name: field.name,
                    message: message,
                    rule: method
                });

                // Break out so as to not spam with validation errors (i.e. required and valid_email)
                break;
            }
        }
    };

    /**
     * private function _getValidDate: helper function to convert a string date to a Date object
     * @param date (String) must be in format yyyy-mm-dd or use keyword: today
     * @returns {Date} returns false if invalid
     */
    FormValidator.prototype._getValidDate = function (date) {
        if (!date.match('today') && !date.match(dateRegex)) {
            return false;
        }

        var validDate = new Date(),
            validDateArray;

        if (!date.match('today')) {
            validDateArray = date.split('-');
            validDate.setFullYear(validDateArray[0]);
            validDate.setMonth(validDateArray[1] - 1);
            validDate.setDate(validDateArray[2]);
        }
        return validDate;
    };

    /*
     * @private
     * Object containing all of the validation hooks
     */

    FormValidator.prototype._hooks = {
        required: function required(field) {
            var value = field.value;

            if (field.type === 'checkbox' || field.type === 'radio') {
                return field.checked === true;
            }

            return value !== null && value !== '';
        },

        "default": function _default(field, defaultName) {
            return field.value !== defaultName;
        },

        matches: function matches(field, matchName) {
            var el = this.form[matchName];

            if (el) {
                return field.value === el.value;
            }

            return false;
        },

        valid_email: function valid_email(field) {
            return emailRegex.test(field.value);
        },

        valid_emails: function valid_emails(field) {
            var result = field.value.split(/\s*,\s*/g);

            for (var i = 0, resultLength = result.length; i < resultLength; i++) {
                if (!emailRegex.test(result[i])) {
                    return false;
                }
            }

            return true;
        },

        min_length: function min_length(field, length) {
            if (!numericRegex.test(length)) {
                return false;
            }

            return field.value.length >= parseInt(length, 10);
        },

        max_length: function max_length(field, length) {
            if (!numericRegex.test(length)) {
                return false;
            }

            return field.value.length <= parseInt(length, 10);
        },

        exact_length: function exact_length(field, length) {
            if (!numericRegex.test(length)) {
                return false;
            }

            return field.value.length === parseInt(length, 10);
        },

        greater_than: function greater_than(field, param) {
            if (!decimalRegex.test(field.value)) {
                return false;
            }

            return parseFloat(field.value) > parseFloat(param);
        },

        less_than: function less_than(field, param) {
            if (!decimalRegex.test(field.value)) {
                return false;
            }

            return parseFloat(field.value) < parseFloat(param);
        },

        alpha: function alpha(field) {
            return alphaRegex.test(field.value);
        },

        alpha_numeric: function alpha_numeric(field) {
            return alphaNumericRegex.test(field.value);
        },

        alpha_dash: function alpha_dash(field) {
            return alphaDashRegex.test(field.value);
        },

        numeric: function numeric(field) {
            return numericRegex.test(field.value);
        },

        integer: function integer(field) {
            return integerRegex.test(field.value);
        },

        decimal: function decimal(field) {
            return decimalRegex.test(field.value);
        },

        is_natural: function is_natural(field) {
            return naturalRegex.test(field.value);
        },

        is_natural_no_zero: function is_natural_no_zero(field) {
            return naturalNoZeroRegex.test(field.value);
        },

        valid_ip: function valid_ip(field) {
            return ipRegex.test(field.value);
        },

        valid_base64: function valid_base64(field) {
            return base64Regex.test(field.value);
        },

        valid_url: function valid_url(field) {
            return urlRegex.test(field.value);
        },

        valid_credit_card: function valid_credit_card(field) {
            // Luhn Check Code from https://gist.github.com/4075533
            // accept only digits, dashes or spaces
            if (!numericDashRegex.test(field.value)) return false;

            // The Luhn Algorithm. It's so pretty.
            var nCheck = 0,
                nDigit = 0,
                bEven = false;
            var strippedField = field.value.replace(/\D/g, "");

            for (var n = strippedField.length - 1; n >= 0; n--) {
                var cDigit = strippedField.charAt(n);
                nDigit = parseInt(cDigit, 10);
                if (bEven) {
                    if ((nDigit *= 2) > 9) nDigit -= 9;
                }

                nCheck += nDigit;
                bEven = !bEven;
            }

            return nCheck % 10 === 0;
        },

        is_file_type: function is_file_type(field, type) {
            if (field.type !== 'file') {
                return true;
            }

            var ext = field.value.substr(field.value.lastIndexOf('.') + 1),
                typeArray = type.split(','),
                inArray = false,
                i = 0,
                len = typeArray.length;

            for (i; i < len; i++) {
                if (ext == typeArray[i]) inArray = true;
            }

            return inArray;
        },

        greater_than_date: function greater_than_date(field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate > validDate;
        },

        less_than_date: function less_than_date(field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate < validDate;
        },

        greater_than_or_equal_date: function greater_than_or_equal_date(field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate >= validDate;
        },

        less_than_or_equal_date: function less_than_or_equal_date(field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate <= validDate;
        }
    };

    window.FormValidator = FormValidator;
})(window, document);

/*
 * Export as a CommonJS module
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
'use strict';

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

    function system_size(dailyKiloWattHrs) {
        var hrsSun = 5;
        var kWsolar = 1150;
        return Math.round(kWsolar * (dailyKiloWattHrs / hrsSun) / 100) / 10;
    }

    function invalid_zipcode($error) {
        $error.html('<p>Please enter a valid zip code.</p>');
    }

    function invalid_number($error) {
        $error.html('<p>Please enter a postitive number.</p>');
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

    function display_form_modal(zipcode, city, $modal) {
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
            display_form_modal(zipcode, city, $modal);
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
                        display_form_modal(zipcode, city, $modal);
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
            $zipbox.on('focus', function (e) {
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

    function display_quickquote_modal(value, $modal) {
        var $form = $modal.find('.elead-lightbox-qqform');
        var $header = $modal.find('.elead-lightbox-modal__header');
        if ($form.length) {
            if ($header.length) {
                $header.html('<p>Get an instant estimate for a ' + value + ' kWh solar system.</p>');
            }
            var $fillme = $form.find('input[name="dailyaveragekwh"]');
            if ($fillme.length) {
                $fillme.val(value);
            }
        }
        $modal.css('display', 'table');
    }

    function process_qquote($cta, $modal) {
        var $input = $cta.find('.elead-lightbox-qquote__input');
        var $error = $cta.find('.elead-lightbox-qquote__error');
        $error.html('');

        var entry = $input.length ? $input.val().trim() : '';
        if (!entry) {
            invalid_number($error);
            return;
        }
        var match = /^([0-9]*\.?[0-9]+)/.exec(entry);
        if (!match) {
            invalid_number($error);
            return;
        }
        var value = system_size(match[1]);
        display_quickquote_modal(value, $modal);
    }

    function handle_qquote($) {
        var $cta = $('.elead-lightbox-qquote__button');
        if ($cta.length) {
            $cta.on('click', function (e) {
                var $form = $(this).closest('form');
                var $modal = $form.next('.elead-lightbox-modal');
                if ($form.length && $modal.length) {
                    process_qquote($form, $modal);
                }
            });
        }

        var $zipbox = $('.elead-lightbox-qquote__input');
        if ($zipbox.length) {
            $zipbox.on('keypress', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var $form = $(this).closest('form');
                    var $modal = $form.next('.elead-lightbox-modal');
                    if ($form.length && $modal.length) {
                        process_qquote($form, $modal);
                    }
                }
            });
            $zipbox.on('focus', function (e) {
                $('.elead-lightbox-qquote__error').text('');
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
            validators[i] = new FormValidator(this.id, [{ name: 'firstname', display: 'first name', rules: 'required' }, { name: 'lastname', display: 'last name', rules: 'required' }, { name: 'email', display: 'email', rules: 'valid_email' }, { name: 'phonenumber', display: 'phone number', rules: 'required|callback_valid_phone' }, { name: 'zipcode', display: 'Zip Code', rules: 'required|callback_valid_zipcode' }], function (errors, event) {
                for (var n = 0; n < errors.length; n++) {
                    var name = errors[n].name;
                    var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                    $errorBox.text(errors[n].message);
                }
            });
            validators[i].registerCallback('valid_zipcode', function (value) {
                return (/^\d{5}$/.test(value.trim())
                );
            });
            validators[i].registerCallback('valid_phone', function (value) {
                return (/^[(]?\d{3}[ ]*[-)]?[ ]*\d{3}[ ]*[\-]?[ ]*\d{4}/.test(value.trim())
                );
            });
            validators[i].setMessage('required', 'Please provide %s.');
            validators[i].setMessage('valid_email', 'Please enter a valid email address.');
            validators[i].setMessage('valid_zipcode', 'Please enter a valid zip code.');
            validators[i].setMessage('valid_phone', 'Please enter a valid phone number.');
        });
        $('.elead-lightbox-form__input > input ').on('focus', function (e) {
            $(this).siblings().text('');
        });
    }

    function handle_qqform($) {
        // eLeadLightbox must be created by wp_localize_script
        if (typeof eLeadLightbox === 'undefined' || !(eLeadLightbox instanceof Object)) return;
        var mailer_url = eLeadLightbox.mailer_url;
        if (!mailer_url) return;

        var validators = [];
        $('.elead-lightbox-qqform').each(function (i) {
            var $form = $(this);
            validators[i] = new FormValidator(this.id, [{ name: 'firstname', display: 'first name', rules: 'required' }, { name: 'lastname', display: 'last name', rules: 'required' }, { name: 'email', display: 'email', rules: 'required|valid_email' }, { name: 'phonenumber', display: 'phone number', rules: 'required|callback_valid_phone' }, { name: 'avekwh', display: 'daily average kWh', rules: 'required|callback_valid_decimal' }, { name: 'zipcode', display: 'Zip Code', rules: 'required|callback_valid_zipcode' }], function (errors, event) {
                for (var n = 0; n < errors.length; n++) {
                    var name = errors[n].name;
                    var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                    $errorBox.text(errors[n].message);
                }
            });
            validators[i].registerCallback('valid_zipcode', function (value) {
                return (/^\d{5}$/.test(value.trim())
                );
            });
            validators[i].registerCallback('valid_phone', function (value) {
                return (/^[(]?\d{3}[ ]*[-)]?[ ]*\d{3}[ ]*[\-]?[ ]*\d{4}/.test(value.trim())
                );
            });
            validators[i].setMessage('required', 'Please provide %s.');
            validators[i].setMessage('valid_email', 'Please enter a valid email address.');
            validators[i].setMessage('valid_zipcode', 'Please enter a valid zip code.');
            validators[i].setMessage('valid_phone', 'Please enter a valid phone number.');
            validators[i].setMessage('valid_decimal', 'Please enter a positive number.');
            // handle submit
            $(this).submit(function (e) {
                var $form = $(this);
                // hold off on form submission until email is sent
                e.preventDefault();
                e.returnValue = false;
                // send email
                $.ajax({
                    url: mailer_url,
                    method: 'POST',
                    data: $(this).serialize(),
                    dataType: 'json',
                    error: function error() {
                        console.log('MAILER ERROR');
                        console.log('mailer_url: ' + mailer_url);
                        console.log('data: ' + $(this).serialize());
                    },
                    success: function success() {},
                    complete: function complete() {
                        $(this).off('submit');
                        $(this).submit();
                    }
                });
            });
        });
        $('.elead-lightbox-qqform__input > input ').on('focus', function (e) {
            $(this).siblings().text('');
        });
    }

    $(function () {
        handle_cta($);
        handle_form($);
        if (typeof eLeadLightbox !== 'undefined') {
            handle_qquote($);
            handle_qqform($);
        }
    });
})(jQuery);