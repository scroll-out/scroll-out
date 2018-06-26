declare global {
    interface Window {
        ScrollOut: typeof ScrollOut
    }
}

declare interface IScrollOutOptions {
   scope?: Node | string;
   scrollingElement?: Node | string;
   targets?: Node | NodeList | Node[] | string; 
   once?: false; 
   offset?: number;
   threshold?: number;
   cssProps?: boolean;
}

declare function ScrollOut(options: IScrollOutOptions): ScrollOut;

declare interface ScrollOut {
    index(): void;
    update(): void;
    teardown(): void;
}
