/**
 * vanilla-match-height v0.0.1 by @mitera
 * Simone Miterangelis <simone@mite.it>
 * License: MIT
 */
class MatchHeight {

    /**
     * matchHeight
     *
     * @param {Element} parentEl
     * @param {Array} settings
     * constructor
     */
    constructor(parentEl, settings) {
        this.parentEl = parentEl;

        // Default settings
        let default_settings = {
            elements: '',
            byRow: true,
            target: null,
            attributeName: null,
            attributeValue: null,
            property: 'height',
            remove: null
        }

        if (settings != null) {
            this.settings = this._merge(settings, default_settings);
        } else {
            this.settings = default_settings;
        }

        if (!this._validateProperty(this.settings.property)) {
            this.settings.property = 'height';
        }

        this.settings.property = this._dashToCamel(this.settings.property);

        this._init();
    }

    /**
     * Merge two objects
     *
     * @param {Object} o1 Object 1
     * @param {Object} o2 Object 2
     * @return {Object}
     */
    _merge(o1, o2) {
        for (var i in o1) {
            o2[i] = o1[i];
        }
        return o2;
    }

    /**
     * Initialize the application
     */
    _init() {

        var $this = this;

        document.addEventListener("DOMContentLoaded", function() {
            $this._apply();
            if ($this._validateProperty($this.settings.attributeName)) {
                $this._applyDataApi($this.settings.attributeName);
            }
            $this._applyDataApi('data-match-height');
            $this._applyDataApi('data-mh');
        });

        window.addEventListener("resize", function() {
            $this._apply();
            if ($this._validateProperty($this.settings.attributeName)) {
                $this._applyDataApi($this.settings.attributeName);
            }
            $this._applyDataApi('data-match-height');
            $this._applyDataApi('data-mh');
        });
    }

    /*
    *  _validateProperty
    *  handle plugin options
    */
    _validateProperty(value) {
        // parse value and convert NaN to 0
        return String(value)
            .toLowerCase()
            .match(
                /^([a-z-]{2,})$/
            );
    }

    /*
    *  _parseOptions
    *  handle plugin options
    */
    _parse(value) {
        // parse value and convert NaN to 0
        return parseFloat(value) || 0;
    }

    /*
    *  _rows
    *  utility function returns array of selections representing each row
    *  (as displayed after float wrapping applied by browser)
    */
    _rows(elements) {
        var $this = this;
        var tolerance = 1,
            lastTop = null,
            listRows = [],
            rows = [];

        // group elements by their top position
        elements.forEach(($that) => {

            var top = $that.getBoundingClientRect().top - $this._parse($that.style.marginTop);

            // if the row top is the same, add to the row group
            if (lastTop != null && Math.floor(Math.abs(lastTop - top)) >= tolerance) {
                listRows.push(rows);
                rows = [];
                lastTop = null;
                rows.push($that);
            } else {
                rows.push($that);
            }

            // keep track of the last row top
            lastTop = top;
        });
        listRows.push(rows);

        return listRows;
    }

    /*
    *  _dashToCamel
    *  utility function for transform css property dash to camel
    */
    _dashToCamel(input) {
        return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    }

    /*
      *  _applyDataApi
      *  applies matchHeight to all elements with a data-match-height attribute
    */
    _applyDataApi(property) {
        var $this = this;

        var $row = this.parentEl.querySelectorAll('[' + property + ']');
        // generate groups by their groupId set by elements using data-match-height
        $row.forEach(($el) => {
            var groupId = $el.getAttribute(property);
            $this.settings = this._merge({attributeName: property, attributeValue: groupId}, $this.settings);
            $this._apply();
        });
    }

