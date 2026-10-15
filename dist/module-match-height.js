/*!
 * @author Simone Miterangelis <simone@mite.it>
 * module-match-height v1.2.0 by @mitera
 * https://github.com/mitera/module-match-height
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MatchHeight = factory());
})(this, (function () { 'use strict';

	const ATTRIBUTE_NAME_PATTERN = /^[a-z][a-z0-9_-]*$/i;
	const PROPERTY_NAME_PATTERN = /^-{0,2}[a-z][a-z0-9-]*$/i;
	const ROW_ERROR_THRESHOLD = 1;
	class MatchHeight {
	    constructor(wrapEl, settings) {
	        if (!wrapEl || typeof wrapEl.querySelectorAll !== 'function') {
	            throw new TypeError('MatchHeight: wrapEl must be a DOM element');
	        }
	        this.wrapEl = wrapEl;
	        let default_settings = {
	            elements: null,
	            byRow: true,
	            target: null,
	            attributeName: null,
	            attributeValue: null,
	            property: 'height',
	            remove: null,
	            dataApi: true,
	            events: true,
	            throttle: 80,
	            beforeUpdate: null,
	            afterUpdate: null
	        };
	        this.settings = Object.assign(Object.assign({}, default_settings), settings);
	        const property = this.settings.property ? this._normalizeProperty(this.settings.property) : '';
	        this.property = this._validateProperty(property) ? property : 'height';
	        this._ready = this._applyAll.bind(this);
	        this.update = this._ready;
	        if (this.settings.events) {
	            if (this.settings.throttle && this.settings.throttle > 0) {
	                this.update = this._throttle(this._ready, this.settings.throttle);
	            }
	            if (document.readyState === 'loading') {
	                document.addEventListener('DOMContentLoaded', this._ready, { once: true });
	            }
	            else {
	                this._applyAll();
	            }
	            if (document.readyState !== 'complete') {
	                window.addEventListener('load', this._ready, { once: true });
	            }
	            this._init();
	        }
	    }
	    _init() {
	        window.addEventListener("resize", this.update);
	        window.addEventListener("orientationchange", this.update);
	    }
	    _unbind() {
	        document.removeEventListener('DOMContentLoaded', this._ready);
	        window.removeEventListener('load', this._ready);
	        window.removeEventListener("resize", this.update);
	        window.removeEventListener("orientationchange", this.update);
	        clearTimeout(this._throttleTimer);
	    }
	    _remove() {
	        this._getElements().forEach((item) => {
	            this._resetStyle(item, this.property);
	        });
	    }
	    _throttle(fn, threshold) {
	        let last = 0;
	        return () => {
	            const now = Date.now();
	            clearTimeout(this._throttleTimer);
	            if (last && now < last + threshold) {
	                this._throttleTimer = setTimeout(() => {
	                    last = Date.now();
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
	        if (this.settings.beforeUpdate) {
	            this.settings.beforeUpdate();
	        }
	        this._apply();
	        const attributeName = this.settings.attributeName;
	        if (attributeName && this._validateAttributeName(attributeName)
	            && attributeName !== 'data-match-height' && attributeName !== 'data-mh') {
	            this._applyDataApi(attributeName);
	        }
	        if (this.settings.dataApi) {
	            this._applyDataApi('data-match-height');
	            this._applyDataApi('data-mh');
	        }
	        if (this.settings.afterUpdate) {
	            this.settings.afterUpdate();
	        }
	    }
	    _applyDataApi(attributeName) {
	        if (!this._validateAttributeName(attributeName))
	            return;
	        const elements = Array.from(this.wrapEl.querySelectorAll('[' + attributeName + ']'));
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
	            this._update(elements);
	        });
	    }
	    _apply() {
	        this._update(this._getElements());
	    }
	    _update(elements) {
	        if (elements.length === 0)
	            return;
	        elements.forEach((el) => {
	            this._resetStyle(el, this.property);
	        });
	        const excluded = this._getExcludedElements();
	        const items = elements
	            .filter((el) => !excluded.includes(el))
	            .filter((el) => el.getClientRects().length > 0)
	            .map((el) => ({ el, top: 0, height: 0 }));
	        this._process(items);
	    }
	    _process(remains) {
	        while (remains.length > 0) {
	            remains.forEach((item) => {
	                const bb = item.el.getBoundingClientRect();
	                item.top = this.settings.byRow ? bb.top : 0;
	                item.height = bb.height;
	            });
	            remains.sort((a, b) => a.top - b.top);
	            const processingTop = remains[0].top;
	            const processingTargets = remains.filter(item => Math.abs(item.top - processingTop) <= ROW_ERROR_THRESHOLD);
	            remains = remains.slice(processingTargets.length);
	            if (processingTargets.length < 2 && !this.settings.target)
	                continue;
	            let maxHeightInRow = 0;
	            if (this.settings.target)
	                maxHeightInRow = this.settings.target.getBoundingClientRect().height;
	            else
	                maxHeightInRow = Math.max(...processingTargets.map((item) => item.height));
	            processingTargets.forEach((item) => {
	                const styles = window.getComputedStyle(item.el);
	                let value = maxHeightInRow;
	                if (styles.boxSizing !== 'border-box') {
	                    value -=
	                        (parseFloat(styles.paddingTop) || 0) +
	                            (parseFloat(styles.paddingBottom) || 0) +
	                            (parseFloat(styles.borderTopWidth) || 0) +
	                            (parseFloat(styles.borderBottomWidth) || 0);
	                }
	                item.el.style.setProperty(this.property, `${Math.max(0, value)}px`);
	            });
	        }
	    }
	    _getElements() {
	        const opts = this.settings;
	        if (opts.elements && opts.elements.trim() !== '') {
	            return Array.from(this.wrapEl.querySelectorAll(opts.elements));
	        }
	        if (opts.attributeName && this._validateAttributeName(opts.attributeName) && opts.attributeValue && opts.attributeValue.trim() !== '') {
	            const attributeName = opts.attributeName;
	            const attributeValue = opts.attributeValue;
	            return Array.from(this.wrapEl.querySelectorAll('[' + attributeName + ']'))
	                .filter((el) => el.getAttribute(attributeName) === attributeValue);
	        }
	        return [];
	    }
	    _getExcludedElements() {
	        const remove = this.settings.remove;
	        if (!remove)
	            return [];
	        if (remove instanceof Element)
	            return [remove];
	        return Array.from(remove);
	    }
	    _validateAttributeName(value) {
	        return ATTRIBUTE_NAME_PATTERN.test(String(value));
	    }
	    _validateProperty(value) {
	        return PROPERTY_NAME_PATTERN.test(String(value));
	    }
	    _normalizeProperty(value) {
	        const property = String(value).trim();
	        if (property.startsWith('--'))
	            return property;
	        return property.replace(/[A-Z]/g, (char) => '-' + char.toLowerCase());
	    }
	    _resetStyle($that, property) {
	        property = this._normalizeProperty(property);
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
