import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from "sonner";
import api from "@/api/axios";
import { formatIndianDateTime } from '@/utils/dateFormat';

function WaterQualityPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('7');

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/predict/${duration}`);
      setPredictions(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch predictions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [duration]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Water Quality Predictions</h2>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Next 7 days</SelectItem>
            <SelectItem value="15">Next 15 days</SelectItem>
            <SelectItem value="30">Next 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading predictions...</div>
      ) : (
        <div className="space-y-6">
          {/* pH Chart */}
          <div className="h-[300px]">
            <LineChart width={800} height={300} data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => formatIndianDateTime(value)}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => formatIndianDateTime(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="pH" stroke="#8884d8" />
            </LineChart>
          </div>

          {/* Temperature Chart */}
          <div className="h-[300px]">
            <LineChart width={800} height={300} data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => formatIndianDateTime(value)}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => formatIndianDateTime(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
            </LineChart>
          </div>

          {/* Other parameters charts... */}
        </div>
      )}
    </Card>
  );
}

export default WaterQualityPredictions;