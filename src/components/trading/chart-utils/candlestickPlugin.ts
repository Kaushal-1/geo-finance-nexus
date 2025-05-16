
import { Chart, ChartType, LineController, LineElement, PointElement, ChartTypeRegistry, LineOptions } from 'chart.js';

// Define a custom interface for parsed data with OHLC properties
interface CandlestickParsedData {
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

// Extend LineOptions to include candlestick properties
interface CandlestickOptions extends LineOptions {
  candlestickWidth?: number;
  borderColorUp?: string;
  borderColorDown?: string;
  backgroundColorUp?: string;
  backgroundColorDown?: string;
}

// Custom Candlestick element for Chart.js
class CandlestickElement extends LineElement {
  candlestickWidth: number;
  o: number;
  h: number;
  l: number;
  c: number;
  
  constructor(cfg: any) {
    super(cfg);
    this.candlestickWidth = cfg.candlestickWidth || 8;
    this.o = cfg.o || 0;
    this.h = cfg.h || 0;
    this.l = cfg.l || 0;
    this.c = cfg.c || 0;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    const { x, options } = this;
    
    // Skip drawing if missing required data
    if (this.o === undefined || this.h === undefined || 
        this.l === undefined || this.c === undefined) {
      return;
    }
    
    const opts = options as CandlestickOptions;
    const width = opts.candlestickWidth || 8;
    const halfWidth = width / 2;
    
    // Set colors based on movement
    const borderColor = this.c >= this.o 
      ? opts.borderColorUp || '#22c55e' 
      : opts.borderColorDown || '#ef4444';
      
    const fillColor = this.c >= this.o 
      ? opts.backgroundColorUp || 'rgba(34, 197, 94, 0.1)' 
      : opts.backgroundColorDown || 'rgba(239, 68, 68, 0.1)';
    
    // Draw candle body
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = options.borderWidth || 1;
    
    const bodyHeight = Math.abs(this.c - this.o);
    const bodyY = Math.min(this.c, this.o);
    
    // Draw wick (high to low)
    ctx.beginPath();
    ctx.moveTo(x, this.l);
    ctx.lineTo(x, this.h);
    ctx.stroke();
    
    // Draw body (open to close rectangle)
    ctx.fillRect(x - halfWidth, bodyY, width, bodyHeight);
    ctx.strokeRect(x - halfWidth, bodyY, width, bodyHeight);
  }
}

// Define controller for the candlestick chart type
class CandlestickController extends LineController {
  static id = 'candlestick';
  static defaults = {
    ...LineController.defaults,
    datasetElementType: 'candlestick',
    candlestickWidth: 8,
    borderColorUp: '#22c55e',
    borderColorDown: '#ef4444',
    backgroundColorUp: 'rgba(34, 197, 94, 0.1)',
    backgroundColorDown: 'rgba(239, 68, 68, 0.1)',
  };

  // Override the default data element type
  dataElementType = CandlestickElement;

  // Override to properly parse candlestick data
  parseObjectData(meta: any, data: any, start: number, count: number) {
    const parsed: CandlestickParsedData[] = [];
    for (let i = 0; i < count; ++i) {
      const index = i + start;
      const item = data[index];
      if (item) {
        parsed.push({
          x: i,
          o: item.o,
          h: item.h,
          l: item.l,
          c: item.c
        });
      }
    }
    return parsed;
  }

  // Override to update element with correct coordinates
  updateElement(element: any, index: number, properties: any, mode: any) {
    const me = this;
    const parsed = me.getParsed(index);
    
    if (parsed) {
      // Use type assertion to handle parsed data
      const parsedData = parsed as unknown as CandlestickParsedData;
      
      // Use the scales to get pixel values
      const xScale = me.getScaleForId('x');
      const yScale = me.getScaleForId('y');
      
      if (xScale && yScale) {
        properties.x = xScale.getPixelForValue(index);
        properties.o = yScale.getPixelForValue(parsedData.o);
        properties.h = yScale.getPixelForValue(parsedData.h);
        properties.l = yScale.getPixelForValue(parsedData.l);
        properties.c = yScale.getPixelForValue(parsedData.c);
      }
    }
    
    super.updateElement(element, index, properties, mode);
  }
  
  // Required methods for scale access
  getScaleForId(scaleID: string) {
    return this.chart.scales[scaleID];
  }
}

// Register the custom chart type
Chart.register(CandlestickController, CandlestickElement);

// TypeScript augmentation for Chart.js
declare module 'chart.js' {
  interface ChartTypeRegistry {
    candlestick: {
      chartOptions: any;
      datasetOptions: LineOptions & {
        candlestickWidth?: number;
        borderColorUp?: string;
        borderColorDown?: string;
        backgroundColorUp?: string;
        backgroundColorDown?: string;
      };
      defaultDataPoint: {
        o: number;
        h: number;
        l: number;
        c: number;
      };
      metaExtensions: {};
      parsedDataType: CandlestickParsedData;
      scales: typeof Chart.defaults.scales;
    };
  }
}

export { CandlestickController, CandlestickElement };

export type CandlestickChartType = ChartType & 'candlestick';
