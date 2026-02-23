import { Settings } from "types";
export default class MatchHeight {
    private wrapEl;
    private settings;
    private update;
    private _remains;
    constructor(wrapEl: HTMLElement, settings?: Settings);
    _init(): void;
    _unbind(): void;
    _remove(): void;
    _throttle(fn: Function, threshold: number): () => void;
    _applyAll(): void;
    _applyDataApi(property: string): void;
    _apply(): void;
    _update(elements: HTMLElement[]): void;
    private _rows;
    private _parse;
    private _process;
    _validateProperty(value: string): RegExpMatchArray | null;
    _resetStyle($that: HTMLElement, property: string): void;
}
