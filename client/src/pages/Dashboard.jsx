import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddStation from "@/components/admin/AddStation";
import AddWaterQuality from "@/components/admin/AddWaterQuality";
import EditStation from "@/components/admin/EditStation";
import api from "@/api/axios";

function Dashboard() {
  const [stations, setStations] = useState([]);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isEditStationOpen, setIsEditStationOpen] = useState(false);
  const [selectedWaterQuality, setSelectedWaterQuality] = useState(null);
  const [isEditWaterQualityOpen, setIsEditWaterQualityOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, [navigate]);

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;
    
    try {
      await api.delete(`/station/delete/${stationId}`);
      toast.success("Station deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete station");
    }
  };

  const handleDeleteWaterQuality = async (readingId) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) return;
    
    try {
      await api.delete(`/waterQuality/delete/${readingId}`);
      toast.success("Reading deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete reading");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="view-data">
        <TabsList>
          <TabsTrigger value="view-data">View All Data</TabsTrigger>
          <TabsTrigger value="stations">Stations Management</TabsTrigger>
          <TabsTrigger value="water-quality">Add Water Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="view-data">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Stations Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">All Stations</h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Station Name</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>River Bank</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stations.map((station) => (
                        <TableRow key={station._id}>
                          <TableCell className="font-medium">{station.stationName}</TableCell>
                          <TableCell>{station.stationId}</TableCell>
                          <TableCell>{station.region}</TableCell>
                          <TableCell>{station.riverBankSide}</TableCell>
                          <TableCell>{new Date(station.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStation(station);
                                  setIsEditStationOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteStation(station._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Water Quality Data Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">All Water Quality Readings</h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Station</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>pH</TableHead>
                        <TableHead>Temp (°C)</TableHead>
                        <TableHead>EC</TableHead>
                        <TableHead>TDS</TableHead>
                        <TableHead>Turbidity</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waterQualityData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((reading) => (
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
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWaterQuality(reading);
                                    setIsEditWaterQualityOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteWaterQuality(reading._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Stations</h2>
              <AddStation onSuccess={fetchData} />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>River Bank</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station._id}>
                    <TableCell>{station.stationName}</TableCell>
                    <TableCell>{station.stationId}</TableCell>
                    <TableCell>{station.region}</TableCell>
                    <TableCell>{station.riverBankSide}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStation(station);
                            setIsEditStationOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteStation(station._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="water-quality">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Water Quality Readings</h2>
              <AddWaterQuality stations={stations} onSuccess={fetchData} />
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waterQualityData.map((reading) => (
                  <TableRow key={reading._id}>
                    <TableCell>{reading.stationId.stationName}</TableCell>
                    <TableCell>
                      {new Date(reading.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{reading.pH}</TableCell>
                    <TableCell>{reading.temperature}°C</TableCell>
                    <TableCell>{reading.ec}</TableCell>
                    <TableCell>{reading.tds}</TableCell>
                    <TableCell>{reading.turbidity}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWaterQuality(reading);
                            setIsEditWaterQualityOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteWaterQuality(reading._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedStation && (
        <EditStation
          station={selectedStation}
          isOpen={isEditStationOpen}
          onClose={() => {
            setIsEditStationOpen(false);
            setSelectedStation(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {selectedWaterQuality && (
        <EditWaterQuality
          data={selectedWaterQuality}
          isOpen={isEditWaterQualityOpen}
          onClose={() => {
            setIsEditWaterQualityOpen(false);
            setSelectedWaterQuality(null);
          }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

export default Dashboard;