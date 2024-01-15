/**
 * vanilla-match-height v1.2.1 by @mitera
 * Simone Miterangelis <simone@mite.it>
 * License: MIT
 */
import { Settings, IMatchHeight } from "./types";
declare class MatchHeight implements IMatchHeight {
    private wrapEl;
    private settings;
    /**
     * matchHeight
     *
     * @param {HTMLElement} wrapEl
     * @param {Settings} settings
     * constructor
     */
    constructor(wrapEl: HTMLElement, settings: Settings);
    /**
     * bind events
     */
    _bind(): void;
    /**
     * Initialize the application
     */
    _init(): void;
    /**
     * Unbind events
     */
    _unbind(): void;
    /**
     * Merge two objects
     *
     * @param {Settings} o1 Object 1
     * @param {Settings} o2 Object 2
     * @return {Settings}
     */
    _merge(o1: any, o2: any): any;
    /**
     * _throttle
     * Throttle updates
     * @param {function} fn
     * @param {int} threshold
     */
    _throttle(fn: Function, threshold: number): () => void;
    /**
     * _applyAll
     * Initialize the common events
     * @param {MatchHeight} $this
     */
    _applyAll($this: MatchHeight): void;
    /**
     * _validateProperty
     * handle plugin options
     * @param {String} value
     */
    _validateProperty(value: string): RegExpMatchArray | null;
    /**
     * _parse
     * handle plugin options
     * @param {String} value
     */
    _parse(value: string): number;
    /**
     * _rows
     * utility function returns array of selections representing each row
     * (as displayed after float wrapping applied by browser)
     * @param {Array} elements
     */
    _rows(elements: [HTMLElement]): HTMLElement[][];
    /**
     * _applyDataApi
     * applies matchHeight to all elements with a data-match-height attribute
     * @param {String} property
     */
    _applyDataApi(property: string): void;
    /**
     *  _remove
     *  remove matchHeight to given elements
     */
    _remove(): void;
    /**
     *  _apply
     *  apply matchHeight to given elements
     */
    _apply(): void;
    /**
     *  _resetStyle
     * @param {HTMLElement} $that
     * @param {String} property
     */
    _resetStyle($that: HTMLElement, property: string): void;
}
export default MatchHeight;
