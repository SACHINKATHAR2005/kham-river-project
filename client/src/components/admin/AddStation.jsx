import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";
import { toast } from "sonner";

function AddStation() {
  const [formData, setFormData] = useState({
    stationName: "",
    stationId: "",
    region: "",
    riverBankSide: "Center"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding station...');

    try {
      const response = await api.post("/station/create", formData);
      if (response.data.success) {
        toast.success('Station added successfully!', {
          id: loadingToast,
        });
        setFormData({
          stationName: "",
          stationId: "",
          region: "",
          riverBankSide: "Center"
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add station', {
        id: loadingToast,
      });
      console.error("Failed to add station:", error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Station</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="stationName">Station Name</Label>
          <Input
            id="stationName"
            value={formData.stationName}
            onChange={(e) => setFormData(prev => ({ ...prev, stationName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="stationId">Station ID</Label>
          <Input
            id="stationId"
            value={formData.stationId}
            onChange={(e) => setFormData(prev => ({ ...prev, stationId: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="riverBankSide">River Bank Side</Label>
          <select
            id="riverBankSide"
            className="w-full rounded-md border p-2"
            value={formData.riverBankSide}
            onChange={(e) => setFormData(prev => ({ ...prev, riverBankSide: e.target.value }))}
          >
            <option value="Left">Left</option>
            <option value="Right">Right</option>
            <option value="Center">Center</option>
          </select>
        </div>
        <Button type="submit">Add Station</Button>
      </form>
    </Card>
  );
}

export default AddStation;