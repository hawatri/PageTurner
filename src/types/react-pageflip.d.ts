declare module 'react-pageflip' {
  import * as React from 'react';

  interface PageFlip {
    getPageCount: () => number;
    getCurrentPageIndex: () => number;
    turnToPage: (page: number) => void;
    turnToNextPage: () => void;
    turnToPrevPage: () => void;
    flipNext: (corner?: 'top' | 'bottom') => void;
    flipPrev: (corner?: 'top' | 'bottom') => void;
    getFlipObject: () => any;
  }
  
  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onFlip?: (e: { data: number }) => void;
    onChangeState?: (e: { data: 'user_fold' | 'fold_corner' | 'flipping' | 'read' }) => void;
    onChangeOrientation?: (e: { data: 'portrait' | 'landscape' }) => void;
    onInit?: (e: { data: object; object: PageFlip }) => void;
    children: React.ReactNode;
    ref: React.Ref<any>;
  }

  class HTMLFlipBook extends React.Component<HTMLFlipBookProps> {
    pageFlip(): PageFlip;
  }

  export default HTMLFlipBook;
}
