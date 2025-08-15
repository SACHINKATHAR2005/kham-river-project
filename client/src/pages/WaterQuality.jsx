import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api, mlApi } from '@/api/axios';
import { formatIndianDateTime } from '@/utils/dateFormat';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function WaterQuality() {
  const [activeTab, setActiveTab] = useState("actual");
  const [actualData, setActualData] = useState([]);
  const [allActualData, setAllActualData] = useState([]); // Store all data
  const [predictions, setPredictions] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stationsRes, actualDataRes] = await Promise.all([
        api.get('/station/getall'),
        api.get('/waterQuality/getall')
      ]);
      
      setStations(stationsRes.data.data);
      setAllActualData(actualDataRes.data.data); // Store all data
      setActualData(actualDataRes.data.data); // Initially show all data
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected station
  const filterDataByStation = (stationId) => {
    if (stationId === 'all') {
      setActualData(allActualData);
    } else {
      const filtered = allActualData.filter(reading => 
        reading.stationId?._id === stationId || reading.stationId === stationId
      );
      setActualData(filtered);
    }
  };

  // Update the fetchPredictions function
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const endpoint = selectedStation === 'all' 
        ? '/predict/7'
        : `/predict/station/${selectedStation}/7`;
      
      const response = await mlApi.get(endpoint);
      const data = response.data;
      const normalized = Array.isArray(data) ? data : (data?.predictions ?? []);
      setPredictions(normalized);
    } catch (error) {
      toast.error("Failed to fetch predictions");
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter actual data when station changes
    filterDataByStation(selectedStation);
    
    // Fetch predictions when station changes
    if (activeTab === "predictions") {
      fetchPredictions();
    }
  }, [selectedStation, allActualData]);

  useEffect(() => {
    // Fetch predictions when switching to predictions tab
    if (activeTab === "predictions") {
      fetchPredictions();
    }
  }, [activeTab]);

  const handleDownloadCSV = () => {
    try {
      // Create CSV headers
      const headers = ['Station', 'Date & Time', 'pH', 'Temperature', 'EC', 'TDS', 'Turbidity'];
      
      // Convert data to CSV format
      const csvData = actualData.map(reading => [
        reading.stationId?.stationName || 'Unknown',
        formatIndianDateTime(reading.timestamp),
        reading.pH?.toFixed(2) || '',
        reading.temperature?.toFixed(2) || '',
        reading.ec?.toFixed(2) || '',
        reading.tds?.toFixed(2) || '',
        reading.turbidity?.toFixed(2) || ''
      ]);

      // Combine headers and data
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `water-quality-data-${formatIndianDateTime(new Date())}.csv`);
      
      toast.success('Data downloaded successfully');
    } catch (error) {
      toast.error('Failed to download data');
      console.error('Download error:', error);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("Kham River Water Quality Data", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

      // Add table
      autoTable(doc, {
        head: [["Station", "Date & Time", "pH", "Temperature (°C)", "EC", "TDS", "Turbidity"]],
        body: actualData.map(reading => [
          reading.stationId?.stationName || "Unknown",
          formatIndianDateTime(reading.timestamp),
          reading.pH?.toFixed(2) || "-",
          reading.temperature?.toFixed(2) || "-",
          reading.ec?.toFixed(2) || "-",
          reading.tds?.toFixed(2) || "-",
          reading.turbidity?.toFixed(2) || "-"
        ]),
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [240, 245, 255] }
      });

      // Save the PDF
      doc.save(`water-quality-data-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const getParameterStatus = (value, parameter) => {
    const standards = WATER_QUALITY_STANDARDS[parameter];
    if (value < standards.min) return 'low';
    if (value > standards.max) return 'high';
    return 'normal';
  };

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
    // Don't navigate, just update the data
    if (activeTab === "predictions") {
      fetchPredictions(stationId);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="actual">Actual Readings</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="actual" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Water Quality Readings</h2>
            <div className="flex items-center gap-4">
              <Select value={selectedStation} onValueChange={handleStationChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select station" />
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
              <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">
              <strong>Showing:</strong> {selectedStation === 'all' 
                ? 'All Stations' 
                : stations.find(s => s._id === selectedStation)?.stationName
              } ({actualData.length} readings)
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>EC</TableHead>
                <TableHead>TDS</TableHead>
                <TableHead>Turbidity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actualData.map((reading) => (
                <TableRow key={reading._id}>
                  <TableCell>{reading.stationId?.stationName}</TableCell>
                  <TableCell>{formatIndianDateTime(reading.timestamp)}</TableCell>
                  <TableCell>{reading.pH?.toFixed(2)}</TableCell>
                  <TableCell>{reading.temperature?.toFixed(2)}°C</TableCell>
                  <TableCell>{reading.ec?.toFixed(2)}</TableCell>
                  <TableCell>{reading.tds?.toFixed(2)}</TableCell>
                  <TableCell>{reading.turbidity?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">AI Water Quality Predictions</h2>
              <p className="text-sm text-muted-foreground">
                7-day predictions for {selectedStation === 'all' ? 'all stations' : stations.find(s => s._id === selectedStation)?.stationName}
              </p>
            </div>
            <Select 
              value={selectedStation} 
              onValueChange={handleStationChange}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select station" />
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
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading AI predictions...</p>
              </div>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
              <p className="text-muted-foreground mb-4">
                Unable to generate predictions. This could be due to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto">
                <li>• ML service not running (check port 8000)</li>
                <li>• Insufficient historical data for training</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['pH', 'temperature', 'ec', 'tds', 'turbidity'].map(param => {
                const currentValue = predictions[0]?.[param];
                const status = currentValue ? getParameterStatus(currentValue, param) : 'normal';
                const standards = WATER_QUALITY_STANDARDS[param];

                return (
                  <Card key={param} className="p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{param.toUpperCase()}</h3>
                        {selectedStation !== 'all' && (
                          <p className="text-sm text-muted-foreground">
                            {stations.find(s => s._id === selectedStation)?.stationName}
                          </p>
                        )}
                      </div>
                      {status === 'normal' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    
                    <div className="text-3xl font-bold mb-2">
                      {currentValue?.toFixed(2)}
                      {param === 'temperature' ? '°C' : ''}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      Normal range: {standards.min} - {standards.max}
                    </div>

                    {status !== 'normal' && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                        <p className="font-semibold mb-1">Recommended Action:</p>
                        <p className="text-sm">
                          {status === 'low' ? standards.lowSolution : standards.highSolution}
                        </p>
                      </div>
                    )}

                    {/* Add gradient background effect */}
                    <div className={`absolute inset-0 opacity-10 ${
                      status === 'normal' 
                        ? 'bg-gradient-to-br from-green-200 to-green-400' 
                        : 'bg-gradient-to-br from-yellow-200 to-yellow-400'
                    }`} />
                  </Card>
                );
              })}
            </div>
          )}

          {/* Solutions Section */}
          {predictions[0] && (
            <Card className="mt-8 p-6">
              <h3 className="text-xl font-bold mb-4">Water Quality Solutions & Global Initiatives</h3>
              <div className="space-y-6">
                {Object.entries(WATER_QUALITY_STANDARDS).map(([param, standards]) => {
                  const value = predictions[0][param];
                  const status = getParameterStatus(value, param);
                  
                  if (status === 'normal') return null;

                  return (
                    <div key={param} className="border-l-4 border-yellow-500 pl-4">
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-lg">{param.toUpperCase()} Issue</h4>
                        <p className="mb-3">{status === 'low' ? standards.lowSolution : standards.highSolution}</p>
                        
                        {selectedStation !== 'all' && (
                          <p className="text-sm text-blue-600 mb-3">
                            <strong>Specific to:</strong> {stations.find(s => s._id === selectedStation)?.stationName}
                          </p>
                        )}
                        
                        <div className="mt-4">
                          <h5 className="font-semibold mb-2 text-sm text-gray-700">Global Initiatives:</h5>
                          <ul className="space-y-1">
                            {standards.globalInitiatives.map((initiative, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {initiative}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WaterQuality;