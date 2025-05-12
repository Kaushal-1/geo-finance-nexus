import React from "react";
interface MapInfoCardProps {
  location?: string;
  marketCode?: string;
  marketCap?: string;
  dailyVolume?: string;
  performance?: string;
  isPositive?: boolean;
}
const MapInfoCard: React.FC<MapInfoCardProps> = ({
  location = "Global Markets",
  marketCode = "GLOBAL",
  marketCap = "$114.5T",
  dailyVolume = "$463.8B",
  performance = "+0.32%",
  isPositive = true
}) => {
  return;
};
export default MapInfoCard;