import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* FACULTY */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute role="FACULTY">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* STUDENT */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK (OPTIONAL BUT GOOD) */}
          <Route path="*" element={<h2>404 – Page Not Found</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
