interface Settings {
    elements?: string | null;
    byRow?: boolean | null;
    target?: HTMLElement | null;
    attributeName?: string | null;
    attributeValue?: string | null;
    property: string;
    remove?: HTMLElement | null;
    events?: boolean | null;
    throttle?: number | null;
    beforeUpdate?: any | null;
    afterUpdate?: any | null;
}
export {
    Settings
}