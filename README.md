
# NeuroTicker

## 🌍 Geospatial Financial Intelligence Platform

NeuroTicker is an innovative platform that combines geospatial visualization with financial data analysis, providing traders and investors with location-aware market insights and trading capabilities.

## 🚀 Features

### 📊 Interactive Trading Dashboard
- Real-time market data visualization
- Portfolio tracking with geospatial context
- Custom watchlists management
- Advanced charting with multiple timeframes

### 🗺️ Geospatial Market Analysis
- Visualize market trends across different regions
- Identify geographic correlations in financial data
- Interactive global market map with data overlays

### 📈 AI-Powered Insights
- Stock comparison and recommendations
- Technical analysis with key indicators (MACD, RSI, etc.)
- Market sentiment analysis with geographic context

### 💼 Portfolio Management
- Track positions and orders in real-time
- Analyze portfolio performance with geographic exposure
- Set custom alerts based on market conditions

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Data Visualization**: Custom charting components
- **Maps**: Mapbox integration
- **API Integration**: Alpaca Markets API for trading and market data
- **Authentication**: Supabase Auth
- **State Management**: React Context API and custom hooks

---

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- Alpaca Markets API credentials
- Supabase account and project

## 🔧 Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/Kaushal-1/geo-finance.git
cd geo-finance
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_ALPACA_API_KEY=your_alpaca_api_key
VITE_ALPACA_API_SECRET=your_alpaca_api_secret
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
```

4. Start the development server:
```bash
npm run dev
```
---

## 🖥️ Usage

1. Create an account or sign in
2. Explore the geospatial market visualization
3. Track your portfolio and place trades
4. Use Sonar Screener to Analyze Stock Health and Performance
5. Analyze stocks with the AI-powered comparison tool

---

## 🏆 Mission Perplexity Hackathon

### Project Vision
NeuroTicker was created to address the gap between traditional financial analysis tools and geospatial data. By combining these domains, we enable investors to discover insights that would otherwise remain hidden in conventional platforms.

### Problem Statement
Traditional trading platforms lack geographic context for financial data, making it difficult for investors to understand regional market trends and correlations. NeuroTicker solves this by providing an intuitive interface that visualizes financial data on interactive maps.

### Innovation
Our platform's unique approach to combining financial data with geospatial visualization creates a new paradigm for market analysis. The integration with Alpaca Markets API allows for seamless trading capabilities within the same interface.

---

## 🚀 Future Roadmap

### 1. AI-Powered Portfolio Builder
- Build intelligent, personalized portfolios using Sonar API's market insights. The system will analyze real-time news, trends, and sentiment data to recommend asset allocations tailored to user risk profiles.

### 2. Sentiment Heatmap (Global/Sector-Based)
- Visualize market sentiment across countries and sectors. Sonar API will extract and classify news sentiment in real time, powering a dynamic Mapbox heatmap to show mood shifts geographically and thematically.

### 3. Earnings Calendar & Analyst Forecasts
- Integrate a real-time earnings tracker with forecast insights. Sonar API will summarize pre/post-earnings news, analyst outlooks, and highlight potential market movers, giving users actionable previews and recaps.

### 4. Local Investment Radar
- Sonar surfaces emerging microeconomic activity and local growth signals across geographies—before institutional investors catch on.

  ---

## 🔧 API Information Popup (Content)

### 📘 We Use the Following APIs:

- **SONAR API** by Perplexity  
- **TRADING API** by Alpaca  
- **MAP API** by Mapbox  

---

### 🚀 How We Use Them

### 1. Map Dashboard

#### **SONAR API**
- Fetches real-time stock-specific news.
- Displays country-wise economic updates in the Global News section.

#### **Mapbox API**
- Powers the animated globe visualization with real-time overlays.

---

### 2. Trading Dashboard

#### **SONAR API**
- Powers the **Sonar Screener**: retrieves latest stock-specific news and generates AI summaries.
- Adds citations so users can explore original sources.
- Enables **Sonar Market Analysis Tool** with technical & fundamental breakdown for example:
## 📊 Sample Stock Technical Analysis (Powered by Sonar API)

```text
Price: $207.93  
52-Week Range: $202.95 - $213.94  
RSI (14): 30.6 (Oversold)  

Moving Averages:  
  50-day MA: $209.51  
  200-day MA: $210.03  

MACD:  
  Value: -0.43  
  Signal: -0.47  
  Histogram: 0.04 (Bullish)  

P/E Ratio: 25.5  
Market Cap: 2.5T  
Dividend Yield: 0.05%  
```
---
**Summary Recommendation:**

- Oscillators: 8 Neutral  
- Moving Averages: 1 Neutral  
- Overall: **Neutral**

🧠 **Indicator-Based Verdict:** A recommendation with vote percentages (Buy/Sell/Neutral).  
💡 *Entirely powered by SONAR API*

#### **Alpaca API**
- Fetches live stock charts  
- Enables paper trading (buy/sell simulation)  

---

### 3. Compare Stocks Page

#### **SONAR API**
- Lets users compare two stocks side by side.
- Provides detailed analysis, with:
  - Technical indicators
  - Sentiment scoring
  - AI summary of latest news (with citations)
  - A Buy Recommendation Panel

#### **Alpaca API**
- Retrieves real-time chart data for both stocks

---

### 4. Sonar Researcher Page

#### **SONAR API**
- A specialized chat assistant for financial research
- Tailored to user's trading portfolio
- Can answer real-time financial queries
- Personalizes answers using live portfolio + market data

---

### 5. Telegram Bot Integration

#### **SONAR API**
- Powers **NeuroTickerBot** via `/chat` feature
- Sends alerts, stock updates, and real-time news

#### **Alpaca API**
- Executes buy/sell commands based on user prompts
- Lets users trade directly from Telegram

---

## 🙏 Acknowledgements

- [Alpaca Markets](https://alpaca.markets/) for their comprehensive trading API
- [Supabase](https://supabase.io/) for authentication and database services
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Mapbox](https://www.mapbox.com/) for geospatial visualization capabilities
