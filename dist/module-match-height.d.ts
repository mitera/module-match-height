import { Settings } from "./types";
export type { Settings };
export default class MatchHeight {
    private wrapEl;
    private settings;
    private property;
    private update;
    private _ready;
    private _throttleTimer;
    constructor(wrapEl: HTMLElement, settings?: Settings);
    _init(): void;
    _unbind(): void;
    _remove(): void;
    _throttle(fn: () => void, threshold: number): () => void;
    _applyAll(): void;
    _applyDataApi(attributeName: string): void;
    _apply(): void;
    _update(elements: HTMLElement[]): void;
    private _process;
    private _getElements;
    private _getExcludedElements;
    private _validateAttributeName;
    _validateProperty(value: string): boolean;
    private _normalizeProperty;
    _resetStyle($that: HTMLElement, property: string): void;
}
