import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/api/axios";

function EditWaterQuality({ data, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    pH: data.pH,
    temperature: data.temperature,
    ec: data.ec,
    tds: data.tds,
    turbidity: data.turbidity,
    remarks: data.remarks || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/waterQuality/update/${data._id}`, formData);
      toast.success('Water quality data updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update water quality data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Water Quality Reading</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ph">pH Level</Label>
            <Input
              id="ph"
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
            <Label htmlFor="turbidity">Turbidity</Label>
            <Input
              id="turbidity"
              type="number"
              step="0.1"
              value={formData.turbidity}
              onChange={(e) => setFormData(prev => ({ ...prev, turbidity: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditWaterQuality;