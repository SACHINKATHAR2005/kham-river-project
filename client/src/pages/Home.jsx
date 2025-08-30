import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Home() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="w-full max-w-6xl mx-auto text-center pt-16">
        <span className="inline-block text-xs font-medium tracking-wide uppercase bg-green-100 text-green-700 px-3 py-1 rounded-full mb-4">
          AI-powered water quality insights
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Kham River Water Quality Monitoring
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[800px] mx-auto">
          Monitor, analyze, and act on river water parameters with real-time data, standards-aware AI guidance, and clear recommendations.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Button asChild size="lg">
            <Link to="/water-quality">Open Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">AI Chatbot (Concise)</h3>
          <p className="text-muted-foreground">
            Ask natural questions and get on-point answers in ~100 words. Aligned to CPCB/BIS/WHO/EPA; markdown formatted; typing effect for great UX.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Standards-aware Suggestions</h3>
          <p className="text-muted-foreground">
            Cards show key standards (pH, Turbidity, TDS, EC). Click a card to ask AI for actionable steps tailored to your station.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
          <p className="text-muted-foreground">
            Live parameter values across stations with quick export to CSV/PDF and trend analysis.
          </p>
        </div>
      </section>

      {/* Secondary features */}
      <section className="w-full max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Actionable Guidance</h3>
          <p className="text-muted-foreground">
            Clear mitigation steps, monitoring cadence, and escalation points—kept within scope to avoid hallucinations.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Reports & Downloads</h3>
          <p className="text-muted-foreground">
            Generate and download clean CSV/PDF reports for compliance and sharing.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;