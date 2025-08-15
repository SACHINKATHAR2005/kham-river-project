import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddStation from "@/components/admin/AddStation";
import AddWaterQuality from "@/components/admin/AddWaterQuality";
import EditStation from "@/components/admin/EditStation";
import CsvUpload from "@/components/admin/CsvUpload";
import api from "@/api/axios";
import { formatIndianDateTime } from '@/utils/dateFormat';
import EditWaterQuality from "@/components/admin/EditWaterQuality";

function Dashboard() {
  const [stations, setStations] = useState([]);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState(null);

  const fetchData = async () => {
    try {
      const [stationsRes, waterQualityRes] = await Promise.all([
        api.get('/station/getall'),
        api.get('/waterQuality/getall')
      ]);
      setStations(stationsRes.data.data);
      setWaterQualityData(waterQualityRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteStation = async (id) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await api.delete(`/station/delete/${id}`);
        toast.success('Station deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete station');
      }
    }
  };

  const handleDeleteWaterQuality = async (id) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      try {
        await api.delete(`/waterQuality/delete/${id}`);
        toast.success('Reading deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete reading');
      }
    }
  };

  const [editingWaterQuality, setEditingWaterQuality] = useState(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="view-data">
        <TabsList className="mb-4">
          <TabsTrigger value="view-data">View All Data</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="add-data">Add Water Quality</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="view-data">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Water Quality Readings</h2>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waterQualityData.map((reading) => (
                  <TableRow key={reading._id}>
                    <TableCell>{reading.stationId?.stationName || 'Unknown Station'}</TableCell>
                    <TableCell>{formatIndianDateTime(reading.timestamp)}</TableCell>
                    <TableCell>{reading.pH}</TableCell>
                    <TableCell>{reading.temperature}°C</TableCell>
                    <TableCell>{reading.ec}</TableCell>
                    <TableCell>{reading.tds}</TableCell>
                    <TableCell>{reading.turbidity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Edit 
                          className="h-4 w-4 cursor-pointer" 
                          onClick={() => setEditingWaterQuality(reading)}
                        />
                        <Trash2 
                          className="h-4 w-4 cursor-pointer text-destructive"
                          onClick={() => handleDeleteWaterQuality(reading._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <div className="space-y-4">
            <AddStation onSuccess={fetchData} />
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">All Stations</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>River Bank Side</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stations.map((station) => (
                    <TableRow key={station._id}>
                      <TableCell>{station.stationId}</TableCell>
                      <TableCell>{station.stationName}</TableCell>
                      <TableCell>{station.region}</TableCell>
                      <TableCell>{station.riverBankSide}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Edit 
                            className="h-4 w-4 cursor-pointer" 
                            onClick={() => setEditingStation(station)}
                          />
                          <Trash2 
                            className="h-4 w-4 cursor-pointer text-destructive"
                            onClick={() => handleDeleteStation(station._id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-data">
          <AddWaterQuality stations={stations} onSuccess={fetchData} />
        </TabsContent>

        <TabsContent value="upload">
          <CsvUpload onSuccess={fetchData} />
        </TabsContent>
      </Tabs>

      {editingWaterQuality && (
        <EditWaterQuality
          data={editingWaterQuality}
          onClose={() => setEditingWaterQuality(null)}
          onSuccess={fetchData}
        />
      )}

      {editingStation && (
        <EditStation
          station={editingStation}
          onClose={() => setEditingStation(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

export default Dashboard;