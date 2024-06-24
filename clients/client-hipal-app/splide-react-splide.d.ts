declare module '@splidejs/react-splide' {
    import * as React from 'react';
  
    interface SplideProps {
      options?: any;
      hasSliderWrapper?: boolean;
      hasAutoplayProgress?: boolean;
      extensions?: any;
      transition?: string;
      [key: string]: any;
    }
  
    export class Splide extends React.Component<SplideProps, any> {}
  
    interface SplideSlideProps {
      className?: string;
      style?: React.CSSProperties;
      tag?: string;
      [key: string]: any;
    }
  
    export class SplideSlide extends React.Component<SplideSlideProps, any> {}
  }
  