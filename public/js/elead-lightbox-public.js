'use strict';

/*!
Waypoints - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
  'use strict';

  var keyCounter = 0;
  var allWaypoints = {};

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor');
    }
    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor');
    }
    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor');
    }

    this.key = 'waypoint-' + keyCounter;
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
    this.element = this.options.element;
    this.adapter = new Waypoint.Adapter(this.element);
    this.callback = options.handler;
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
    this.enabled = this.options.enabled;
    this.triggerPoint = null;
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    });
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context);

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset];
    }
    this.group.add(this);
    this.context.add(this);
    allWaypoints[this.key] = this;
    keyCounter += 1;
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function (direction) {
    this.group.queueTrigger(this, direction);
  };

  /* Private */
  Waypoint.prototype.trigger = function (args) {
    if (!this.enabled) {
      return;
    }
    if (this.callback) {
      this.callback.apply(this, args);
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function () {
    this.context.remove(this);
    this.group.remove(this);
    delete allWaypoints[this.key];
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function () {
    this.enabled = false;
    return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function () {
    this.context.refresh();
    this.enabled = true;
    return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function () {
    return this.group.next(this);
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function () {
    return this.group.previous(this);
  };

  /* Private */
  Waypoint.invokeAll = function (method) {
    var allWaypointsArray = [];
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey]);
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]();
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function () {
    Waypoint.invokeAll('destroy');
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function () {
    Waypoint.invokeAll('disable');
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function () {
    Waypoint.invokeAll('enable');
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function () {
    Waypoint.Context.refreshAll();
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function () {
    return window.innerHeight || document.documentElement.clientHeight;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function () {
    return document.documentElement.clientWidth;
  };

  Waypoint.adapters = [];

  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  };

  Waypoint.offsetAliases = {
    'bottom-in-view': function bottomInView() {
      return this.context.innerHeight() - this.adapter.outerHeight();
    },
    'right-in-view': function rightInView() {
      return this.context.innerWidth() - this.adapter.outerWidth();
    }
  };

  window.Waypoint = Waypoint;
})();(function () {
  'use strict';

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60);
  }

  var keyCounter = 0;
  var contexts = {};
  var Waypoint = window.Waypoint;
  var oldWindowLoad = window.onload;

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
    this.element = element;
    this.Adapter = Waypoint.Adapter;
    this.adapter = new this.Adapter(element);
    this.key = 'waypoint-context-' + keyCounter;
    this.didScroll = false;
    this.didResize = false;
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    };
    this.waypoints = {
      vertical: {},
      horizontal: {}
    };

    element.waypointContextKey = this.key;
    contexts[element.waypointContextKey] = this;
    keyCounter += 1;

    this.createThrottledScrollHandler();
    this.createThrottledResizeHandler();
  }

  /* Private */
  Context.prototype.add = function (waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical';
    this.waypoints[axis][waypoint.key] = waypoint;
    this.refresh();
  };

  /* Private */
  Context.prototype.checkEmpty = function () {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
    if (horizontalEmpty && verticalEmpty) {
      this.adapter.off('.waypoints');
      delete contexts[this.key];
    }
  };

  /* Private */
  Context.prototype.createThrottledResizeHandler = function () {
    var self = this;

    function resizeHandler() {
      self.handleResize();
      self.didResize = false;
    }

    this.adapter.on('resize.waypoints', function () {
      if (!self.didResize) {
        self.didResize = true;
        Waypoint.requestAnimationFrame(resizeHandler);
      }
    });
  };

  /* Private */
  Context.prototype.createThrottledScrollHandler = function () {
    var self = this;
    function scrollHandler() {
      self.handleScroll();
      self.didScroll = false;
    }

    this.adapter.on('scroll.waypoints', function () {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true;
        Waypoint.requestAnimationFrame(scrollHandler);
      }
    });
  };

  /* Private */
  Context.prototype.handleResize = function () {
    Waypoint.Context.refreshAll();
  };

  /* Private */
  Context.prototype.handleScroll = function () {
    var triggeredGroups = {};
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    };

    for (var axisKey in axes) {
      var axis = axes[axisKey];
      var isForward = axis.newScroll > axis.oldScroll;
      var direction = isForward ? axis.forward : axis.backward;

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers();
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    };
  };

  /* Private */
  Context.prototype.innerHeight = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight();
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerHeight();
  };

  /* Private */
  Context.prototype.remove = function (waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key];
    this.checkEmpty();
  };

  /* Private */
  Context.prototype.innerWidth = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth();
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerWidth();
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function () {
    var allWaypoints = [];
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey]);
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy();
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function () {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window;
    /*eslint-enable eqeqeq */
    var contextOffset = isWindow ? undefined : this.adapter.offset();
    var triggeredGroups = {};
    var axes;

    this.handleScroll();
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    };

    for (var axisKey in axes) {
      var axis = axes[axisKey];
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        var adjustment = waypoint.options.offset;
        var oldTriggerPoint = waypoint.triggerPoint;
        var elementOffset = 0;
        var freshWaypoint = oldTriggerPoint == null;
        var contextModifier, wasBeforeScroll, nowAfterScroll;
        var triggeredBackward, triggeredForward;

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp];
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint);
        } else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment);
          if (waypoint.options.offset.indexOf('%') > -1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset;
        waypoint.triggerPoint = elementOffset + contextModifier - adjustment;
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
        triggeredBackward = wasBeforeScroll && nowAfterScroll;
        triggeredForward = !wasBeforeScroll && !nowAfterScroll;

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }

    Waypoint.requestAnimationFrame(function () {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers();
      }
    });

    return this;
  };

  /* Private */
  Context.findOrCreateByElement = function (element) {
    return Context.findByElement(element) || new Context(element);
  };

  /* Private */
  Context.refreshAll = function () {
    for (var contextId in contexts) {
      contexts[contextId].refresh();
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function (element) {
    return contexts[element.waypointContextKey];
  };

  window.onload = function () {
    if (oldWindowLoad) {
      oldWindowLoad();
    }
    Context.refreshAll();
  };

  Waypoint.requestAnimationFrame = function (callback) {
    var requestFn = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrameShim;
    requestFn.call(window, callback);
  };
  Waypoint.Context = Context;
})();(function () {
  'use strict';

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint;
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint;
  }

  var groups = {
    vertical: {},
    horizontal: {}
  };
  var Waypoint = window.Waypoint;

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
    this.name = options.name;
    this.axis = options.axis;
    this.id = this.name + '-' + this.axis;
    this.waypoints = [];
    this.clearTriggerQueues();
    groups[this.axis][this.name] = this;
  }

  /* Private */
  Group.prototype.add = function (waypoint) {
    this.waypoints.push(waypoint);
  };

  /* Private */
  Group.prototype.clearTriggerQueues = function () {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    };
  };

  /* Private */
  Group.prototype.flushTriggers = function () {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction];
      var reverse = direction === 'up' || direction === 'left';
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i];
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction]);
        }
      }
    }
    this.clearTriggerQueues();
  };

  /* Private */
  Group.prototype.next = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    var isLast = index === this.waypoints.length - 1;
    return isLast ? null : this.waypoints[index + 1];
  };

  /* Private */
  Group.prototype.previous = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    return index ? this.waypoints[index - 1] : null;
  };

  /* Private */
  Group.prototype.queueTrigger = function (waypoint, direction) {
    this.triggerQueues[direction].push(waypoint);
  };

  /* Private */
  Group.prototype.remove = function (waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    if (index > -1) {
      this.waypoints.splice(index, 1);
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function () {
    return this.waypoints[0];
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function () {
    return this.waypoints[this.waypoints.length - 1];
  };

  /* Private */
  Group.findOrCreate = function (options) {
    return groups[options.axis][options.name] || new Group(options);
  };

  Waypoint.Group = Group;
})();(function () {
  'use strict';

  var $ = window.jQuery;
  var Waypoint = window.Waypoint;

  function JQueryAdapter(element) {
    this.$element = $(element);
  }

  $.each(['innerHeight', 'innerWidth', 'off', 'offset', 'on', 'outerHeight', 'outerWidth', 'scrollLeft', 'scrollTop'], function (i, method) {
    JQueryAdapter.prototype[method] = function () {
      var args = Array.prototype.slice.call(arguments);
      return this.$element[method].apply(this.$element, args);
    };
  });

  $.each(['extend', 'inArray', 'isEmptyObject'], function (i, method) {
    JQueryAdapter[method] = $[method];
  });

  Waypoint.adapters.push({
    name: 'jquery',
    Adapter: JQueryAdapter
  });
  Waypoint.Adapter = JQueryAdapter;
})();(function () {
  'use strict';

  var Waypoint = window.Waypoint;

  function createExtension(framework) {
    return function () {
      var waypoints = [];
      var overrides = arguments[0];

      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1]);
        overrides.handler = arguments[0];
      }

      this.each(function () {
        var options = framework.extend({}, overrides, {
          element: this
        });
        if (typeof options.context === 'string') {
          options.context = framework(this).closest(options.context)[0];
        }
        waypoints.push(new Waypoint(options));
      });

      return waypoints;
    };
  }

  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery);
  }
  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto);
  }
})();
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
        var hrsSun = 5;
        var kWsolar = 1150;
        return Number(Math.round(kWsolar * (dailyKiloWattHrs / hrsSun) / 100) / 10).toFixed(1);
    }

    function titleCase(str) {
        if ('string' !== typeof str || !str.trim()) return '';
        return str.trim().toLowerCase().split(' ').map(function (word) {
            return word[0].toUpperCase() + word.substr(1);
        }).join(' ');
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
        $error.css({ display: 'block', opacity: '1' });
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
                $('.elead-lightbox-cal-form').css({ display: 'block' });
                $('.elead-lightbox-cal-form-response').css({ display: 'none', position: 'absolute' });
                $('.elead-lightbox-quote-form__target').off('load');
                $('.elead-lightbox-quote-form').css({ display: 'block' });
                $('.elead-lightbox-quote-form-response').css({ display: 'none', position: 'absolute' });
            });
        }
    }

    function handleQuoteForm() {
        var validators = [];
        $('.elead-lightbox-quote-form').each(function (i) {
            var $form = $(this);
            var $iframe = $form.parent().find('.elead-lightbox-quote-form__target');
            var $response = $form.parent().find('.elead-lightbox-quote-form-response');
            validators[i] = new FormValidator(this.id, [{ name: 'firstname', display: 'first name', rules: 'required' }, { name: 'lastname', display: 'last name', rules: 'required' }, { name: 'email', display: 'email', rules: 'valid_email' }, { name: 'phone1', display: 'phone number', rules: 'required|callback_valid_phone' }, { name: 'zip', display: 'Quote Code', rules: 'required|callback_valid_zipcode' }], function (errors, event) {
                for (var n = 0; n < errors.length; n++) {
                    var name = errors[n].name;
                    var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                    displayError($errorBox, errors[n].message);
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
                    $form.css({ display: 'none' });
                    $response.css({
                        display: 'block',
                        position: 'relative'
                    });
                });
            });
        });
        $('.elead-lightbox-quote-form__input > input ').on('focus', function (e) {
            clearError($(this).siblings());
        });
    }

    function handleCalculatorForm() {
        // eLeadLightbox must be created by wp_localize_script
        if (typeof eLeadLightbox === 'undefined' || !(eLeadLightbox instanceof Object)) return;
        var mailer_url = eLeadLightbox.mailer_url;
        if (!mailer_url) return;

        var validators = [];
        $('.elead-lightbox-cal-form').each(function (i) {
            var $form = $(this);
            var $response = $form.parent().find('.elead-lightbox-cal-form-response');
            var $emailSpan = $form.parent().find('.elead-lightbox-cal-form-response__email');
            var $iframe = $form.parent().find('.elead-lightbox-cal-form__target');
            validators[i] = new FormValidator(this.id, [{ name: 'firstname', display: 'first name', rules: 'required' }, { name: 'lastname', display: 'last name', rules: '' }, { name: 'email', display: 'email', rules: 'required|valid_email' }, { name: 'phone1', display: 'phone', rules: 'required|callback_valid_phone' }, { name: 'dailyavekwh', display: 'daily average kWh', rules: 'required|callback_valid_decimal' }, { name: 'zip', display: 'Quote Code', rules: 'callback_valid_zipcode' }], function (errors, event) {
                for (var n = 0; n < errors.length; n++) {
                    var name = errors[n].name;
                    var $errorBox = $form.find('input[name="' + name + '"]').siblings('div');
                    displayError($errorBox, errors[n].message);
                    // $errorBox.text(errors[n].message);
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
                    error: function error(data) {},
                    success: function success(data) {},
                    complete: function complete(data) {}
                }).done(function (data) {
                    $iframe.on('load', function (e) {
                        if ($button.length && $icon.length) {
                            $icon.removeClass('fa-spinner');
                            $button.removeClass('hideafter');
                        }
                        $form.css({ display: 'none' });
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
        if (typeof eLeadLightbox === 'undefined' || !(eLeadLightbox instanceof Object)) return;

        // collect visible plugin forms
        var $forms = $('.elead-lightbox-quote-cta').add('.elead-lightbox-cal-cta').add('.elead-lightbox-quote-form').add('.elead-lightbox-cal-form');
        var $visible = $forms.not('.elead-lightbox-modal .elead-lightbox-quote-form').not('.elead-lightbox-modal .elead-lightbox-cal-form');

        // view
        $visible.each(function () {
            var element = this;
            var $form = $(this);
            var waypoint = new Waypoint({
                element: element,
                handler: function handler() {
                    updateDb($form, 'view');
                },
                offset: '60%',
                continuous: true
            });
        });

        // focus
        $forms.each(function () {
            var $form = $(this);
            $(this).find('input[type="text"]').on('focus', function () {
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