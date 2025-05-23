import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';

function RealTime() {
  const [stations, setStations] = useState([]);
  const [latestData, setLatestData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stationsRes, waterQualityRes] = await Promise.all([
          api.get('/station/getall'),
          api.get('/waterQuality/getall')
        ]);

        const stations = stationsRes.data.data;
        setStations(stations);

        // Group latest readings by station
        const latestReadings = {};
        stations.forEach(station => {
          const stationData = waterQualityRes.data.data
            .filter(reading => reading.stationId._id === station._id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          latestReadings[station._id] = stationData[0] || null;
        });

        setLatestData(latestReadings);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Poll for new data every 30 seconds
    const interval = setInterval(() => {
      fetchInitialData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, param) => {
    const standard = WATER_QUALITY_STANDARDS[param];
    if (value < standard.min) return "bg-yellow-100 text-yellow-800";
    if (value > standard.max) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-time Monitoring</h1>
        <p className="text-muted-foreground">
          Live water quality data from all monitoring stations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stations.map(station => (
          <Card key={station._id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{station.stationName}</h2>
                <p className="text-sm text-muted-foreground">{station.region}</p>
              </div>
              <Badge variant={latestData[station._id] ? "default" : "destructive"}>
                {latestData[station._id] ? "Online" : "Offline"}
              </Badge>
            </div>

            {latestData[station._id] ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(WATER_QUALITY_STANDARDS).map(([param, standard]) => (
                  <div key={param} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">{param}</span>
                      <Badge 
                        variant="secondary"
                        className={getStatusColor(latestData[station._id][param], param)}
                      >
                        {latestData[station._id][param]} {standard.unit}
                      </Badge>
                    </div>
                    <div className="h-1 bg-gray-100 rounded">
                      <div 
                        className={`h-full rounded ${
                          getStatusColor(latestData[station._id][param], param).includes('green') 
                            ? 'bg-green-500' 
                            : getStatusColor(latestData[station._id][param], param).includes('red')
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (latestData[station._id][param] / standard.max) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="col-span-2 text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(latestData[station._id].timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data available</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RealTime;