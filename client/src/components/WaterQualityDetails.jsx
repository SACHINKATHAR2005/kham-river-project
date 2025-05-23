import { Card } from "@/components/ui/card";

function WaterQualityDetails({ data }) {
  if (!data || data.length === 0) {
    return <p>No water quality data available for this station.</p>;
  }

  const latestReading = data[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium">pH Level</h3>
          <p className="text-2xl font-bold">{latestReading.ph || latestReading.pH}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium">Temperature</h3>
          <p className="text-2xl font-bold">{latestReading.temperature}°C</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium">Dissolved Oxygen</h3>
          <p className="text-2xl font-bold">
            {latestReading.dissolvedOxygen || latestReading.dissolved_oxygen} mg/L
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium">Turbidity</h3>
          <p className="text-2xl font-bold">
            {latestReading.turbidity} NTU
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-4">Historical Readings</h3>
        <div className="space-y-2">
          {data.map((reading) => (
            <Card key={reading._id} className="p-4">
              <div className="flex justify-between">
                <span>
                  {new Date(reading.timestamp || reading.updated).toLocaleDateString()}
                </span>
                <span>pH: {reading.ph || reading.pH}</span>
                <span>Temp: {reading.temperature}°C</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WaterQualityDetails;