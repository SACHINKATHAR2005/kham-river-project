import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

function CsvUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    if (selectedFile.type !== "text/csv") {
      toast.error("Please select a valid CSV file");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      console.log("Uploading file...");
      const response = await api.post("/waterQuality/upload-csv", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for large files
        timeout: 30000,
      });

      if (response.data.success) {
        toast.success(`Successfully uploaded ${response.data.rowsProcessed} records`);
        setFile(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to upload file. Please check the CSV format.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <Label htmlFor="csvFile">Upload CSV File</Label>
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground mt-2">
            CSV Format: stationId,timestamp,pH,temperature,ec,tds,turbidity,remarks
          </p>
        </div>

        {file && (
          <div className="space-y-2">
            <p className="text-sm">Selected file: {file.name}</p>
            <Button 
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </>
              )}
            </Button>
          </div>
        )}

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Sample CSV Format:</h4>
          <code className="text-sm block whitespace-pre">
            stationId,timestamp,pH,temperature,ec,tds,turbidity,remarks
            1001,2024-05-25 14:30:00,7.2,25.5,450,225,12.5,"Normal reading"
          </code>
        </div>
      </form>
    </Card>
  );
}

export default CsvUpload;