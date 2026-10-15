interface Settings {
    elements?: string | null;
    byRow?: boolean | null;
    target?: HTMLElement | null;
    attributeName?: string | null;
    attributeValue?: string | null;
    property?: string | null;
    remove?: HTMLElement | NodeListOf<HTMLElement> | HTMLElement[] | null;
    dataApi?: boolean | null;
    events?: boolean | null;
    throttle?: number | null;
    beforeUpdate?: (() => void) | null;
    afterUpdate?: (() => void) | null;
}
export {
    Settings
}
