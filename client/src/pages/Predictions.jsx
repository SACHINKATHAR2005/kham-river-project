import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import { api, mlApi } from '@/api/axios';
import { formatIndianDateTime } from '@/utils/dateFormat';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('7');

  const fetchStations = async () => {
    try {
      const response = await api.get('/station/getall');
      setStations(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch stations");
    }
  };

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const endpoint = selectedStation === 'all' 
        ? `/predict/${duration}`
        : `/predict/station/${selectedStation}/${duration}`;
      
      const response = await mlApi.get(endpoint);
      const data = response.data;
      // Normalize response to always be an array for charts/table
      const normalized = Array.isArray(data) ? data : (data?.predictions ?? []);
      setPredictions(normalized);
      
      if (!Array.isArray(normalized) || normalized.length === 0) {
        toast.error("No predictions available for the selected input");
      }
    } catch (error) {
      toast.error("Failed to fetch predictions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      fetchPredictions();
    }
  }, [selectedStation, duration]);

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Format timestamps and numbers
        if (header === 'timestamp') {
          return formatIndianDateTime(value);
        }
        if (typeof value === 'number') {
          return value.toFixed(2);
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const handleDownload = async (days) => {
    try {
      setLoading(true);
      // First ensure model is trained with latest data
      await mlApi.post('/train');
      
      // Get predictions for download
      const response = await mlApi.get(`/predict/${days}`);
      const predictions = response.data;
      
      if (!predictions || predictions.length === 0) {
        throw new Error('No prediction data available');
      }
      
      // Convert to CSV
      const csv = convertToCSV(predictions);
      
      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `water-quality-predictions-${days}days.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${days}-day predictions downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPredictionsPDF = async () => {
    try {
      setLoading(true);
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add title and metadata
      doc.setFontSize(16);
      doc.text("Water Quality Predictions Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Station: ${selectedStation === 'all' ? 'All Stations' : 
        stations.find(s => s._id === selectedStation)?.stationName}`, 14, 30);
      doc.text(`Prediction Duration: Next ${duration} days`, 14, 35);

      // Add predictions data table
      autoTable(doc, {
        head: [["Date", "pH", "Temperature", "EC", "TDS", "Turbidity"]],
        body: predictions.map(pred => [
          formatIndianDateTime(pred.timestamp),
          pred.pH.toFixed(2),
          `${pred.temperature.toFixed(2)}°C`,
          pred.ec.toFixed(2),
          pred.tds.toFixed(2),
          pred.turbidity.toFixed(2)
        ]),
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Capture and add graphs - Fix for the selector issue
      const graphDivs = document.querySelectorAll('[data-graph]');
      let currentY = doc.lastAutoTable.finalY + 10;

      for (const graph of graphDivs) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 10;
        }

        try {
          const canvas = await html2canvas(graph, {
            scale: 2, // Improve quality
            logging: false,
            useCORS: true
          });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 10, currentY, 190, 60);
          currentY += 70;
        } catch (error) {
          console.error('Error capturing graph:', error);
        }
      }

      // Save the PDF
      const fileName = `water-quality-predictions-${duration}days-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success("Predictions report downloaded successfully");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate predictions report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Water Quality Predictions</h1>
        <p className="text-muted-foreground">
          AI-powered predictions based on historical water quality data
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map(station => (
                  <SelectItem key={station._id} value={station._id}>
                    {station.stationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          <Button 
            onClick={handleDownloadPredictionsPDF}
            disabled={loading || !predictions.length}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">Loading predictions...</div>
        ) : (
          <div className="space-y-6">
            {/* pH Predictions */}
            <div className="space-y-6">
              <div data-graph="ph" className="chart-container">
                <h3 className="text-lg font-medium mb-2">
                  pH Level Predictions {selectedStation !== 'all' && `for ${stations.find(s => s._id === selectedStation)?.stationName}`}
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => formatIndianDateTime(value)}
                      />
                      <YAxis domain={[0, 14]} />
                      <Tooltip 
                        labelFormatter={(value) => formatIndianDateTime(value)}
                        formatter={(value) => value.toFixed(2)}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="pH" 
                        stroke="#8884d8" 
                        name="pH Level"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional parameters charts */}
              {['temperature', 'ec', 'tds', 'turbidity'].map(param => (
                <div key={param} data-graph={param} className="chart-container">
                  <h3 className="text-lg font-medium mb-2 capitalize">
                    {param} Predictions {selectedStation !== 'all' && `for ${stations.find(s => s._id === selectedStation)?.stationName}`}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => formatIndianDateTime(value)}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => formatIndianDateTime(value)}
                          formatter={(value) => param === 'temperature' ? `${value.toFixed(1)}°C` : value.toFixed(2)}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={param} 
                          stroke="#82ca9d" 
                          name={param.toUpperCase()}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Predictions;