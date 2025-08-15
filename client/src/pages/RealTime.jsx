import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Droplet, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { api, mlApi } from '@/api/axios';
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';

function RealTime() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStations = async () => {
    try {
      const response = await api.get('/station/getall');
      if (response.data.success) {
        setStations(response.data.data);
        setLoading(false);
      } else {
        throw new Error("Failed to fetch stations");
      }
    } catch (error) {
      console.error("Failed to fetch stations:", error);
      setError("Failed to load stations");
      toast.error("Failed to fetch stations");
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    if (!selectedStation) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get latest water quality reading
      const waterQualityResponse = await api.get(`/waterQuality/latest/${selectedStation}`);
      console.log('Water quality response:', waterQualityResponse.data);
      
      if (!waterQualityResponse.data.success) {
        throw new Error("Failed to fetch water quality data");
      }

      // Get predictions
      const predictionsResponse = await mlApi.get(`/predict/station/${selectedStation}/1`);
      console.log('Predictions response:', predictionsResponse.data);

      const preds = Array.isArray(predictionsResponse.data)
        ? predictionsResponse.data
        : (predictionsResponse.data?.predictions ?? []);

      // Structure the real-time data
      const currentData = {
        current: {
          pH: waterQualityResponse.data.data.pH || 0,
          temperature: waterQualityResponse.data.data.temperature || 0,
          ec: waterQualityResponse.data.data.ec || 0,
          tds: waterQualityResponse.data.data.tds || 0,
          turbidity: waterQualityResponse.data.data.turbidity || 0,
          timestamp: waterQualityResponse.data.data.timestamp
        },
        predicted: preds[0] || null
      };

      console.log('Structured data:', currentData);
      setRealTimeData(currentData);

    } catch (error) {
      console.error("Failed to fetch real-time data:", error);
      setError(error.response?.data?.detail || "Failed to fetch real-time data");
      toast.error("Failed to fetch real-time data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      setRealTimeData(null); // Clear previous data
      fetchRealTimeData();
      const interval = setInterval(fetchRealTimeData, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedStation]);

  const getParameterStatus = (value, param) => {
    const standards = WATER_QUALITY_STANDARDS[param];
    if (!standards || !value) return 'normal';
    return value < standards.min ? 'low' : 
           value > standards.max ? 'high' : 'normal';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time Monitoring</h1>
        <p className="text-muted-foreground">Live water quality monitoring with AI predictions</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <Select 
            value={selectedStation} 
            onValueChange={setSelectedStation}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select monitoring station" />
            </SelectTrigger>
            <SelectContent>
              {stations.map(station => (
                <SelectItem key={station._id} value={station._id}>
                  {station.stationName} - {station.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-muted-foreground">Loading real-time data...</p>
          </div>
        ) : realTimeData?.current ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['pH', 'temperature', 'ec', 'tds', 'turbidity'].map(param => {
              const currentValue = realTimeData.current[param];
              const predictedValue = realTimeData.predicted?.[param];
              const status = getParameterStatus(currentValue, param);
              
              return (
                <Card 
                  key={param} 
                  className={`p-4 relative overflow-hidden ${
                    status === 'normal' 
                      ? 'bg-gradient-to-br from-green-50 to-green-100'
                      : 'bg-gradient-to-br from-yellow-50 to-yellow-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{param.toUpperCase()}</h3>
                    {status !== 'normal' && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>

                  <div className="text-3xl font-bold mb-2">
                    {currentValue?.toFixed(2)}
                    {param === 'temperature' ? '°C' : ''}
                  </div>

                  {predictedValue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Predicted:</span>
                      <span>{predictedValue.toFixed(2)}</span>
                      {predictedValue > currentValue ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  )}

                  {status !== 'normal' && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <p className="text-sm">
                        {WATER_QUALITY_STANDARDS[param][`${status}Solution`]
                        }
                      </p>
                    </div>
                  )}

                  <Droplet className="absolute right-4 bottom-4 h-16 w-16 text-blue-100 animate-pulse" />
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Select a station to view real-time data
          </div>
        )}
      </Card>
    </div>
  );
}

export default RealTime;