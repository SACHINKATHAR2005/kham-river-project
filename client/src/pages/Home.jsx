import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <h1 className="text-4xl font-bold tracking-tighter mb-4">
        Kham River Water Quality Monitoring
      </h1>
      <p className="text-xl text-muted-foreground max-w-[600px] mb-8">
        Real-time monitoring system for water quality parameters across multiple stations
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link to="/stations">View Stations</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/water-quality">Water Quality Data</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
          <p className="text-muted-foreground">
            Get instant updates on water quality parameters from all monitoring stations
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Analysis</h3>
          <p className="text-muted-foreground">
            Analyze trends and patterns in water quality over time
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quality Reports</h3>
          <p className="text-muted-foreground">
            Generate detailed reports on water quality parameters
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;