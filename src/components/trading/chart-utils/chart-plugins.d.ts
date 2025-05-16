
import { Plugin } from 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    crosshair?: {
      line?: {
        color?: string;
        width?: number;
        dashPattern?: number[];
      };
      sync?: {
        enabled?: boolean;
      };
      zoom?: {
        enabled?: boolean;
      };
    };
    zoom?: {
      pan?: {
        enabled?: boolean;
        mode?: 'x' | 'y' | 'xy';
      };
      zoom?: {
        wheel?: {
          enabled?: boolean;
        };
        pinch?: {
          enabled?: boolean;
        };
        mode?: 'x' | 'y' | 'xy';
      };
    };
    priceAxis?: {
      position?: 'left' | 'right';
      width?: number;
      background?: string;
    };
  }
}
