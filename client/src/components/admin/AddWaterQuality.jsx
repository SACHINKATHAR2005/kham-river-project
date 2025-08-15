import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/api/axios";
import { toast } from "sonner";

function AddWaterQuality() {
  // Get current date and time in IST
  const getCurrentDateTime = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5:30 hours for IST
    return istTime.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    stationId: "",
    pH: "",
    temperature: "",
    ec: "",
    tds: "",
    turbidity: "",
    remarks: "",
    timestamp: getCurrentDateTime() // Set default to current IST date and time
  });

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const response = await api.post("/waterQuality/create", formData);
      if (response.data.success) {
        toast.success("Water quality data added successfully");
        setIsOpen(false);
        // Reset form with new current time
        setFormData({
          stationId: "",
          pH: "",
          temperature: "",
          ec: "",
          tds: "",
          turbidity: "",
          remarks: "",
          timestamp: getCurrentDateTime()
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add water quality data");
      console.error("Failed to add water quality data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add Water Quality Data</h2>
      <Button onClick={() => setIsOpen(true)}>Add Reading</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Water Quality Reading</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="station">Station</Label>
              <Select
                value={formData.stationId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, stationId: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station._id} value={station._id}>
                      {station.stationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Reading"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default AddWaterQuality;