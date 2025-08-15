import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIndianDateTime } from '@/utils/dateFormat';

function Stations() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/station/getall');
        if (response.data) {
          setStations(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleStationClick = async (station) => {
    try {
      const response = await api.get('/waterQuality/getall');
      if (response.data) {
        // Filter water quality data for selected station
        const stationData = response.data.data.filter(
          item => item.stationId._id === station._id
        );
        // Sort by date
        const sortedData = stationData.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setWaterQualityData(sortedData);
        setSelectedStation(station);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch water quality data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Monitoring Stations</h1>
        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>River Bank Side</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station) => (
                <TableRow key={station._id}>
                  <TableCell>{station.stationName}</TableCell>
                  <TableCell>{station.stationId}</TableCell>
                  <TableCell>{station.region}</TableCell>
                  <TableCell>{station.riverBankSide}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Water Quality Data for {selectedStation?.stationName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {waterQualityData.length > 0 ? (
              waterQualityData.map((reading) => (
                <Card key={reading._id} className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date: {formatIndianDateTime(reading.timestamp)}
                      </p>
                      <p className="text-sm font-medium">pH: {reading.pH}</p>
                      <p className="text-sm font-medium">Temperature: {reading.temperature}°C</p>
                      <p className="text-sm font-medium">EC: {reading.ec}</p>
                      <p className="text-sm font-medium">TDS: {reading.tds}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Turbidity: {reading.turbidity} NTU</p>
                      {reading.remarks && (
                        <p className="text-sm font-medium">Remarks: {reading.remarks}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p>No water quality data available for this station.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Stations;