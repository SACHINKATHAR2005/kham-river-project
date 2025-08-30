import { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceArea, ReferenceLine } from 'recharts';
import { toast } from "sonner";
import { api, mlApi } from '@/api/axios';
import { formatIndianDateTime } from '@/utils/dateFormat';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WATER_QUALITY_STANDARDS } from '@/constants/waterQualityStandards';

function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [standards, setStandards] = useState(null);

  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('7');
  const [selectedParam, setSelectedParam] = useState('pH');
  

  const fetchStations = async () => {
    try {
      const response = await api.get('/station/getall');
      setStations(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch stations");
    }
  };

  const getParameterStatus = (value, param) => {
    if (value == null) return 'normal';
    const s = standards?.[param] || WATER_QUALITY_STANDARDS?.[param];
    if (!s) return 'normal';
    if (s.min != null && value < s.min) return 'low';
    if (s.max != null && value > s.max) return 'high';
    return 'normal';
  };

  const getHistogramData = (arr, bins = 8) => {
    if (!arr?.length) return [];
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    if (!isFinite(min) || !isFinite(max) || min === max) {
      return [{ bin: `${min?.toFixed(2)}`, count: arr.length }];
    }
    const width = (max - min) / bins;
    const counts = new Array(bins).fill(0);
    arr.forEach(v => {
      let idx = Math.floor((v - min) / width);
      if (idx >= bins) idx = bins - 1;
      counts[idx]++;
    });
    return counts.map((c, i) => ({
      bin: `${(min + i * width).toFixed(2)}–${(min + (i + 1) * width).toFixed(2)}`,
      count: c
    }));
  };

  // Histogram with threshold statuses for coloring bins
  const getHistogramDataWithStatus = (param, bins = 8) => {
    const values = predictions.map(p => p?.[param]).filter(v => typeof v === 'number');
    if (!values.length) return [];
    const raw = getHistogramData(values, bins);
    const s = getParamStandards(param);
    return raw.map((b) => {
      const [loStr, hiStr] = b.bin.split('–');
      const binLow = Number(loStr);
      const binHigh = Number(hiStr ?? loStr);
      let status = 'normal';
      if (s) {
        if (s.min != null && binHigh < s.min) status = 'low';
        else if (s.max != null && binLow > s.max) status = 'high';
        else status = 'normal';
      }
      return { ...b, binLow, binHigh, status };
    });
  };

  const getStatusPieData = (param) => {
    const vals = predictions.map(p => p[param]).filter(v => typeof v === 'number');
    let low = 0, normal = 0, high = 0;
    vals.forEach(v => {
      const s = getParameterStatus(v, param);
      if (s === 'low') low++;
      else if (s === 'high') high++;
      else normal++;
    });
    return [
      { name: 'Low', value: low },
      { name: 'Normal', value: normal },
      { name: 'High', value: high },
    ];
  };

  const getParamStandards = (param) => {
    const s = standards?.[param] || WATER_QUALITY_STANDARDS?.[param];
    if (!s) return null;
    const { min, max } = s;
    return { min, max };
  };

  const computeInsights = (param) => {
    const vals = predictions.map(p => p?.[param]).filter(v => typeof v === 'number');
    const n = vals.length;
    if (!n) return null;
    const first = vals[0];
    const last = vals[n - 1];
    const delta = last - first;
    const rate = n > 1 ? delta / (n - 1) : 0;
    const eps = 1e-3;
    const trend = Math.abs(delta) < eps ? 'stable' : (delta > 0 ? 'rising' : 'falling');
    const s = getParamStandards(param);
    let out = 0;
    if (s) {
      for (const v of vals) {
        const st = getParameterStatus(v, param);
        if (st !== 'normal') out++;
      }
    }
    const outPct = n ? Math.round((out / n) * 100) : 0;
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const lastStatus = getParameterStatus(last, param);
    return { trend, rate, delta, outPct, minV, maxV, last, lastStatus };
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
      // Capture standards if provided
      setStandards(Array.isArray(data) ? null : (data?.standards ?? null));
      setPredictions(normalized);

      // If comparison is enabled and we are not already on 'all', fetch the All Stations series
      if (compareAll && selectedStation !== 'all') {
        const allRes = await mlApi.get(`/predict/${duration}`);
        const allData = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.predictions ?? []);
        setAllPredictions(allData);
      } else {
        setAllPredictions([]);
      }
      
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
  }, [selectedStation, duration, compareAll]);

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
      const predictions = Array.isArray(response.data) ? response.data : (response.data?.predictions ?? []);
      
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

      // Add AI Insights summary for the selected parameter
      const insights = computeInsights(selectedParam);
      let currentY = doc.lastAutoTable.finalY + 10;
      if (insights) {
        doc.setFontSize(12);
        doc.text(`AI Insights for ${selectedParam.toUpperCase()}`, 14, currentY);
        doc.setFontSize(10);
        const unit = selectedParam === 'temperature' ? '°C' : '';
        const lines = [
          `Trend: ${insights.trend} (Δ ${insights.delta.toFixed(2)}${unit}; ~${insights.rate.toFixed(2)}${unit}/day)`,
          `Last: ${insights.last.toFixed(2)}${unit} — status ${insights.lastStatus}`,
          `Range: ${insights.minV.toFixed(2)} – ${insights.maxV.toFixed(2)}${unit}`,
          `Out-of-range: ${insights.outPct}% of predictions`,
        ];
        let y = currentY + 6;
        lines.forEach((ln) => { doc.text(ln, 16, y); y += 6; });
        currentY = y + 2; // space before standards
      }

      // Add Standards summary block (uses response standards or defaults)
      const std = standards || WATER_QUALITY_STANDARDS;
      if (std) {
        doc.setFontSize(12);
        doc.text('Standards Summary', 14, currentY);
        doc.setFontSize(10);
        const stdLines = [];
        if (std.pH) stdLines.push(`pH: ${std.pH.min ?? '-'} – ${std.pH.max ?? '-'}`);
        if (std.turbidity) stdLines.push(`Turbidity (NTU): ≤ ${std.turbidity.max ?? '-'}`);
        if (std.tds) stdLines.push(`TDS (mg/L): ≤ ${std.tds.max ?? '-'}`);
        if (std.ec) stdLines.push(`EC (µS/cm): ≤ ${std.ec.max ?? '-'}`);
        if (std.temperature) stdLines.push(`Temperature (°C): ${std.temperature.min ?? '-'} – ${std.temperature.max ?? '-'}`);
        let y2 = currentY + 6;
        stdLines.forEach((ln) => { doc.text(`• ${ln}`, 16, y2); y2 += 6; });
        currentY = y2 + 2;
      }

      // Capture and add graphs
      const graphDivs = document.querySelectorAll('[data-graph]');

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
        {/* Standards panel */}
        {standards && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded border"><b>pH</b>: {standards.pH?.min} – {standards.pH?.max}</div>
            <div className="p-3 rounded border"><b>Turbidity (NTU)</b>: ≤ {standards.turbidity?.max}</div>
            <div className="p-3 rounded border"><b>TDS (mg/L)</b>: ≤ {standards.tds?.max}</div>
            <div className="p-3 rounded border"><b>EC (µS/cm)</b>: ≤ {standards.ec?.max}</div>
          </div>
        )}
        {/* AI Insights Summary */}
        {!loading && predictions.length > 0 && (
          <div className="mb-6 p-4 rounded-md border bg-muted/30">
            {(() => {
              const ins = computeInsights(selectedParam);
              if (!ins) return null;
              const unit = selectedParam === 'temperature' ? '°C' : '';
              return (
                <div className="text-sm">
                  <div className="font-semibold mb-1">AI Insights for {selectedParam.toUpperCase()}</div>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Trend: <b className={ins.trend === 'rising' ? 'text-green-700' : ins.trend === 'falling' ? 'text-red-700' : 'text-foreground'}>{ins.trend}</b> (Δ {ins.delta.toFixed(2)}{unit} over {predictions.length - 1} days; ~{ins.rate.toFixed(2)}{unit}/day)</li>
                    <li>Last value: <b>{ins.last.toFixed(2)}{unit}</b> — status <b className={ins.lastStatus === 'normal' ? 'text-green-700' : 'text-yellow-700'}>{ins.lastStatus}</b></li>
                    <li>Range observed: <b>{ins.minV.toFixed(2)} – {ins.maxV.toFixed(2)}{unit}</b></li>
                    <li>Out-of-range points: <b>{ins.outPct}%</b> of predictions</li>
                  </ul>
                </div>
              );
            })()}
          </div>
        )}
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

            <Select value={selectedParam} onValueChange={setSelectedParam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Parameter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pH">pH</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="ec">EC</SelectItem>
                <SelectItem value="tds">TDS</SelectItem>
                <SelectItem value="turbidity">Turbidity</SelectItem>
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
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="hist">Histogram</TabsTrigger>
              <TabsTrigger value="pie">Pie</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="line" className="space-y-6">
              <div data-graph={`line-${selectedParam}`} className="chart-container">
                <h3 className="text-lg font-medium mb-2 capitalize">
                  {selectedParam} Predictions {selectedStation !== 'all' && `for ${stations.find(s => s._id === selectedStation)?.stationName}`}
                </h3>
                <div className="h-[260px] md:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(v) => formatIndianDateTime(v)} />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(v) => formatIndianDateTime(v)} 
                        formatter={(val, name, props) => {
                          const s = getParamStandards(selectedParam);
                          const status = getParameterStatus(val, selectedParam);
                          const unit = selectedParam === 'temperature' ? '°C' : '';
                          const label = `${name} • ${status}${s ? ` (ok ${s.min ?? '-'}–${s.max ?? '-'})` : ''}`;
                          return [`${typeof val === 'number' ? val.toFixed(2) : val}${unit}`, label];
                        }} 
                      />
                      <Legend />
                      {(() => {
                        const s = getParamStandards(selectedParam);
                        if (!s) return null;
                        return (
                          <>
                            <ReferenceArea y1={s.min} y2={s.max} fill="#22c55e" fillOpacity={0.12} ifOverflow="extendDomain" />
                            {s.min != null && <ReferenceLine y={s.min} stroke="#16a34a" strokeDasharray="4 4" />}
                            {s.max != null && <ReferenceLine y={s.max} stroke="#16a34a" strokeDasharray="4 4" />}
                          </>
                        );
                      })()}
                      <Line type="monotone" dataKey={selectedParam} stroke="#0ea5e9" name={`${selectedParam.toUpperCase()} (${selectedStation === 'all' ? 'ALL' : 'Station' })`} />
                      {compareAll && selectedStation !== 'all' && (
                        <Line type="monotone" dataKey={selectedParam} data={allPredictions} stroke="#ef4444" name={`${selectedParam.toUpperCase()} (ALL)`} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bar">
              <div data-graph={`bar-${selectedParam}`} className="chart-container">
                <h3 className="text-lg font-medium mb-2 capitalize">{selectedParam} Bar (time)</h3>
                <div className="h-[260px] md:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(v) => formatIndianDateTime(v)} />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(v) => formatIndianDateTime(v)} 
                        formatter={(val, name) => {
                          const s = getParamStandards(selectedParam);
                          const status = getParameterStatus(val, selectedParam);
                          const unit = selectedParam === 'temperature' ? '°C' : '';
                          const label = `${name} • ${status}${s ? ` (ok ${s.min ?? '-'}–${s.max ?? '-'})` : ''}`;
                          return [`${typeof val === 'number' ? val.toFixed(2) : val}${unit}`, label];
                        }} 
                      />
                      <Legend />
                      {(() => {
                        const s = getParamStandards(selectedParam);
                        if (!s) return null;
                        return (
                          <>
                            <ReferenceArea y1={s.min} y2={s.max} fill="#22c55e" fillOpacity={0.12} ifOverflow="extendDomain" />
                            {s.min != null && <ReferenceLine y={s.min} stroke="#16a34a" strokeDasharray="4 4" />}
                            {s.max != null && <ReferenceLine y={s.max} stroke="#16a34a" strokeDasharray="4 4" />}
                          </>
                        );
                      })()}
                      <Bar dataKey={selectedParam} fill="#10b981" name={`${selectedParam.toUpperCase()} (${selectedStation === 'all' ? 'ALL' : 'Station'})`} />
                      {compareAll && selectedStation !== 'all' && (
                        <Bar dataKey={selectedParam} data={allPredictions} fill="#fb7185" name={`${selectedParam.toUpperCase()} (ALL)`} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hist">
              <div data-graph={`hist-${selectedParam}`} className="chart-container">
                <h3 className="text-lg font-medium mb-2 capitalize">{selectedParam} Histogram</h3>
                <div className="text-xs text-muted-foreground mb-1">Color-coded by thresholds: <span className="text-amber-600">Low</span> · <span className="text-green-600">Normal</span> · <span className="text-red-600">High</span></div>
                <div className="h-[260px] md:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getHistogramDataWithStatus(selectedParam)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip formatter={(v, n, props) => [v, `Count (${props?.payload?.status ?? 'normal'})`]} />
                      <Legend />
                      <Bar dataKey="count" name="Count">
                        {getHistogramDataWithStatus(selectedParam).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'low' ? '#f59e0b' : entry.status === 'high' ? '#ef4444' : '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pie">
              <div data-graph={`pie-${selectedParam}`} className="chart-container">
                <h3 className="text-lg font-medium mb-2 capitalize">{selectedParam} Status Distribution</h3>
                <div className="h-[260px] md:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={getStatusPieData(selectedParam)} dataKey="value" nameKey="name" outerRadius={100} label>
                        {getStatusPieData(selectedParam).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#f59e0b", "#22c55e", "#ef4444"][index]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overview">
              <div className="space-y-6">
                <div data-graph="ph" className="chart-container">
                  <h3 className="text-lg font-medium mb-2">
                    pH Level Predictions {selectedStation !== 'all' && `for ${stations.find(s => s._id === selectedStation)?.stationName}`}
                  </h3>
                  <div className="h-[240px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tickFormatter={(value) => formatIndianDateTime(value)} />
                        <YAxis domain={[0, 14]} />
                        <Tooltip labelFormatter={(value) => formatIndianDateTime(value)} formatter={(val, name) => [`${typeof val === 'number' ? val.toFixed(2) : val}`, name]} />
                        <Legend />
                        {(() => {
                          const s = getParamStandards('pH');
                          if (!s) return null;
                          return (
                            <>
                              <ReferenceArea y1={s.min} y2={s.max} fill="#22c55e" fillOpacity={0.12} ifOverflow="extendDomain" />
                              {s.min != null && <ReferenceLine y={s.min} stroke="#16a34a" strokeDasharray="4 4" />}
                              {s.max != null && <ReferenceLine y={s.max} stroke="#16a34a" strokeDasharray="4 4" />}
                            </>
                          );
                        })()}
                        <Line type="monotone" dataKey="pH" stroke="#8884d8" name="pH Level" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {['temperature', 'ec', 'tds', 'turbidity'].map(param => (
                  <div key={param} data-graph={param} className="chart-container">
                    <h3 className="text-lg font-medium mb-2 capitalize">
                      {param} Predictions {selectedStation !== 'all' && `for ${stations.find(s => s._id === selectedStation)?.stationName}`}
                    </h3>
                    <div className="h-[240px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={predictions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" tickFormatter={(value) => formatIndianDateTime(value)} />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => formatIndianDateTime(value)} 
                            formatter={(val, name) => {
                              const s = getParamStandards(param);
                              const status = getParameterStatus(val, param);
                              const unit = param === 'temperature' ? '°C' : '';
                              const label = `${name} • ${status}${s ? ` (ok ${s.min ?? '-'}–${s.max ?? '-'})` : ''}`;
                              return [`${typeof val === 'number' ? (param === 'temperature' ? val.toFixed(1) : val.toFixed(2)) : val}${unit}`, label];
                            }} 
                          />
                          <Legend />
                          {(() => {
                            const s = getParamStandards(param);
                            if (!s) return null;
                            return (
                              <>
                                <ReferenceArea y1={s.min} y2={s.max} fill="#22c55e" fillOpacity={0.12} ifOverflow="extendDomain" />
                                {s.min != null && <ReferenceLine y={s.min} stroke="#16a34a" strokeDasharray="4 4" />}
                                {s.max != null && <ReferenceLine y={s.max} stroke="#16a34a" strokeDasharray="4 4" />}
                              </>
                            );
                          })()}
                          <Line type="monotone" dataKey={param} stroke="#82ca9d" name={param.toUpperCase()} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
}

export default Predictions;