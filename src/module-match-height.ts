import {Settings} from "types";

type Item = {
    el: HTMLElement;
    top: number;
    height: number;
    attribute: string;
}

export default class MatchHeight {

    private wrapEl: HTMLElement;
    private settings: Settings;
    private update: any;
    private _remains: Item[] = [];

    constructor(wrapEl: HTMLElement, settings?: Settings) {
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
            events: true,
            throttle: 80,
            beforeUpdate: null,
            afterUpdate: null
        }

        this.settings = {...default_settings, ...settings} as Settings;

        if (this.settings.property && !this._validateProperty(this.settings.property)) {
            this.settings.property = 'height';
        }

        if (this.settings.events) {
            this.update = this._applyAll.bind(this);
            if (document.readyState !== 'loading') {
                this._applyAll();
            } else {
                document.addEventListener( 'DOMContentLoaded', this.update, { once: true } );
            }
            if (this.settings.throttle && this.settings.throttle > 0) {
                this.update = this._throttle( this.update, this.settings.throttle );
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
        let elements: HTMLElement[] = []
        let opts = this.settings;
        if (opts.elements) {
            elements = Array.from(this.wrapEl.querySelectorAll(opts.elements));
        } else {
            if (opts.attributeName && opts.attributeValue) {
                elements = Array.from(this.wrapEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]'));
            }
        }
        elements.forEach((item) => {
            if (opts.property) item.style.setProperty(opts.property, '');
            if (item.getAttribute('style') === '') item.removeAttribute('style');
        });
    }

    _throttle(fn: Function, threshold: number) {
        let last: number, deferTimer: any;
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

    _applyDataApi(property: string) {
        let elements: HTMLElement[] = Array.from(this.wrapEl.querySelectorAll('[' + property + ']'));
        elements.forEach( ( item ) => {
            this._resetStyle(item, this.settings.property);
        } );

        const groups: Map<string, HTMLElement[]> = new Map();
        elements.forEach((el) => {
            const groupId = el.getAttribute(property);
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
        let opts = this.settings;
        let elements: HTMLElement[] = []
        if (opts.elements && opts.elements.trim() != '') {
            elements = Array.from(this.wrapEl.querySelectorAll(opts.elements));
        } else {
            if (opts.attributeName && this._validateProperty(opts.attributeName) && opts.attributeValue && opts.attributeValue.trim() != '') {
                elements = Array.from(this.wrapEl.querySelectorAll('[' + opts.attributeName + '="' + opts.attributeValue + '"]'));
            }
        }
        this._update(elements);
    }

    _update(elements: HTMLElement[], attribute: string = this.settings.attributeName || 'data-mh') {
        if ( elements.length === 0 ) return;

        this._remains = Array.prototype.map.call( elements, ( el: HTMLElement ): Item => {

            return {
                el,
                top: 0,
                height: 0,
                attribute: el.getAttribute(attribute) || attribute
            };

        } ) as Item[];
        // remove all height before
        this._remains.forEach( ( item ) => {
            this._resetStyle(item.el, this.settings.property);
        } );

        this._process();
    }

    private _rows(elements: Item[]) {
        let tolerance: number = 1,
            lastTop: number = -1,
            listRows: Item[][] = [],
            rows: Item[] = [];

        // group elements by their top position
        elements.forEach(($that) => {

            let top = $that.top;

            // if the row top is the same, add to the row group
            if (lastTop != -1 && Math.floor(Math.abs(lastTop - top)) >= tolerance) {
                listRows.push(rows);
                rows = [];
                lastTop = -1;
            }
            rows.push($that);

            // keep track of the last row top
            lastTop = top;
        });
        listRows.push(rows);

        return listRows;
    }

    private _parse(value: string) {
        // parse value and convert NaN to 0
        return parseFloat(value) || 0;
    }

    private _process() {

        this._remains.forEach( ( item ) => {

            const bb = item.el.getBoundingClientRect();

            item.top    = this.settings.byRow ? (bb.top - this._parse(window.getComputedStyle(item.el).getPropertyValue('margin-top'))) : 0;
            item.height = bb.height;

        } );

        this._remains.sort( ( a, b ) => a.top - b.top && a.attribute.localeCompare( b.attribute ));

        let rows = this._rows(this._remains);
        let processingTargets = rows[0];

        let maxHeightInRow = 0;
        if (this.settings.target) maxHeightInRow = this.settings.target.getBoundingClientRect().height;
        else maxHeightInRow = Math.max(...processingTargets.map((item: Item) => item.height));

        processingTargets.forEach((item: Item) => {

            const styles = window.getComputedStyle(item.el);
            const isBorderBox = styles.boxSizing === 'border-box';

            if (isBorderBox) {

                if (this.settings.property) item.el.style.setProperty(this.settings.property, `${maxHeightInRow}px`);

            } else {
                const paddingAndBorder =
                    (parseFloat(styles.paddingTop) || 0) +
                    (parseFloat(styles.paddingBottom) || 0) +
                    (parseFloat(styles.borderTopWidth) || 0) +
                    (parseFloat(styles.borderBottomWidth) || 0);
                if (this.settings.property) item.el.style.setProperty(this.settings.property, `${maxHeightInRow - paddingAndBorder}px`);
            }

            if (this.settings.remove) {
                if (this.settings.remove instanceof NodeList) {
                    Array.from(this.settings.remove).forEach((el) => {
                        if (item.el === el && this.settings.property && el instanceof HTMLElement) {
                            this._resetStyle(el, this.settings.property);
                        }
                    });
                } else if (item.el === this.settings.remove && this.settings.property) {
                    this._resetStyle(item.el, this.settings.property);
                }
            }
        });

        this._remains.splice(0, processingTargets.length);
        if (0 < this._remains.length) {
            this._process()
        }
    }

    _validateProperty(value: string) {
        return String(value)
            .toLowerCase()
            .match(
                /^([a-z-]{2,})/
            );
    }

    _resetStyle($that: HTMLElement, property: string) {
        if (this._validateProperty(property)) {
            $that.style.setProperty(property, '');
            if ($that.getAttribute('style') === '') {
                $that.removeAttribute('style');
            }
        }
    }
}