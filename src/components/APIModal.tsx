
import React from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface APIModalProps {
  open: boolean;
  onClose: () => void;
}

const APIModal: React.FC<APIModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#1a1f2e] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">API Information</DialogTitle>
          <DialogDescription className="text-gray-400">
            Learn about the APIs powering NeuroTicker
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-8">
          {/* SONAR API */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-purple-500/20 flex items-center justify-center mr-3">
                <span className="text-purple-400 font-bold text-lg">S</span>
              </div>
              <h3 className="text-xl font-bold text-white">SONAR API by Perplexity</h3>
            </div>
            <p className="text-gray-300">
              Provides AI-powered financial analysis, sentiment scoring, and real-time news interpretation.
            </p>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">How We Use It:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Powers the Sonar Screener for in-depth stock analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Generates real-time news summaries with citations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Provides technical and fundamental analysis in the Compare Stocks feature</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Powers the Research Assistant with financial expertise</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ALPACA API */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-green-500/20 flex items-center justify-center mr-3">
                <span className="text-green-400 font-bold text-lg">A</span>
              </div>
              <h3 className="text-xl font-bold text-white">TRADING API by Alpaca</h3>
            </div>
            <p className="text-gray-300">
              Provides market data and commission-free trading capabilities.
            </p>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">How We Use It:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Real-time and historical market data for stock charts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Paper and live trading execution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Portfolio tracking and order management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Market data for geospatial visualization</span>
                </li>
              </ul>
            </div>
          </div>

          {/* MAPBOX API */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-blue-500/20 flex items-center justify-center mr-3">
                <span className="text-blue-400 font-bold text-lg">M</span>
              </div>
              <h3 className="text-xl font-bold text-white">MAP API by Mapbox</h3>
            </div>
            <p className="text-gray-300">
              Provides interactive maps and geospatial visualization capabilities.
            </p>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">How We Use It:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Interactive global market visualization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Region-specific economic data overlays</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Animated 3D globe on landing page</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Geographic filtering of financial data</span>
                </li>
              </ul>
            </div>
          </div>

          {/* TELEGRAM BOT */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-[#0088cc]/20 flex items-center justify-center mr-3">
                <span className="text-[#0088cc] font-bold text-lg">T</span>
              </div>
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-white mr-2">NeuroTickerBot</h3>
                <Badge className="bg-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/30">
                  Beta
                </Badge>
              </div>
            </div>
            <p className="text-gray-300">
              Our Telegram integration lets you access NeuroTicker features directly from Telegram.
            </p>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">Key Features:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#0088cc] mr-2">•</span>
                  <span>Get real-time market updates via chat</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0088cc] mr-2">•</span>
                  <span>Execute trades with simple commands</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0088cc] mr-2">•</span>
                  <span>Custom alerts directly to your Telegram chat</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#0088cc] mr-2">•</span>
                  <span>Powered by Perplexity's Sonar API for intelligent responses</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <a
              href="https://docs.neuroticker.app/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline flex items-center"
            >
              View API Documentation
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>

            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default APIModal;
