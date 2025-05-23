import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/api/axios";

function EditStation({ station, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    stationName: station.stationName,
    stationId: station.stationId,
    region: station.region,
    riverBankSide: station.riverBankSide
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(`/station/update/${station._id}`, formData);
      if (response.data.success) {
        toast.success("Station updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update station");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Station</DialogTitle>
        </DialogHeader>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Station"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStation;