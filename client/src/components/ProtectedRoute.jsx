import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  return children;
}

export default ProtectedRoute;

import ProtectedRoute from "./components/ProtectedRoute";
// ...existing imports...

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* ...other protected routes... */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}