    /*
    *  _remove
    *  remove matchHeight to given elements
    */
    _remove() {
        var $elements = []
        var opts = this.settings;
        if (opts.elements) {
            $elements = this.parentEl.querySelectorAll(opts.elements);
        } else {
            if (opts.attributeName && opts.attributeValue) {
                $elements = this.parentEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]');
            }
        }
        $elements.forEach((item) => {
            eval('item.style.' + opts.property + ' = \'\';');
            if (item.getAttribute('style') == '') item.removeAttribute('style');
        });
    }

    /*
    *  _apply
    *  apply matchHeight to given elements
    */
    _apply() {

        var $this = this;
        var opts = $this.settings;
        var $elements = []
        if (opts.elements) {
            $elements = this.parentEl.querySelectorAll(opts.elements);
        } else {
            if (opts.attributeName && opts.attributeValue) {
                $elements = this.parentEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]');
            }
        }
        var rows = [$elements];

        // get rows if using byRow, otherwise assume one row
        if (opts.byRow && !opts.target) {

            // must first force an arbitrary equal height so floating elements break evenly
            $elements.forEach(($that) => {
                var display = $that.style.display;

                // temporarily force a usable display value
                if (display && (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex')) {
                    display = 'display: block; ';
                }

                // cache the original inline style
                $that.setAttribute('style-cache', $that.getAttribute('style') || '');
                // reset style
                $that.setAttribute('style', display + 'padding-top: 0; padding-bottom: 0; margin-top: 0; margin-bottom: 0; border-top-width: 0; border-bottom-width: 0; height: 100px; overflow: hidden;');
            });

            // get the array of rows (based on element top position)
            rows = this._rows($elements);

            // revert original inline styles
            $elements.forEach(($that) => {
                $that.setAttribute('style', $that.getAttribute('style-cache') || '');
                $that.removeAttribute('style-cache');
                if ($that.getAttribute('style') == '') $that.removeAttribute('style');
            });
        }

        rows.forEach(($row) => {
            var targetHeight = 0;

            if (!opts.target) {
                // skip apply to rows with only one item
                if (opts.byRow && $row.length <= 1) {
                    $row.forEach(($that) => {
                        var display = $that.style.display;
                        if (display) $that.style.display = display;
                        eval('$that.style.' + opts.property + ' = \'\';');
                    })
                    return;
                }

                // iterate the row and find the max height
                $row.forEach(($that) => {
                    var style = $that.getAttribute('style') || '',
                        display = $that.style.display;

                    // temporarily force a usable display value
                    if (display && (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex')) {
                        display = 'block';
                    }

                    // ensure we get the correct actual height (and not a previously set height value)
                    $that.setAttribute('style', 'display: ' + display + ';');

                    // find the max height (including padding, but not margin)
                    var isTarget = true;
                    if (opts.remove) {
                        if (opts.remove instanceof NodeList) {
                            opts.remove.forEach(($el) => {
                                if ($that === $el) {
                                    isTarget = false;
                                }
                            });
                        } else {
                            if ($that === opts.remove) {
                                isTarget = false;
                            }
                        }
                    }
                    if (isTarget) {
                        if ($that.getBoundingClientRect().height > targetHeight) {
                            targetHeight = $that.getBoundingClientRect().height;
                        }
                    }

                    // revert styles
                    if (style) {
                        $that.setAttribute('style', style);
                    } else {
                        $that.style.display = '';
                    }

                    if ($that.getAttribute('style') == '') $that.removeAttribute('style');
                });

            } else {
                // if target set, use the height of the target element
                targetHeight = opts.target.getBoundingClientRect().height;
            }

            // iterate the row and apply the height to all elements
            $row.forEach(($that) => {
                var verticalPadding = 0;

                // don't apply to a target
                if (opts.target && $that === opts.target) {
                    return;
                }

                // handle padding and border correctly (required when not using border-box)
                verticalPadding += $this._parse($that.style.borderTopWidth) + $this._parse($that.style.borderBottomWidth);
                verticalPadding += $this._parse($that.style.paddingTop) + $this._parse($that.style.paddingBottom);

                // set the height (accounting for padding and border)
                eval('$that.style.' + opts.property + ' = \'' + (targetHeight - verticalPadding) + 'px\'');

                if ($that.getBoundingClientRect().height < targetHeight) {
                    eval('$that.style.' + opts.property + ' = \'' + targetHeight + 'px\'');
                }

                if (opts.remove) {
                    if (opts.remove instanceof NodeList) {
                        opts.remove.forEach(($el) => {
                            if ($that === $el) {
                                eval('$el.style.' + opts.property + ' = \'\';');
                                if ($el.getAttribute('style') == '') $el.removeAttribute('style');
                            }
                        });
                    } else {
                        if ($that === opts.remove) {
                            eval('$that.style.' + opts.property + ' = \'\';');
                            if ($that.getAttribute('style') == '') $that.removeAttribute('style');
                        }
                    }
                }
            });

        });

    }
}

if (typeof exports === 'object') {
    module.exports = MatchHeight
}
