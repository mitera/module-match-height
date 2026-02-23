/*!
 * @author Simone Miterangelis <simone@mite.it>
 * module-match-height v1.1.0 by @mitera
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
	        this._remains = [];
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
	    _remove() {
	        let elements = [];
	        let opts = this.settings;
	        if (opts.elements) {
	            elements = Array.from(this.wrapEl.querySelectorAll(opts.elements));
	        }
	        else {
	            if (opts.attributeName && opts.attributeValue) {
	                elements = Array.from(this.wrapEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]'));
	            }
	        }
	        elements.forEach((item) => {
	            if (opts.property)
	                item.style.setProperty(opts.property, '');
	            if (item.getAttribute('style') === '')
	                item.removeAttribute('style');
	        });
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
	    _applyDataApi(attributeName) {
	        let elements = Array.from(this.wrapEl.querySelectorAll('[' + attributeName + ']'));
	        elements.forEach((item) => {
	            this._resetStyle(item, this.settings.property);
	        });
	        const groups = new Map();
	        elements.forEach((el) => {
	            const groupId = el.getAttribute(attributeName);
	            if (groupId) {
	                if (!groups.has(groupId)) {
	                    groups.set(groupId, []);
	                }
	                groups.get(groupId).push(el);
	            }
	        });
	        groups.forEach((elements) => {
	            this._update(elements, attributeName);
	        });
	    }
	    _apply() {
	        let opts = this.settings;
	        let elements = [];
	        if (opts.elements && opts.elements.trim() != '') {
	            elements = Array.from(this.wrapEl.querySelectorAll(opts.elements));
	        }
	        else {
	            if (opts.attributeName && this._validateProperty(opts.attributeName) && opts.attributeValue && opts.attributeValue.trim() != '') {
	                elements = Array.from(this.wrapEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]'));
	            }
	        }
	        this._update(elements);
	    }
	    _update(elements, attribute = this.settings.attributeName || '') {
	        if (elements.length === 0)
	            return;
	        let attributeName = attribute ? attribute : this.settings.attributeName ? this.settings.attributeName : '';
	        this._remains = Array.prototype.map.call(elements, (el) => {
	            return {
	                el,
	                top: 0,
	                height: 0,
	                attribute: el.getAttribute(attributeName) || attributeName
	            };
	        });
	        this._remains.forEach((item) => {
	            this._resetStyle(item.el, this.settings.property);
	        });
	        this._process();
	    }
	    _rows(elements) {
	        let tolerance = 1, lastTop = -1, listRows = [], rows = [];
	        elements.forEach(($that) => {
	            let top = $that.top;
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
	    _parse(value) {
	        return parseFloat(value) || 0;
	    }
	    _process() {
	        this._remains.forEach((item) => {
	            const bb = item.el.getBoundingClientRect();
	            item.top = this.settings.byRow ? (bb.top - this._parse(window.getComputedStyle(item.el).getPropertyValue('margin-top'))) : 0;
	            item.height = bb.height;
	        });
	        this._remains.sort((a, b) => a.top - b.top && a.attribute.localeCompare(b.attribute));
	        let rows = this._rows(this._remains);
	        let processingTargets = rows[0];
	        let maxHeightInRow = 0;
	        if (this.settings.target)
	            maxHeightInRow = this.settings.target.getBoundingClientRect().height;
	        else
	            maxHeightInRow = Math.max(...processingTargets.map((item) => item.height));
	        processingTargets.forEach((item) => {
	            const styles = window.getComputedStyle(item.el);
	            const isBorderBox = styles.boxSizing === 'border-box';
	            if (isBorderBox) {
	                if (this.settings.property)
	                    item.el.style.setProperty(this.settings.property, `${maxHeightInRow}px`);
	            }
	            else {
	                const paddingAndBorder = (parseFloat(styles.paddingTop) || 0) +
	                    (parseFloat(styles.paddingBottom) || 0) +
	                    (parseFloat(styles.borderTopWidth) || 0) +
	                    (parseFloat(styles.borderBottomWidth) || 0);
	                if (this.settings.property)
	                    item.el.style.setProperty(this.settings.property, `${maxHeightInRow - paddingAndBorder}px`);
	            }
	            if (this.settings.remove) {
	                if (this.settings.remove instanceof NodeList) {
	                    Array.from(this.settings.remove).forEach((el) => {
	                        if (item.el === el && this.settings.property && el instanceof HTMLElement) {
	                            this._resetStyle(el, this.settings.property);
	                        }
	                    });
	                }
	                else if (item.el === this.settings.remove && this.settings.property) {
	                    this._resetStyle(item.el, this.settings.property);
	                }
	            }
	        });
	        this._remains.splice(0, processingTargets.length);
	        if (0 < this._remains.length) {
	            this._process();
	        }
	    }
	    _validateProperty(value) {
	        return String(value)
	            .toLowerCase()
	            .match(/^([a-z-]{2,})/);
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
