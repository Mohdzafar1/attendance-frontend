import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';

// Employee Components
import EmployeeDashboard from './components/Employee/Dashboard';
import AttendanceHistory from './components/Employee/AttendanceHistory';
import CorrectionRequests from './components/Employee/CorrectionRequests';

// HR Components
import PendingRequests from './components/HR/PendingRequests';
import AllAttendance from './components/HR/AllAttendance';
import HRDashboard from './components/HR/HRDashboard';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AttendanceRules from './components/Admin/AttendanceRules';
import AuditLogs from './components/Admin/AuditLogs';
import AttendancePanel from './components/Employee/AttendancePanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Employee Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['employee']}>
              <Layout>
                {/* <EmployeeDashboard /> */}
                <AttendancePanel/>

              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/history" element={
            <PrivateRoute roles={['employee']}>
              <Layout>
                <AttendanceHistory />
              </Layout>
            </PrivateRoute>
          } />
           <Route path="/attendance" element={
            <PrivateRoute roles={['employee']}>
              <Layout>
                <AttendancePanel/>
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/corrections" element={
            <PrivateRoute roles={['employee']}>
              <Layout>
                <CorrectionRequests />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* HR Routes */}
          <Route path="/hr" element={
            <PrivateRoute roles={['hr']}>
              <Layout>
                <HRDashboard />
                 
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/hr/requests" element={
            <PrivateRoute roles={['hr']}>
              <Layout>
                <PendingRequests />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/hr/attendance" element={
            <PrivateRoute roles={['hr']}>
              <Layout>
                <AllAttendance />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
              <Layout>
                <UserManagement />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/rules" element={
            <PrivateRoute roles={['admin']}>
              <Layout>
                <AttendanceRules />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/audit" element={
            <PrivateRoute roles={['admin']}>
              <Layout>
                <AuditLogs />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;