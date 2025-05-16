
import { Chart, ChartType, LineController, LineElement, PointElement, ChartTypeRegistry } from 'chart.js';

// Custom Candlestick element for Chart.js
class CandlestickElement extends LineElement {
  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, options } = this;
    
    const { o, h, l, c } = this.parsed;
    
    // Skip drawing if missing required data
    if (o === undefined || h === undefined || l === undefined || c === undefined) {
      return;
    }
    
    const width = options.candlestickWidth || 8;
    const halfWidth = width / 2;
    
    // Set colors based on movement
    const borderColor = c >= o ? options.borderColorUp || '#22c55e' : options.borderColorDown || '#ef4444';
    const fillColor = c >= o ? options.backgroundColorUp || 'rgba(34, 197, 94, 0.1)' : options.backgroundColorDown || 'rgba(239, 68, 68, 0.1)';
    
    // Draw candle body
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = options.borderWidth || 1;
    
    const bodyHeight = Math.abs(c - o);
    const bodyY = Math.min(c, o);
    
    // Draw wick (high to low)
    ctx.beginPath();
    ctx.moveTo(x, l);
    ctx.lineTo(x, h);
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
    const parsed: any[] = [];
    let i, ilen, item;
    
    for (i = 0, ilen = data.length; i < ilen; ++i) {
      item = data[i];
      parsed.push({
        x: i,
        o: item.o,
        h: item.h,
        l: item.l,
        c: item.c
      });
    }
    
    return parsed;
  }

  // Override to update element with correct coordinates
  updateElement(element: any, index: number, properties: any, mode: string) {
    const parsed = this.getParsed(index);
    
    properties.x = this.getPixelForValue(parsed.x, index);
    properties.o = this.getPixelForValue(parsed.o, index);
    properties.h = this.getPixelForValue(parsed.h, index);
    properties.l = this.getPixelForValue(parsed.l, index);
    properties.c = this.getPixelForValue(parsed.c, index);
    
    super.updateElement(element, index, properties, mode);
  }
}

// Register the custom chart type
Chart.register(CandlestickController, CandlestickElement);

// TypeScript augmentation for Chart.js
declare module 'chart.js' {
  interface ChartTypeRegistry {
    candlestick: {
      chartOptions: ChartTypeRegistry['line']['chartOptions'];
      datasetOptions: ChartTypeRegistry['line']['datasetOptions'] & {
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
      metaExtensions: ChartTypeRegistry['line']['metaExtensions'];
      parsedDataType: ChartTypeRegistry['line']['parsedDataType'] & {
        o: number;
        h: number;
        l: number;
        c: number;
      };
      scales: ChartTypeRegistry['line']['scales'];
    };
  }
}

export { CandlestickController, CandlestickElement };

export type CandlestickChartType = ChartType & 'candlestick';
