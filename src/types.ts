declare global {
    interface Window {
        ScrollOut: typeof ScrollOut
    }
}

export interface IScrollOutOptions {
   scope?: Node | string;
   scrollingElement?: Node | string;
   targets?: Node | NodeList | Node[] | string; 
   once?: false; 
   offset?: number;
   threshold?: number;
   cssProps?: boolean;
   onChange?: Function;
   onHidden?: Function;
   onShown?: Function;
}

export interface ScrollOut {
    (options: IScrollOutOptions): ScrollOut;
}

export interface ScrollOut {
    index(): void;
    update(): void;
    teardown(): void;
}
