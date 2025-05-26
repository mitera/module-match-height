interface Settings {
    elements?: string | null;
    byRow?: boolean | null;
    target?: HTMLElement | null;
    attributeName?: string | null;
    attributeValue?: string | null;
    property?: string | null;
    remove?: HTMLElement | null;
    events?: boolean | null;
    throttle?: number | null;
    beforeUpdate?: any | null;
    afterUpdate?: any | null;
}
interface IMatchHeight {
    _merge(o1: Settings, o2: Settings): Settings;
    _init(): void;
    _unbind(): void;
    _throttle(fn: Function, threshold: number): () => void;
    _applyAll(): void;
    _validateProperty(value?: string | null): RegExpMatchArray | null;
    _parse(value: string): number;
    _rows(elements: [HTMLElement]): HTMLElement[][];
    _applyDataApi(property: string): void;
    _remove(): void;
    _apply(): void;
    _resetStyle($that: HTMLElement, property: string): void;
}

export {
    Settings,
    IMatchHeight
}