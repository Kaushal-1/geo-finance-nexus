
import { ChartOptions } from 'chart.js';
import { darkThemeColors } from './chartConfig';

// Enhanced chart styling with grid patterns similar to TradingView
export const createEnhancedChartOptions = (showVolume = true): ChartOptions<'candlestick'> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 30,
        bottom: 10,
        left: 10
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.03)",
          tickLength: 10,
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 10
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        border: {
          display: false
        }
      },
      y: {
        position: 'right',
        grid: {
          color: "rgba(255, 255, 255, 0.03)",
          drawBorder: false,
          tickLength: 10,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 10
          },
          callback: (value) => `$${Number(value).toFixed(2)}`,
          padding: 10,
          count: 8,
        },
        border: {
          display: false
        }
      },
      ...(showVolume ? {
        y1: {
          position: 'left',
          grid: {
            drawOnChartArea: false,
            drawBorder: false,
          },
          ticks: {
            color: "#9ca3af",
            font: {
              family: "'Inter', sans-serif",
              size: 10
            },
            callback: (value) => {
              const numValue = Number(value);
              if (numValue >= 1000000) {
                return `${(numValue / 1000000).toFixed(1)}M`;
              } else if (numValue >= 1000) {
                return `${(numValue / 1000).toFixed(1)}K`;
              }
              return value;
            },
            count: 3,
            padding: 10,
          },
          border: {
            display: false
          }
        }
      } : {})
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          color: '#e5e7eb',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          usePointStyle: true,
          boxWidth: 6,
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 12,
          weight: 600 
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 11
        },
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        borderColor: 'rgba(107, 114, 128, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (context.dataset.yAxisID === 'y1') {
              // Format volume with commas
              return `${datasetLabel}: ${value.toLocaleString()}`;
            }
            
            // Format price with precision
            return `${datasetLabel}: $${value.toFixed(2)}`;
          },
          title: (tooltipItems) => {
            // Format the date for the tooltip title
            return tooltipItems[0].label;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        }
      },
      crosshair: {
        line: {
          color: 'rgba(107, 114, 128, 0.4)',
          width: 1,
          dashPattern: [3, 3]
        },
        sync: {
          enabled: true
        },
        zoom: {
          enabled: true
        }
      }
    },
    animation: false
  } as any; // Using 'as any' to avoid TypeScript errors with custom plugins
};

// Enhanced color scheme for financial charts
export const enhancedChartColors = {
  green: {
    base: '#26a69a',
    light: '#4db6ac',
    dark: '#00897b',
    gradient: {
      start: 'rgba(38, 166, 154, 0.2)',
      end: 'rgba(38, 166, 154, 0)'
    }
  },
  red: {
    base: '#ef5350',
    light: '#e57373',
    dark: '#e53935',
    gradient: {
      start: 'rgba(239, 83, 80, 0.2)',
      end: 'rgba(239, 83, 80, 0)'
    }
  },
  blue: {
    base: '#42a5f5',
    light: '#64b5f6',
    dark: '#1e88e5',
    gradient: {
      start: 'rgba(66, 165, 245, 0.2)',
      end: 'rgba(66, 165, 245, 0)'
    }
  },
  amber: {
    base: '#ffb74d',
    light: '#ffcc80',
    dark: '#ffa726',
    gradient: {
      start: 'rgba(255, 183, 77, 0.2)',
      end: 'rgba(255, 183, 77, 0)'
    }
  },
  purple: {
    base: '#ab47bc',
    light: '#ba68c8',
    dark: '#8e24aa',
    gradient: {
      start: 'rgba(171, 71, 188, 0.2)',
      end: 'rgba(171, 71, 188, 0)'
    }
  },
  teal: {
    base: '#26a69a',
    light: '#4db6ac',
    dark: '#00897b',
    gradient: {
      start: 'rgba(38, 166, 154, 0.2)',
      end: 'rgba(38, 166, 154, 0)'
    }
  },
  gray: {
    light: '#9ca3af',
    medium: '#6b7280',
    dark: '#374151'
  }
};
