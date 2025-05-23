import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '@/api/axios';

function StationDetails() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get station data
        const stationRes = await api.get(`/station/${id}`);
        setStation(stationRes.data.data);

        // Get water quality data
        const waterQualityRes = await api.get(`/waterQuality/getall`);
        const filteredData = waterQualityRes.data.data.filter(
          item => item.stationId === id
        );
        const sortedData = filteredData.sort(
          (a, b) => new Date(b.updated) - new Date(a.updated)
        );
        setWaterQualityData(sortedData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatData = (data) => {
    return data.map(item => ({
      timestamp: new Date(item.updated).getTime(),
      ph: parseFloat(item.ph || 0),
      temperature: parseFloat(item.temperature || 0),
      dissolvedOxygen: parseFloat(item.dissolvedOxygen || 0),
      turbidity: parseFloat(item.turbidity || 0)
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  const chartData = formatData(waterQualityData);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{station?.stationName}</h1>
        <p className="text-muted-foreground">Station ID: {station?.stationId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* pH Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">pH Levels Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis domain={[0, 14]} />
              <Tooltip 
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value) => value.toFixed(2)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ph" 
                stroke="#8884d8" 
                name="pH Level"
                dot={true}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Temperature Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Temperature Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#82ca9d" 
                name="Temperature (°C)"
                dot={true}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Dissolved Oxygen Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Dissolved Oxygen Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value) => value.toFixed(2)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="dissolvedOxygen" // Updated to match the formatted data
                stroke="#ffc658" 
                name="DO (mg/L)"
                dot={true}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Turbidity Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Turbidity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="turbidity" 
                stroke="#ff7300" 
                name="Turbidity (NTU)"
                dot={true}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

export default StationDetails;