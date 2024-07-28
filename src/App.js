import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CsLabAttendance from './components/CsLabAttendance';
import SignIn from './components/SignIn';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import './assets/styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<CsLabAttendance />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
