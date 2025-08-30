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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AIChatPanel from '@/components/AIChatPanel';

// Static standards text for display on cards per user request
const STANDARD_DISPLAY = {
  pH: '6.5 – 8.5',
  turbidity: '≤ 10 NTU',
  tds: '≤ 500 mg/L',
  ec: '≤ 300 µS/cm',
};

// Lightweight inline sparkline component (no external deps)
function Sparkline({ data = [], width = 180, height = 36, stroke = '#2563eb' }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-9 text-xs text-muted-foreground flex items-center">No data</div>
    );
  }
  const w = width;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const dx = data.length > 1 ? w / (data.length - 1) : 0;
  const range = max - min || 1; // avoid divide by zero
  const points = data.map((v, i) => {
    const x = i * dx;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const last = data[data.length - 1];
  const first = data[0];
  const up = last >= first;
  return (
    <div className="w-full">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" />
      </svg>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>7d trend</span>
        <span className={up ? 'text-green-600' : 'text-red-600'}>{up ? '▲' : '▼'}</span>
      </div>
    </div>
  );
}

function WaterQuality() {
  const [activeTab, setActiveTab] = useState("actual");
  const [actualData, setActualData] = useState([]);
  const [allActualData, setAllActualData] = useState([]); // Store all data
  const [predictions, setPredictions] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  // AI Ask dialog state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiActiveParam, setAiActiveParam] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);
  // Pagination for Actual Readings
  const [visibleCount, setVisibleCount] = useState(25);

  // minimal safe markdown renderer for dialog answer
  const renderMarkdown = (text) => {
    if (!text) return '';
    const escapeHtml = (s) => s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    let out = escapeHtml(text);
    out = out.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/60">$1<\/code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1<\/em>');
    out = out.replace(/\n/g, '<br/>');
    return out;
  };

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
      setVisibleCount(25); // reset pagination
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
      setVisibleCount(25);
    } else {
      const filtered = allActualData.filter(reading => 
        reading.stationId?._id === stationId || reading.stationId === stationId
      );
      setActualData(filtered);
      setVisibleCount(25);
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

  // Open Ask AI dialog prefilled for a parameter
  const openAskAIForParam = (paramKey) => {
    setAiActiveParam(paramKey);
    const currentValue = predictions[0]?.[paramKey];
    const status = currentValue ? getParameterStatus(currentValue, paramKey) : 'normal';
    const defaultQ = status === 'high'
      ? `How can we reduce high ${paramKey.toUpperCase()} levels effectively while complying with Indian and global standards?`
      : status === 'low'
      ? `How can we increase low ${paramKey.toUpperCase()} to within acceptable range safely?`
      : `What are best practices to maintain ${paramKey.toUpperCase()} within the normal range?`;
    setAiQuestion(defaultQ);
    setAiAnswer('');
    setAiOpen(true);
  };

  const submitAskAI = async () => {
    if (!aiQuestion?.trim()) {
      toast.error('Please enter a question');
      return;
    }
    try {
      setAiLoading(true);
      const param = aiActiveParam;
      const value = param ? predictions[0]?.[param] : undefined;
      const stationName = selectedStation === 'all' ? undefined : stations.find(s => s._id === selectedStation)?.stationName;
      const standards = WATER_QUALITY_STANDARDS; // can be swapped with dynamic standards if provided by backend
      const resp = await api.post('/ai/ask', { question: aiQuestion, param, value, stationName, standards });
      if (resp.data?.success) {
        const answer = resp.data.answer || '';
        // simulate thinking
        const delay = 500 + Math.floor(Math.random() * 500);
        setAiTyping(true);
        setAiAnswer('');
        await new Promise(r => setTimeout(r, delay));
        // typewriter effect
        let i = 0;
        const step = 3; // chars per tick
        const speed = 12; // ms per tick
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            i += step;
            setAiAnswer(answer.slice(0, i));
            if (i >= answer.length) {
              clearInterval(interval);
              resolve();
            }
          }, speed);
        });
        setAiTyping(false);
      } else {
        toast.error(resp.data?.message || 'AI could not answer');
      }
    } catch (e) {
      console.error('Ask AI error:', e);
      toast.error('Failed to get AI response');
    } finally {
      setAiLoading(false);
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
              } ({Math.min(visibleCount, actualData.length)} of {actualData.length} readings)
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
              {actualData.slice(0, visibleCount).map((reading, idx) => (
                <TableRow key={reading._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
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

          {visibleCount < actualData.length && (
            <div className="flex justify-center mt-4">
              <Button variant="secondary" onClick={() => setVisibleCount((c) => Math.min(c + 25, actualData.length))}>
                Load more ({Math.min(visibleCount + 25, actualData.length) - visibleCount})
              </Button>
            </div>
          )}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: parameter cards */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['pH', 'temperature', 'ec', 'tds', 'turbidity'].map(param => {
                  const currentValue = predictions[0]?.[param];
                  const status = currentValue ? getParameterStatus(currentValue, param) : 'normal';
                  const standards = WATER_QUALITY_STANDARDS[param];
                  const series = predictions.map(p => p?.[param]).filter(v => typeof v === 'number');

                  return (
                    <Card
                      key={param}
                      className="p-4 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openAskAIForParam(param)}
                    >
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

                      {/* Sparkline trend */}
                      <div className="mb-3 -ml-1">
                        <Sparkline data={series} width={200} height={36} />
                      </div>
                       
                      {/* Normal range removed per request */}
                      {STANDARD_DISPLAY[param] && (
                        <div className="mb-3">
                          <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                            Standard: {param.toUpperCase()} {STANDARD_DISPLAY[param]}
                          </span>
                        </div>
                      )}

                      {status !== 'normal' && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                          <p className="font-semibold mb-1">Recommended Action:</p>
                          <p className="text-sm">
                            {status === 'low' ? standards.lowSolution : standards.highSolution}
                          </p>
                        </div>
                      )}

                      <div className="mt-4">
                        <Button
                          variant="secondary"
                          onClick={(e) => { e.stopPropagation(); openAskAIForParam(param); }}
                        >
                          Ask AI about {param.toUpperCase()}
                        </Button>
                      </div>

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
              </div>

              {/* Right: sticky AI chat */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-4">
                  <AIChatPanel
                    title="Ask AI (Water Quality Assistant)"
                    latestValues={predictions[0]}
                    stationName={selectedStation === 'all' ? undefined : stations.find(s => s._id === selectedStation)?.stationName}
                    standards={WATER_QUALITY_STANDARDS}
                  />
                </div>
              </div>
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

      {/* Ask AI Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent style={{ fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}>
          <DialogHeader>
            <DialogTitle>Ask AI {aiActiveParam ? `about ${aiActiveParam.toUpperCase()}` : ''}</DialogTitle>
            <DialogDescription>
              Questions must be about water quality and environment. The AI is constrained to this domain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-left">
            <Textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Type your question..."
              rows={5}
            />
            {aiTyping && (
              <div className="text-sm text-green-700">
                <span className="font-medium">Assistant:</span>
                <span className="ml-2 inline-flex items-center gap-1 opacity-70">
                  typing
                  <span className="inline-block w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                  <span className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"></span>
                  <span className="inline-block w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </span>
              </div>
            )}
            {aiAnswer && (
              <div
                className="p-3 rounded border bg-muted/30 text-sm max-h-60 overflow-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAnswer) }}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={submitAskAI} disabled={aiLoading}>{aiLoading ? 'Asking...' : 'Ask'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WaterQuality;