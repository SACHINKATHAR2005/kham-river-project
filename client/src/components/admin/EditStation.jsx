import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/api/axios";

function EditStation({ station, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    stationId: station.stationId,
    stationName: station.stationName,
    region: station.region,
    riverBankSide: station.riverBankSide,
    coordinates: station.coordinates || { latitude: '', longitude: '' }
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/station/update/${station._id}`, formData);
      toast.success('Station updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update station');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Station</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stationId">Station ID</Label>
            <Input
              id="stationId"
              type="number"
              value={formData.stationId}
              onChange={(e) => setFormData(prev => ({ ...prev, stationId: e.target.value }))}
              required
            />
          </div>

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
            <Select
              value={formData.riverBankSide}
              onValueChange={(value) => setFormData(prev => ({ ...prev, riverBankSide: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank side" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Left">Left</SelectItem>
                <SelectItem value="Right">Right</SelectItem>
                <SelectItem value="Center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.coordinates.latitude}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, latitude: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.coordinates.longitude}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, longitude: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Station"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStation;