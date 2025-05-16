
import { Chart, Plugin } from 'chart.js';

// Create a custom plugin for custom y-axis price labels on the right
export const priceAxisPlugin: Plugin = {
  id: 'priceAxis',
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const yAxis = chart.scales['y'];
    
    if (!yAxis) return;
    
    // Get chart area dimensions
    const { top, bottom, right } = chart.chartArea;
    
    // Draw background for the price axis
    ctx.save();
    ctx.fillStyle = 'rgba(17, 24, 39, 0.7)';
    ctx.fillRect(right, top, 60, bottom - top);
    ctx.restore();
  }
};

// Custom crosshair plugin that draws a vertical line and horizontal line
export const crosshairPlugin: Plugin = {
  id: 'crosshair',
  defaults: {
    line: {
      color: 'rgba(107, 114, 128, 0.5)',
      width: 1,
      dashPattern: [3, 3],
    },
  },
  afterDraw: (chart, args, options: any) => {
    // Fix: Check if active exists and is an array with elements
    if (chart.tooltip?.active && Array.isArray(chart.tooltip.active) && chart.tooltip.active.length > 0) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip.active[0];
      const { x, y } = activePoint.element;
      const { top, bottom, left, right } = chart.chartArea;
      
      // Draw vertical crosshair
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(options.line.dashPattern || []);
      ctx.lineWidth = options.line.width || 1;
      ctx.strokeStyle = options.line.color || 'rgba(107, 114, 128, 0.5)';
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      
      // Draw horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      
      ctx.restore();
    }
  }
};

// Register custom plugins
export const registerCustomPlugins = () => {
  Chart.register(priceAxisPlugin, crosshairPlugin);
};
