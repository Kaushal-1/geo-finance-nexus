
import React, { useEffect, useRef } from 'react';

const TradingViewWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "proName": "FOREXCOM:SPXUSD",
          "title": "S&P 500 Index"
        },
        {
          "proName": "FOREXCOM:NSXUSD",
          "title": "US 100 Cash CFD"
        },
        {
          "proName": "FX_IDC:EURUSD",
          "title": "EUR to USD"
        },
        {
          "proName": "BITSTAMP:BTCUSD",
          "title": "Bitcoin"
        },
        {
          "proName": "BITSTAMP:ETHUSD",
          "title": "Ethereum"
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": "en"
    });

    // Clear container and append elements
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      // Widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      containerRef.current.appendChild(widgetContainer);

      // Copyright link
      const copyrightContainer = document.createElement('div');
      copyrightContainer.className = 'tradingview-widget-copyright';
      copyrightContainer.style.display = 'none'; // Hide the copyright
      containerRef.current.appendChild(copyrightContainer);
      
      // Append the script
      containerRef.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="h-full w-full" ref={containerRef}>
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading market data...</p>
      </div>
    </div>
  );
};

export default TradingViewWidget;
