import { Settings, IMatchHeight } from "./types";
declare class MatchHeight implements IMatchHeight {
    private wrapEl;
    private settings;
    private update;
    constructor(wrapEl: HTMLElement, settings: Settings);
    _init(): void;
    _unbind(): void;
    _merge(o1: any, o2: any): any;
    _throttle(fn: Function, threshold: number): () => void;
    _applyAll(): void;
    _validateProperty(value: string): RegExpMatchArray | null;
    _parse(value: string): number;
    _rows(elements: [HTMLElement]): HTMLElement[][];
    _applyDataApi(property: string): void;
    _remove(): void;
    _apply(): void;
    _resetStyle($that: HTMLElement, property: string): void;
}
export default MatchHeight;
