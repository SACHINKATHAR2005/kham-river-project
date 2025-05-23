import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "lucide-react";
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';
import { predictWaterQuality } from '@/utils/predictions';

function Predictions() {
  const [stations, setStations] = useState([]);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, waterQualityRes] = await Promise.all([
          api.get('/station/getall'),
          api.get('/waterQuality/getall')
        ]);

        setStations(stationsRes.data.data);
        setWaterQualityData(waterQualityRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  // Group predictions by station
  const stationPredictions = stations.map(station => {
    const predictions = predictWaterQuality(waterQualityData, station._id);
    return {
      station,
      predictions
    };
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Water Quality Predictions</h1>
        <p className="text-muted-foreground">
          Analysis and predictions based on historical water quality data
        </p>
      </div>

      <div className="grid gap-6">
        {stationPredictions.map(({ station, predictions }) => (
          predictions && (
            <Card key={station._id} className="p-6">
              <h2 className="text-xl font-semibold mb-4">{station.stationName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(predictions).map(([param, data]) => (
                  <Card key={param} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold capitalize">{param}</h3>
                        <p className="text-sm text-muted-foreground">
                          {WATER_QUALITY_STANDARDS[param].description}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        data.status === 'normal' ? 'bg-green-100 text-green-800' :
                        data.status === 'above' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {data.status}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current:</span>
                        <span className="font-medium">
                          {data.current} {data.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Predicted:</span>
                        <span className="font-medium">
                          {data.predicted} {data.unit}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded">
                        <div 
                          className={`h-full rounded ${
                            data.status === 'normal' ? 'bg-green-500' :
                            data.status === 'above' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (data.current / WATER_QUALITY_STANDARDS[param].max) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}

export default Predictions;