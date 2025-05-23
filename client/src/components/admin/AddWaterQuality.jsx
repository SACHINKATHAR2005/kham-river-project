import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";
import { toast } from "sonner";

function AddWaterQuality() {
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    stationId: "",
    pH: "",
    temperature: "",
    ec: "",
    tds: "",
    turbidity: "",
    remarks: "",
    timestamp: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get("/station/getall");
        if (response.data.success) {
          setStations(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      }
    };

    fetchStations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding water quality data...');

    try {
      const response = await api.post("/waterQuality/create", formData);
      if (response.data.success) {
        toast.success('Water quality data added successfully!', {
          id: loadingToast,
        });
        setFormData({
          ...formData,
          pH: "",
          temperature: "",
          ec: "",
          tds: "",
          turbidity: "",
          remarks: ""
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add water quality data', {
        id: loadingToast,
      });
      console.error("Failed to add water quality data:", error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add Water Quality Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="stationId">Select Station</Label>
          <select
            id="stationId"
            className="w-full rounded-md border p-2"
            value={formData.stationId}
            onChange={(e) => setFormData(prev => ({ ...prev, stationId: e.target.value }))}
            required
          >
            <option value="">Select a station</option>
            {stations.map(station => (
              <option key={station._id} value={station._id}>
                {station.stationName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pH">pH Level</Label>
            <Input
              id="pH"
              type="number"
              step="0.1"
              value={formData.pH}
              onChange={(e) => setFormData(prev => ({ ...prev, pH: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ec">EC</Label>
            <Input
              id="ec"
              type="number"
              value={formData.ec}
              onChange={(e) => setFormData(prev => ({ ...prev, ec: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="tds">TDS</Label>
            <Input
              id="tds"
              type="number"
              value={formData.tds}
              onChange={(e) => setFormData(prev => ({ ...prev, tds: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="turbidity">Turbidity (NTU)</Label>
            <Input
              id="turbidity"
              type="number"
              step="0.1"
              value={formData.turbidity}
              onChange={(e) => setFormData(prev => ({ ...prev, turbidity: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="timestamp">Date & Time</Label>
          <Input
            id="timestamp"
            type="datetime-local"
            value={formData.timestamp}
            onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <textarea
            id="remarks"
            className="w-full rounded-md border p-2"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            rows={3}
          />
        </div>

        <Button type="submit">Add Water Quality Data</Button>
      </form>
    </Card>
  );
}

export default AddWaterQuality;