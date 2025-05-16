
import Chart from 'chart.js/auto';

// Register custom plugins
export function registerCustomPlugins() {
  // Register custom plugins here if needed
}

// Crosshair plugin
export const crosshairPlugin = {
  id: 'crosshair',
  defaults: {
    line: {
      color: 'rgba(100, 100, 100, 0.6)',
      width: 1,
      dashPattern: [5, 5]
    },
    sync: {
      enabled: false,
      group: 1,
      suppressTooltips: false
    },
    snap: {
      enabled: false
    },
    zoom: {
      enabled: false,
      zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',
      zoomboxBorderColor: '#48F',
      zoomButtonText: 'Reset Zoom',
      zoomButtonClass: 'reset-zoom'
    },
    callbacks: {
      beforeZoom: function(start, end) {
        return true;
      },
      afterZoom: function(start, end) {}
    }
  },

  afterInit: function(chart) {
    if (chart.config.options.scales?.x?.min !== undefined && chart.config.options.scales?.x?.max !== undefined) {
      const minValue = chart.config.options.scales.x.min;
      const maxValue = chart.config.options.scales.x.max;
      this.initZoom(chart, minValue, maxValue);
    }
  },

  afterEvent: function(chart, event) {
    if (chart.tooltip && chart.tooltip.active && Array.isArray(chart.tooltip.dataPoints) && chart.tooltip.dataPoints.length > 0) {
      // Access tooltip properties safely
      const tooltip = chart.tooltip;
      
      // Extract values from active tooltip point
      const activePoint = tooltip.dataPoints[0];
      const datasetIndex = activePoint.datasetIndex;
      const index = activePoint.dataIndex;

      // Get coordinates of the active point
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta && meta.data && meta.data[index]) {
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        
        const x = meta.data[index].x;
        const y = meta.data[index].y;
        
        // Save crosshair positions
        chart.crosshair = {
          x: x,
          y: y,
          xValue: activePoint.parsed.x,
          yValue: activePoint.parsed.y
        };
        
        // Force redraw
        chart.draw();
      }
    } else {
      // Clear crosshair data
      delete chart.crosshair;
      chart.draw();
    }
  },

  afterDraw: function(chart, easing) {
    if (chart.tooltip && chart.tooltip.opacity > 0 && chart.crosshair) {
      const ctx = chart.ctx;
      const x = chart.crosshair.x;
      const y = chart.crosshair.y;
      const plotArea = chart.chartArea;
      
      // Draw crosshair lines
      ctx.save();
      
      // Set line properties
      ctx.lineWidth = this.options.line.width;
      ctx.strokeStyle = this.options.line.color;
      
      if (this.options.line.dashPattern && this.options.line.dashPattern.length > 0) {
        ctx.setLineDash(this.options.line.dashPattern);
      }
      
      // Draw vertical line
      ctx.beginPath();
      ctx.moveTo(x, plotArea.top);
      ctx.lineTo(x, plotArea.bottom);
      ctx.stroke();
      
      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(plotArea.left, y);
      ctx.lineTo(plotArea.right, y);
      ctx.stroke();
      
      ctx.restore();
    }
  },

  initZoom: function(chart, minValue, maxValue) {
    // Implementation of zoom init if needed
  }
};

// Price axis plugin
export const priceAxisPlugin = {
  id: 'priceAxis',

  afterDraw: function(chart, easing) {
    if (chart.tooltip && chart.tooltip.opacity > 0 && chart.crosshair) {
      const ctx = chart.ctx;
      const value = chart.crosshair.yValue;
      const y = chart.crosshair.y;
      
      // Draw price tag on right axis
      if (chart.scales.y) {
        const yScale = chart.scales.y;
        const isSmallChart = chart.height < 300;
        
        const width = isSmallChart ? 45 : 55;
        const height = isSmallChart ? 16 : 20;
        const fontSize = isSmallChart ? 10 : 12;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(chart.chartArea.right, y - height / 2, width, height);
        
        // Border 
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(chart.chartArea.right, y - height / 2, width, height);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Format price based on value range
        const formattedValue = Math.abs(value) < 0.1 
          ? value.toFixed(4) 
          : Math.abs(value) < 1 
            ? value.toFixed(3) 
            : Math.abs(value) < 10 
              ? value.toFixed(2) 
              : value.toFixed(2);
        
        ctx.fillText(formattedValue, chart.chartArea.right + width / 2, y);
        
        ctx.restore();
      }
    }
  }
};

// Function to create a chart tooltip formatter
export function createTooltipFormatter(prefixText = '', tooltipCallbacks = {}) {
  return {
    enabled: true,
    mode: 'index',
    intersect: false,
    animation: {
      duration: 100
    },
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleColor: 'rgba(255, 255, 255, 0.8)',
    titleFont: {
      weight: 'normal',
      size: 12
    },
    bodyColor: 'rgba(255, 255, 255, 0.8)',
    bodyFont: {
      weight: 'normal',
      size: 12
    },
    borderColor: 'rgba(100, 100, 100, 0.8)',
    borderWidth: 1,
    cornerRadius: 3,
    padding: 8,
    position: 'nearest',
    caretSize: 5,
    caretPadding: 5,
    ...tooltipCallbacks
  };
}
