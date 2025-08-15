import { Card } from "@/components/ui/card";
import { WaveAnimation } from "./WaveAnimation";
import { AlertTriangle, CheckCircle } from "lucide-react";

function WaterQualityCard({ parameter, value, threshold, station }) {
  const isNormal = (param, val) => {
    const thresholds = {
      pH: { min: 6.5, max: 8.5 },
      temperature: { min: 20, max: 30 },
      ec: { min: 300, max: 800 },
      tds: { min: 150, max: 500 },
      turbidity: { min: 0, max: 5 }
    };

    return val >= thresholds[param].min && val <= thresholds[param].max;
  };

  const getSolution = (param, val, stationName) => {
    const solutions = {
      pH: {
        high: `High pH detected${stationName ? ` at ${stationName}` : ''}. Consider:
          • Adding pH reducing agents
          • Installing automatic pH control systems
          • Monitoring industrial discharge upstream`,
        low: `Low pH detected${stationName ? ` at ${stationName}` : ''}. Consider:
          • Adding limestone or similar buffering agents
          • Checking for acid rain influence
          • Investigating nearby soil conditions`
      },
      temperature: {
        high: `High temperature detected${stationName ? ` at ${stationName}` : ''}. Consider:
          • Increasing water flow rate
          • Adding shading vegetation
          • Monitoring thermal discharge sources`,
        low: `Low temperature detected${stationName ? ` at ${stationName}` : ''}. Consider:
          • Investigating cold water inflows
          • Checking depth variations
          • Monitoring seasonal patterns`
      }
      // Add solutions for other parameters
    };

    const threshold = isNormal(param, val);
    const type = val > threshold.max ? 'high' : 'low';
    return solutions[param]?.[type] || 'Parameter requires attention';
  };

  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="z-10 relative">
        <h3 className="text-lg font-semibold mb-2">{parameter}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold">{value.toFixed(2)}</span>
          {isNormal(parameter, value) ? (
            <CheckCircle className="text-green-500 h-6 w-6" />
          ) : (
            <AlertTriangle className="text-yellow-500 h-6 w-6" />
          )}
        </div>
        {!isNormal(parameter, value) && (
          <div className="mt-4 text-sm bg-yellow-50 p-3 rounded-md">
            <p className="font-semibold mb-2">Recommended Actions:</p>
            <p>{getSolution(parameter, value, station?.stationName)}</p>
          </div>
        )}
      </div>
      <WaveAnimation 
        color={isNormal(parameter, value) ? "bg-blue-500/20" : "bg-yellow-500/20"}
      />
    </Card>
  );
}

export default WaterQualityCard;