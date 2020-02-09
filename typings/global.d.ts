import { DOMWindow } from 'jsdom';

declare global {
  namespace NodeJS {
    interface Global {
      window: DOMWindow;
      document: Document;
      navigator: {
        userAgent: string;
      };
      XMLHttpRequest: XMLHttpRequest;
    }
  }
}
