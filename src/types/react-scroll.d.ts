
declare module 'react-scroll' {
  import * as React from 'react';

  interface ScrollLinkProps extends React.HTMLProps<HTMLAnchorElement> {
    to: string;
    spy?: boolean;
    smooth?: boolean;
    offset?: number;
    duration?: number;
    delay?: number;
    isDynamic?: boolean;
    onSetActive?: (to: string) => void;
    onSetInactive?: (to: string) => void;
    ignoreCancelEvents?: boolean;
    containerId?: string;
  }

  interface ScrollElementProps {
    name: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  export class Link extends React.Component<ScrollLinkProps> {}
  export class Element extends React.Component<ScrollElementProps> {}
  export class Events {
    static scrollEvent: {
      register: (eventName: string, callback: (to: string, element: HTMLElement) => void) => void;
      remove: (eventName: string) => void;
    };
  }
  export function animateScroll(options?: any): void;
  export const scrollSpy: {
    update: () => void;
  };
}
