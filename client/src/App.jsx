import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WaterQuality from "./pages/WaterQuality";
import Predictions from "./pages/Predictions";
import RealTime from "./pages/RealTime";

import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/water-quality" element={<WaterQuality />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/real-time" element={<RealTime />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
