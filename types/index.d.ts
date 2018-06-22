declare global {
    interface Window {
        ScrollOut: typeof ScrollOut
    }
}

declare interface IScrollOutOptions {
   scope?: Node | string;
   targets?: Node | NodeList | Node[] | string;
   inClass?: string;
   outClass?: string;
   once?: false; 
   offset?: number;
   threshold?: number;
}

declare function ScrollOut(options: IScrollOutOptions): ScrollOut;

declare interface ScrollOut {
    index(): void;
    update(): void;
    teardown(): void;
}
