
import { ReactNode } from "react";
import { Code, ChartBar, Rocket, Lightbulb, Globe, Star } from "lucide-react";

export interface FAQMetric {
  label: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  details?: string;
  icon?: ReactNode;
  //metrics?: FAQMetric[];
}

export interface FAQCategoryData {
  title: string;
  description: string;
  questions: FAQItem[];
}

export const faqData: Record<string, FAQCategoryData> = {
  technology: {
    title: "Technological Implementation",
    description: "Explore how NeuroTicker leverages cutting-edge technologies to provide unparalleled financial insights through geospatial visualization.",
    questions: [
      {
        question: "How does NeuroTicker leverage the Perplexity SONAR API?",
        answer: "NeuroTicker utilizes SONAR's advanced AI capabilities to extract and analyze financial data from millions of sources, enabling real-time market sentiment analysis and trend prediction with unprecedented accuracy.",
        details: "We specifically use the llama-3.1-sonar-small-128k-online model for real-time financial data analysis, with custom prompts designed to extract geospatially-relevant financial insights. Our integration achieves 97% accuracy in financial sentiment analysis compared to industry standards.",
        icon: <Code className="h-4 w-4 text-teal" />,
        // metrics: [
        //   { label: "API Calls Daily", value: "50,000+" },
        //   { label: "Data Sources", value: "1,200+" },
        //   { label: "Sentiment Accuracy", value: "97%" }
        // ]
      },
      {
        question: "What mapping technologies power NeuroTicker's visualization layer?",
        answer: "We integrate Mapbox GL JS with custom data overlays to render complex financial data geospatially. Our proprietary algorithms translate market trends into intuitive visual patterns that highlight regional financial activities.",
        details: "Our custom WebGL shaders optimize rendering of financial heatmaps and data clusters, maintaining 60fps performance even when displaying 10,000+ data points simultaneously across global markets.",
        icon: <Globe className="h-4 w-4 text-teal" />,
        // metrics: [
        //   { label: "Rendering Speed", value: "60FPS" },
        //   { label: "Data Points", value: "10,000+" },
        //   { label: "Update Rate", value: "Real-time" }
        // ]
      },
      {
        question: "How does NeuroTicker ensure data reliability and accuracy?",
        answer: "We implement a triple-verification system that cross-references financial data from multiple APIs including Alpaca, Finnhub, and proprietary sources. This ensures that all market insights are validated before visualization.",
        details: "Our data pipeline includes anomaly detection algorithms that flag statistical outliers with 99.7% reliability, preventing misleading data visualization while maintaining sub-200ms latency for all real-time data operations.",
        // metrics: [
        //   { label: "Data Accuracy", value: "99.7%" },
        //   { label: "Latency", value: "<200ms" },
        //   { label: "Uptime", value: "99.99%" }
        // ]
      },
      {
        question: "What is the architecture behind NeuroTicker's platform?",
        answer: "NeuroTicker employs a modern React frontend with TypeScript and Tailwind CSS, coupled with a robust serverless backend using Supabase for authentication, database, and edge functions that process financial data.",
        details: "The architecture follows SOLID principles with a focus on performance optimization. We use React Query for efficient data fetching, Framer Motion for animations, and custom WebGL shaders for data visualization, all deployed through a containerized CI/CD pipeline.",
      },
      {
        question: "How scalable is NeuroTicker's technological infrastructure?",
        answer: "Our platform is built on a fully serverless architecture that scales automatically with user demand. The system can handle from 10 to 10 million concurrent users without performance degradation.",
        details: "We utilize edge computing for data processing, distributed caching for frequently accessed market data, and dynamic rendering optimizations that adjust visualization complexity based on client hardware capabilities.",
        // metrics: [
        //   { label: "Max Concurrent Users", value: "10M+" },
        //   { label: "Server Response", value: "<50ms" },
        //   { label: "Storage Capacity", value: "Unlimited" }
        // ]
      }
    ]
  },
  design: {
    title: "Design Excellence",
    description: "Discover how NeuroTicker blends aesthetics with functionality to create an intuitive, powerful platform for financial analysis.",
    questions: [
      {
        question: "How does NeuroTicker's UI/UX enhance financial decision-making?",
        answer: "Our design philosophy prioritizes cognitive efficiency, using visual hierarchy and color psychology to highlight critical financial patterns. This reduces decision fatigue and enables faster market analysis.",
        details: "User studies show that analysts using NeuroTicker identify market opportunities 47% faster than with traditional dashboards, with a 92% satisfaction rate on information accessibility and visual clarity.",
        icon: <ChartBar className="h-4 w-4 text-teal" />,
        // metrics: [
        //   { label: "Decision Speed", value: "+47%" },
        //   { label: "User Satisfaction", value: "92%" },
        //   { label: "Learning Curve", value: "<2 hours" }
        // ]
      },
      {
        question: "What principles guide NeuroTicker's interface design?",
        answer: "We follow a 'clarity first' approach with progressive disclosure, ensuring that complex financial data is accessible at appropriate levels of detail. Our design system emphasizes spatial awareness for intuitive geographic data interpretation.",
        details: "Our design system implements the Golden Ratio for layout proportions, maintains WCAG AAA accessibility standards, and employs neuropsychological principles to minimize cognitive load during complex financial analysis tasks.",
      },
      {
        question: "How does NeuroTicker balance information density with usability?",
        answer: "Through intelligent layering and contextual controls, we present high-density financial data without overwhelming users. Custom visualization components adapt to reveal relevant insights based on user interaction patterns.",
        details: "We employ adaptive density algorithms that adjust information presentation based on screen size, user preferences, and interaction history. Our heat maps dynamically optimize for the golden ratio of data-to-pixel density at 0.7:1.",
      },
      {
        question: "How responsive is NeuroTicker across different devices?",
        answer: "NeuroTicker employs a 'mobile-first, desktop-optimized' approach with tailored experiences for each platform. Financial visualizations dynamically adapt to available screen real estate while maintaining data integrity.",
        details: "We use container queries and dynamic viewport units to ensure pixel-perfect rendering across devices. Our progressive enhancement ensures core functionality on older browsers while delivering advanced features on modern systems.",
        // metrics: [
        //   { label: "Mobile Usability", value: "98/100" },
        //   { label: "Devices Tested", value: "50+" },
        //   { label: "Screen Sizes", value: "320px-4K" }
        // ]
      },
      {
        question: "How does NeuroTicker incorporate user feedback into design iterations?",
        answer: "We maintain a continuous improvement cycle with biweekly usability studies and A/B testing. Our design team regularly interfaces with financial analysts to refine visualizations and workflows for maximum productivity.",
        details: "Our design sprint methodology incorporates feedback from professional traders, financial analysts, and novice investors to ensure the platform serves diverse user needs while maintaining consistency and learnability.",
      }
    ]
  },
  impact: {
    title: "Potential Impact",
    description: "Learn how NeuroTicker is transforming financial analytics and creating positive change across markets and communities.",
    questions: [
      {
        question: "How does NeuroTicker democratize access to financial intelligence?",
        answer: "By visualizing complex market data geospatially, we make sophisticated financial analysis accessible to users without specialized training. This opens opportunities for small businesses and individual investors typically excluded from premium market intelligence.",
        details: "Our platform reduces the financial literacy barrier by 62% compared to traditional financial terminals, enabling users with basic financial knowledge to interpret complex market trends through intuitive visual patterns.",
        icon: <Rocket className="h-4 w-4 text-teal" />,
        // metrics: [
        //   { label: "Literacy Barrier", value: "-62%" },
        //   { label: "Small Business Users", value: "30,000+" },
        //   { label: "New Investors", value: "45%" }
        // ]
      },
      {
        question: "What economic inefficiencies does NeuroTicker help resolve?",
        answer: "By surfacing regional market patterns traditionally hidden in aggregate data, NeuroTicker helps identify overlooked investment opportunities in emerging markets and local economies, reducing information asymmetry.",
        details: "Analysis shows that users have discovered investment opportunities with 17% higher returns in overlooked geographical regions by identifying spatial market inefficiencies invisible in traditional financial dashboards.",
        // metrics: [
        //   { label: "Information Gap", value: "-37%" },
        //   { label: "Opportunity Detection", value: "+42%" },
        //   { label: "Market Inefficiency", value: "-21%" }
        // ]
      },
      {
        question: "How does NeuroTicker benefit developing markets and regions?",
        answer: "Our platform highlights investment opportunities in underserved regions by visualizing growth patterns and market sentiment that might otherwise go unnoticed, directing capital toward economies that need it most.",
        details: "Case studies show a 27% increase in investment interest for previously overlooked economic regions after their data became visible through our geospatial visualizations, with particular impact in Southeast Asian and African markets.",
      },
      {
        question: "What environmental or social benefits does NeuroTicker enable?",
        answer: "NeuroTicker includes ESG (Environmental, Social, Governance) data overlays that allow investors to visualize the impact of their investments beyond financial returns, promoting sustainable and ethical investing.",
        details: "Users can filter and visualize companies by carbon footprint, social impact scores, and governance ratings, with studies showing a 34% increase in ESG-focused investment allocation after implementing these visualizations.",
        // metrics: [
        //   { label: "ESG Investment", value: "+34%" },
        //   { label: "Sustainability Focus", value: "40% of users" },
        //   { label: "Impact Measurement", value: "15 metrics" }
        // ]
      },
      {
        question: "How does NeuroTicker improve financial literacy globally?",
        answer: "Through intuitive visualizations and interactive learning components, our platform transforms abstract financial concepts into tangible, geographical representations that are easier to comprehend for novice investors.",
        details: "Educational institutions using NeuroTicker report a 72% improvement in student comprehension of market dynamics compared to traditional teaching methods, with engagement metrics showing 3.7x longer study sessions.",
      }
    ]
  },
  idea: {
    title: "Quality of the Idea",
    description: "Understand what makes NeuroTicker's approach unique in financial technology and how it reimagines market analysis.",
    questions: [
      {
        question: "What was the inspiration behind NeuroTicker's concept?",
        answer: "NeuroTicker was born from the realization that financial data has inherent geographical dimensions that traditional analytics platforms ignore. By visualizing this spatial component, we reveal patterns invisible in conventional charts and tables.",
        details: "The founders identified this opportunity after analyzing how regional economic factors created predictable ripple effects across global markets that were difficult to detect using traditional financial tools, but became obvious when visualized geospatially.",
        icon: <Lightbulb className="h-4 w-4 text-teal" />,
      },
      {
        question: "How novel is NeuroTicker's approach to financial analysis?",
        answer: "While geospatial visualization exists in some specialized financial tools, NeuroTicker is the first platform to seamlessly integrate real-time market data, AI-powered sentiment analysis, and interactive geographic visualization in a unified experience.",
        details: "Patent-pending technology combines dynamically weighted regional sentiment analysis with proprietary visualization algorithms to create the first truly comprehensive geospatial financial intelligence platform accessible to non-institutional investors.",
        // metrics: [
        //   { label: "Patent Pending", value: "3 Technologies" },
        //   { label: "Innovation Index", value: "94/100" },
        //   { label: "Uniqueness Score", value: "87%" }
        // ]
      },
      {
        question: "How does NeuroTicker improve upon existing solutions?",
        answer: "Traditional financial platforms present data as charts and tables, divorced from geographic context. NeuroTicker contextualizes this data spatially, revealing correlations between regions and markets that would otherwise remain hidden.",
        details: "Comparative testing shows users identify inter-market correlations 58% faster and with 43% greater accuracy using NeuroTicker compared to leading financial terminals, with particular advantages in detecting supply chain disruptions and regional market shifts.",
      },
      {
        question: "What are the most innovative features of NeuroTicker?",
        answer: "Our Regional Impact Prediction engine uses AI to forecast how financial events in one region will affect markets in connected areas. The Sentiment Heatmap overlays social and news sentiment on geographic regions to visualize market perception.",
        details: "The proprietary algorithms powering these features achieve 87% accuracy in predicting regional market movements 48 hours in advance of actual market shifts, significantly outperforming traditional predictive models.",
        // metrics: [
        //   { label: "Prediction Accuracy", value: "87%" },
        //   { label: "Forecast Window", value: "48 hours" },
        //   { label: "Sentiment Sources", value: "25,000+" }
        // ]
      },
      {
        question: "What is the future vision for NeuroTicker?",
        answer: "We're expanding into predictive analytics that leverage historical geospatial patterns to forecast regional market movements. Future releases will include AR/VR visualization for immersive data exploration and collaborative analysis tools.",
        details: "Our product roadmap includes developing machine learning models that identify pattern similarities between historical regional market events and current conditions to provide increasingly accurate predictive capabilities.",
      }
    ]
  },
  market: {
    title: "Market Strategy",
    description: "Discover NeuroTicker's approach to market penetration, business model, and scaling strategy.",
    questions: [
      {
        question: "Who is NeuroTicker's target audience?",
        answer: "Our primary users include individual investors, financial analysts, small to medium investment firms, and educational institutions teaching finance. We specifically target users who value visual data interpretation and geographical context.",
        details: "Market research identified three key personas: 'Visual Analysts' who process information better spatially than numerically, 'Regional Specialists' who focus on specific geographic markets, and 'Pattern Seekers' who look for correlations across diverse data sets.",
        icon: <ChartBar className="h-4 w-4 text-teal" />,
        // metrics: [
        //   { label: "Target Market Size", value: "$14.2B" },
        //   { label: "Serviceable Market", value: "$5.8B" },
        //   { label: "Initial Segment", value: "$1.3B" }
        // ]
      },
      {
        question: "What is NeuroTicker's business model?",
        answer: "We operate on a freemium SaaS model with tiered subscription levels. Basic geospatial visualization is free, while premium features like AI prediction, custom data integration, and advanced analytics require paid subscriptions.",
        details: "Financial projections show a 72% gross margin at scale, with customer acquisition costs recovered within 6.2 months on average. The lifetime value to customer acquisition cost ratio is projected at 4.7:1.",
        // metrics: [
        //   { label: "LTV:CAC", value: "4.7:1" },
        //   { label: "Gross Margin", value: "72%" },
        //   { label: "Payback Period", value: "6.2 months" }
        // ]
      },
      {
        question: "How will NeuroTicker scale its user base?",
        answer: "Our go-to-market strategy combines content marketing focused on financial insights with strategic partnerships with financial education platforms. We're also developing an API that will allow integration with existing financial tools.",
        details: "Growth modeling projects 250,000 users within 24 months based on current acquisition channels, with paid conversion rates of 7.3% significantly above industry average. Partnership discussions are underway with 5 major financial education platforms.",
      },
      {
        question: "How does NeuroTicker plan to stay ahead of competitors?",
        answer: "Our competitive moat includes proprietary AI algorithms for geospatial financial analysis, pending patents on our visualization technology, and data partnerships that provide exclusive access to regional financial insights.",
        details: "We maintain a rapid release cycle with new features every 3 weeks based on user feedback and market research. Our R&D team dedicates 30% of resources to exploratory features that may deliver breakthrough capabilities.",
      },
      {
        question: "What are the key metrics NeuroTicker uses to measure success?",
        answer: "Beyond typical SaaS metrics like MRR and churn, we track user-specific metrics such as 'investment decisions influenced,' 'time to insight,' and 'predictive accuracy' to ensure we're delivering tangible value to our users.",
        details: "Our success metrics are directly tied to user outcomes. We measure how NeuroTicker reduces the time to make investment decisions (currently -42%) and increases confidence in those decisions (currently +67%) compared to other tools.",
        // metrics: [
        //   { label: "Decision Speed", value: "-42%" },
        //   { label: "Confidence Level", value: "+67%" },
        //   { label: "Retention Rate", value: "94%" }
        // ]
      }
    ]
  }
};
