import { useState, useEffect, useMemo } from "react";
import api from "@/api/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogDescription } from "@/components/ui/dialog";
import { predictWaterQuality } from '@/utils/predictions';
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function WaterQuality() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("all"); // Changed default value
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stations
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

  // Fetch water quality data when station is selected
  useEffect(() => {
    const fetchWaterQualityData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/waterQuality/getall");
        if (response.data.success) {
          const data = response.data.data;
          // Filter by selected station if one is selected
          const filteredData = selectedStation !== "all"
            ? data.filter(item => item.stationId._id === selectedStation)
            : data;
          // Sort by timestamp
          const sortedData = filteredData.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setWaterQualityData(sortedData);
        }
      } catch (error) {
        console.error("Failed to fetch water quality data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaterQualityData();
  }, [selectedStation]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Water Quality Data Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
    
    if (selectedStation !== "all") {
      const station = stations.find(s => s._id === selectedStation);
      doc.text(`Station: ${station?.stationName}`, 14, 35);
    }

    // Prepare table data
    const tableData = waterQualityData.map(reading => [
      reading.stationId.stationName,
      new Date(reading.timestamp).toLocaleString(),
      reading.pH,
      reading.temperature,
      reading.ec,
      reading.tds,
      reading.turbidity,
      reading.remarks || "-"
    ]);

    // Add table
    autoTable(doc, {
      head: [["Station Name", "Date & Time", "pH", "Temp (°C)", "EC", "TDS", "Turbidity (NTU)", "Remarks"]],
      body: tableData,
      startY: selectedStation !== "all" ? 40 : 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [242, 242, 242] }
    });

    // Save the PDF
    doc.save("water-quality-report.pdf");
  };

  const predictions = useMemo(() => {
    if (!waterQualityData.length) return null;
    return predictWaterQuality(waterQualityData, selectedStation);
  }, [waterQualityData, selectedStation]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Water Quality Data</h1>
            <p className="text-sm text-muted-foreground">
              View and filter water quality measurements from all stations
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Select 
              value={selectedStation} 
              onValueChange={setSelectedStation}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select station to filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem 
                    key={station._id} 
                    value={station._id}
                  >
                    {station.stationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
              disabled={waterQualityData.length === 0}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Station Name</TableHead>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Temperature (°C)</TableHead>
                <TableHead>EC</TableHead>
                <TableHead>TDS</TableHead>
                <TableHead>Turbidity (NTU)</TableHead>
                <TableHead className="w-[200px]">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waterQualityData.length > 0 ? (
                waterQualityData.map((reading) => (
                  <TableRow key={reading._id}>
                    <TableCell className="font-medium">
                      {reading.stationId.stationName}
                    </TableCell>
                    <TableCell>
                      {new Date(reading.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{reading.pH}</TableCell>
                    <TableCell>{reading.temperature}</TableCell>
                    <TableCell>{reading.ec}</TableCell>
                    <TableCell>{reading.tds}</TableCell>
                    <TableCell>{reading.turbidity}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {reading.remarks || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={8} 
                    className="text-center py-4 text-muted-foreground"
                  >
                    No water quality data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Prediction Card */}
      {predictions && waterQualityData.length >= 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Predicted Water Quality Parameters</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Based on historical trends and standard parameters
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(predictions).map(([param, data]) => (
              <Card key={param} className="p-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold capitalize">{param}</h3>
                    <p className="text-sm text-muted-foreground">
                      {WATER_QUALITY_STANDARDS[param].description}
                    </p>
                  </div>
                  {data.trend === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : data.trend === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current:</span>
                    <span className="font-medium">
                      {data.current.toFixed(2)} {data.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Predicted:</span>
                    <span className={`font-medium ${
                      data.status === 'normal' ? 'text-green-600' :
                      data.status === 'above' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {data.predicted} {data.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Standard range:</span>
                    <span>
                      {WATER_QUALITY_STANDARDS[param].min} - {WATER_QUALITY_STANDARDS[param].max} {data.unit}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default WaterQuality;