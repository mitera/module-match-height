import {Settings} from "./types";

export type {Settings};

type Item = {
    el: HTMLElement;
    top: number;
    height: number;
}

// Allowed attribute names: no characters that could alter the generated CSS selector
const ATTRIBUTE_NAME_PATTERN = /^[a-z][a-z0-9_-]*$/i;
// Allowed CSS property names, including vendor prefixed and custom properties
const PROPERTY_NAME_PATTERN = /^-{0,2}[a-z][a-z0-9-]*$/i;
// Max difference in px between the tops of two elements on the same row
const ROW_ERROR_THRESHOLD = 1;

export default class MatchHeight {

    private wrapEl: HTMLElement;
    private settings: Settings;
    private property: string;
    private update: () => void;
    private _ready: () => void;
    private _throttleTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(wrapEl: HTMLElement, settings?: Settings) {
        if (!wrapEl || typeof wrapEl.querySelectorAll !== 'function') {
            throw new TypeError('MatchHeight: wrapEl must be a DOM element');
        }
        this.wrapEl = wrapEl;

        // Default settings
        let default_settings: Settings = {
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
        }

        this.settings = {...default_settings, ...settings};

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
            } else {
                this._applyAll();
            }
            // Images and other media change the heights once loaded
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

    _throttle(fn: () => void, threshold: number) {
        let last = 0;
        return () => {
            const now = Date.now();
            clearTimeout(this._throttleTimer);
            if (last && now < last + threshold) {
                // Trailing call, so the last resize is always applied
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
        // Disable on instances that share a container, so the default data API groups are matched only once
        if (this.settings.dataApi) {
            this._applyDataApi('data-match-height');
            this._applyDataApi('data-mh');
        }

        if (this.settings.afterUpdate) {
            this.settings.afterUpdate();
        }
    }

    _applyDataApi(attributeName: string) {
        if (!this._validateAttributeName(attributeName)) return;

        const elements: HTMLElement[] = Array.from(this.wrapEl.querySelectorAll<HTMLElement>('[' + attributeName + ']'));

        const groups: Map<string, HTMLElement[]> = new Map();
        elements.forEach((el) => {
            const groupId = el.getAttribute(attributeName);
            if (groupId) {
                if (!groups.has(groupId)) {
                    groups.set(groupId, []);
                }
                groups.get(groupId)!.push(el);
            }
        });

        // Apply once per unique group instead of once per element
        groups.forEach((elements) => {
            this._update(elements);
        });
    }

    _apply() {
        this._update(this._getElements());
    }

    _update(elements: HTMLElement[]) {
        if ( elements.length === 0 ) return;

        // remove all height before
        elements.forEach( ( el ) => {
            this._resetStyle(el, this.property);
        } );

        const excluded = this._getExcludedElements();
        const items: Item[] = elements
            .filter((el) => !excluded.includes(el))
            // Skip elements that are not rendered (e.g. display: none): their height would be 0
            .filter((el) => el.getClientRects().length > 0)
            .map((el): Item => ({ el, top: 0, height: 0 }));

        this._process(items);
    }

    private _process(remains: Item[]) {

        while (remains.length > 0) {

            // Measure again on each row: heights applied to the previous rows can move the next ones
            remains.forEach( ( item ) => {

                const bb = item.el.getBoundingClientRect();

                item.top    = this.settings.byRow ? bb.top : 0;
                item.height = bb.height;

            } );

            remains.sort( ( a, b ) => a.top - b.top);

            const processingTop = remains[0].top;
            const processingTargets = remains.filter(item => Math.abs(item.top - processingTop) <= ROW_ERROR_THRESHOLD);
            remains = remains.slice(processingTargets.length);

            // A single item in a row has nothing to match, unless a target is set
            if (processingTargets.length < 2 && !this.settings.target) continue;

            let maxHeightInRow = 0;
            if (this.settings.target) maxHeightInRow = this.settings.target.getBoundingClientRect().height;
            else maxHeightInRow = Math.max(...processingTargets.map((item: Item) => item.height));

            processingTargets.forEach((item: Item) => {

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

    private _getElements(): HTMLElement[] {
        const opts = this.settings;
        if (opts.elements && opts.elements.trim() !== '') {
            return Array.from(this.wrapEl.querySelectorAll<HTMLElement>(opts.elements));
        }
        if (opts.attributeName && this._validateAttributeName(opts.attributeName) && opts.attributeValue && opts.attributeValue.trim() !== '') {
            const attributeName = opts.attributeName;
            const attributeValue = opts.attributeValue;
            // Compare the value in JS instead of building a selector with it, so it needs no escaping
            return Array.from(this.wrapEl.querySelectorAll<HTMLElement>('[' + attributeName + ']'))
                .filter((el) => el.getAttribute(attributeName) === attributeValue);
        }
        return [];
    }

    private _getExcludedElements(): Element[] {
        const remove = this.settings.remove;
        if (!remove) return [];
        if (remove instanceof Element) return [remove];
        return Array.from(remove);
    }

    private _validateAttributeName(value: string): boolean {
        return ATTRIBUTE_NAME_PATTERN.test(String(value));
    }

    _validateProperty(value: string): boolean {
        return PROPERTY_NAME_PATTERN.test(String(value));
    }

    // style.setProperty() silently ignores camelCase names (e.g. minHeight), so convert them to kebab-case
    private _normalizeProperty(value: string): string {
        const property = String(value).trim();
        if (property.startsWith('--')) return property;
        return property.replace(/[A-Z]/g, (char) => '-' + char.toLowerCase());
    }

    _resetStyle($that: HTMLElement, property: string) {
        property = this._normalizeProperty(property);
        if (this._validateProperty(property)) {
            $that.style.setProperty(property, '');
            if ($that.getAttribute('style') === '') {
                $that.removeAttribute('style');
            }
        }
    }
}
