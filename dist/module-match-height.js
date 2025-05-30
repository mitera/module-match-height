/*!
 * @author Simone Miterangelis <simone@mite.it>
 * module-match-height v1.0.3 by @mitera
 * https://github.com/mitera/module-match-height
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MatchHeight = factory());
})(this, (function () { 'use strict';

	class MatchHeight {
	    constructor(wrapEl, settings) {
	        this.wrapEl = wrapEl;
	        let default_settings = {
	            elements: null,
	            byRow: true,
	            target: null,
	            attributeName: null,
	            attributeValue: null,
	            property: 'height',
	            remove: null,
	            events: true,
	            throttle: 80,
	            beforeUpdate: null,
	            afterUpdate: null
	        };
	        this.settings = Object.assign(Object.assign({}, default_settings), settings);
	        if (this.settings.property && !this._validateProperty(this.settings.property)) {
	            this.settings.property = 'height';
	        }
	        if (this.settings.events) {
	            this.update = this._applyAll.bind(this);
	            if (document.readyState !== 'loading') {
	                this._applyAll();
	            }
	            else {
	                document.addEventListener('DOMContentLoaded', this.update, { once: true });
	            }
	            if (this.settings.throttle && this.settings.throttle > 0) {
	                this.update = this._throttle(this.update, this.settings.throttle);
	            }
	            this._init();
	        }
	    }
	    _init() {
	        window.addEventListener("resize", this.update);
	        window.addEventListener("orientationchange", this.update);
	    }
	    _unbind() {
	        window.removeEventListener("resize", this.update);
	        window.removeEventListener("orientationchange", this.update);
	    }
	    _merge(o1, o2) {
	        if (o1 != null) {
	            for (let i in o1) {
	                o2[i] = o1[i];
	            }
	        }
	        return o2;
	    }
	    _throttle(fn, threshold) {
	        let last, deferTimer;
	        return function () {
	            const now = Date.now();
	            if (last && now < last + threshold) {
	                clearTimeout(deferTimer);
	                deferTimer = setTimeout(function () {
	                    last = now;
	                    fn();
	                }, threshold);
	            }
	            else {
	                last = now;
	                fn();
	            }
	        };
	    }
	    _applyAll() {
	        if (this.settings && this.settings.beforeUpdate) {
	            this.settings.beforeUpdate();
	        }
	        this._apply();
	        if (this.settings.attributeName && this._validateProperty(this.settings.attributeName)) {
	            this._applyDataApi(this.settings.attributeName);
	        }
	        this._applyDataApi('data-match-height');
	        this._applyDataApi('data-mh');
	        if (this.settings && this.settings.afterUpdate) {
	            this.settings.afterUpdate();
	        }
	    }
	    _validateProperty(value) {
	        return String(value)
	            .toLowerCase()
	            .match(/^([a-z-]{2,})$/);
	    }
	    _parse(value) {
	        return parseFloat(value) || 0;
	    }
	    _rows(elements) {
	        let tolerance = 1, lastTop = -1, listRows = [], rows = [];
	        elements.forEach(($that) => {
	            let top = $that.getBoundingClientRect().top - this._parse(window.getComputedStyle($that).getPropertyValue('margin-top'));
	            if (lastTop != -1 && Math.floor(Math.abs(lastTop - top)) >= tolerance) {
	                listRows.push(rows);
	                rows = [];
	                lastTop = -1;
	            }
	            rows.push($that);
	            lastTop = top;
	        });
	        listRows.push(rows);
	        return listRows;
	    }
	    _applyDataApi(property) {
	        let $row = Array.from(this.wrapEl.querySelectorAll('[' + property + ']'));
	        $row.forEach(($el) => {
	            let groupId = $el.getAttribute(property);
	            this.settings = this._merge({ attributeName: property, attributeValue: groupId }, this.settings);
	            this._apply();
	        });
	    }
	    _remove() {
	        let $elements = [];
	        let opts = this.settings;
	        if (opts.elements) {
	            $elements = Array.from(this.wrapEl.querySelectorAll(opts.elements));
	        }
	        else {
	            if (opts.attributeName && opts.attributeValue) {
	                $elements = Array.from(this.wrapEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]'));
	            }
	        }
	        $elements.forEach((item) => {
	            if (opts.property)
	                item.style.setProperty(opts.property, '');
	            if (item.getAttribute('style') === '')
	                item.removeAttribute('style');
	        });
	    }
	    _apply() {
	        let opts = this.settings;
	        let $elements = [];
	        if (opts.elements && opts.elements.trim() != '') {
	            $elements = Array.from(this.wrapEl.querySelectorAll(opts.elements));
	        }
	        else {
	            if (opts.attributeName && this._validateProperty(opts.attributeName) && opts.attributeValue && opts.attributeValue.trim() != '') {
	                $elements = Array.from(this.wrapEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]'));
	            }
	        }
	        let rows = [$elements];
	        if (opts.byRow && !opts.target) {
	            $elements.forEach(($that) => {
	                let display = window.getComputedStyle($that).getPropertyValue('display');
	                if (display && (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex')) {
	                    display = 'display: block; ';
	                }
	                $that.setAttribute('style-cache', $that.getAttribute('style') || '');
	                $that.setAttribute('style', display + 'padding-top: 0; padding-bottom: 0; margin-top: 0; margin-bottom: 0; border-top-width: 0; border-bottom-width: 0; height: 100px; overflow: hidden;');
	            });
	            rows = this._rows($elements);
	            $elements.forEach(($that) => {
	                $that.setAttribute('style', $that.getAttribute('style-cache') || '');
	                $that.removeAttribute('style-cache');
	                if ($that.getAttribute('style') === '')
	                    $that.removeAttribute('style');
	            });
	        }
	        rows.forEach(($row) => {
	            let targetHeight = 0;
	            if (!opts.target) {
	                if (opts.byRow && $row.length <= 1) {
	                    $row.forEach(($that) => {
	                        if (opts.property)
	                            this._resetStyle($that, opts.property);
	                    });
	                    return;
	                }
	                $row.forEach(($that) => {
	                    let style = $that.getAttribute('style') || '', display = window.getComputedStyle($that).getPropertyValue('display');
	                    if (display && (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex')) {
	                        display = 'block';
	                    }
	                    $that.setAttribute('style', 'display: ' + display + ';');
	                    let isTarget = true;
	                    if (opts.remove) {
	                        if (opts.remove instanceof NodeList) {
	                            opts.remove.forEach(($el) => {
	                                if ($that === $el) {
	                                    isTarget = false;
	                                }
	                            });
	                        }
	                        else {
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
	                    if (style) {
	                        $that.setAttribute('style', style);
	                    }
	                    else {
	                        $that.style.setProperty('display', '');
	                    }
	                    if ($that.getAttribute('style') === '')
	                        $that.removeAttribute('style');
	                });
	            }
	            else {
	                targetHeight = opts.target.getBoundingClientRect().height;
	            }
	            $row.forEach(($that) => {
	                let verticalPadding = 0;
	                if (opts.target && $that === opts.target) {
	                    return;
	                }
	                verticalPadding = this._parse(window.getComputedStyle($that).getPropertyValue('padding-top')) +
	                    this._parse(window.getComputedStyle($that).getPropertyValue('padding-bottom')) +
	                    this._parse(window.getComputedStyle($that).getPropertyValue('border-top-width')) +
	                    this._parse(window.getComputedStyle($that).getPropertyValue('border-bottom-width'));
	                if (opts.property)
	                    $that.style.setProperty(opts.property, (targetHeight - verticalPadding) + 'px');
	                if (opts.property && $that.getBoundingClientRect().height < targetHeight) {
	                    $that.style.setProperty(opts.property, targetHeight + 'px');
	                }
	                if (opts.remove) {
	                    if (opts.remove instanceof NodeList) {
	                        let removedItems = Array.from(opts.remove);
	                        removedItems.forEach(($el) => {
	                            if ($that === $el && opts.property) {
	                                if ($el instanceof HTMLElement) {
	                                    this._resetStyle($el, opts.property);
	                                }
	                            }
	                        });
	                    }
	                    else {
	                        if ($that === opts.remove && opts.property) {
	                            this._resetStyle($that, opts.property);
	                        }
	                    }
	                }
	            });
	        });
	    }
	    _resetStyle($that, property) {
	        if (this._validateProperty(property)) {
	            $that.style.setProperty(property, '');
	            if ($that.getAttribute('style') === '') {
	                $that.removeAttribute('style');
	            }
	        }
	    }
	}

	return MatchHeight;

}));
