import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import Navbar from '../components/layout/navbar';

// Page Imports
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/public/ExplorePage';
import ComparePage from '../pages/compare/ComparePage';
import LoginPage from '../pages/auth/LoginPage';
import DetailPage from '../pages/public/DetailPage';
import RegisterPage from '../pages/auth/RegisterPage';
import Bookmarks from '../pages/bookmark/BookmarkPage';
import MyRoadmapPage from '../pages/roadmap/MyRoadmap';
import LearningPage from '../pages/roadmap/LearningPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Admin Page Imports
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RoadmapManagement from '../pages/admin/RoadmapManagement';
import CreateRoadmap from '../pages/admin/CreateRoadmap';
import EditRoadmap from '../pages/admin/EditPage';
// --- AUTHORIZATION GUARDS ---

const UserRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role')?.toUpperCase();
  
  if (!token) return <Navigate to="/login" replace />;
  
  // Guard: If an Admin tries to access User pages (Profile, My Roadmap), redirect them to Admin Dashboard
  if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role')?.toUpperCase();

  if (!token) return <Navigate to="/login" replace />;
  
  // Guard: If NOT an admin, prevent access and send to Explore
  if (role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
    return <Navigate to="/explore" replace />;
  }

  return children;
};

// --- ROUTERS & LAYOUTS ---

/**
 * RootHandler: Controls what the user sees at localhost:5173/
 * Redirects Admins to Dashboard, Authenticated Users to Home, and Guests to Landing.
 */
const RootHandler = () => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role')?.toUpperCase();

  if (!token) return <LandingPage />;
  
  // If role matches Admin variants, push to the Admin Panel immediately
  if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <HomePage />;
};

// Wraps standard pages so the global Navbar appears only on User-facing routes
const StandardLayout = () => {
  return (
    <>
      <Navbar />
      <div className="content-area">
        <Outlet />
      </div>
    </>
  );
};

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* =========================================
              STANDARD PAGES (Includes Global Navbar)
              ========================================= */}
          <Route element={<StandardLayout />}>
            
            {/* --- PUBLIC & ROOT --- */}
            <Route path="/" element={<RootHandler />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/roadmap/:id" element={<DetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- USER ONLY PROTECTED --- */}
            <Route path="/bookmark" element={<Bookmarks />} />
            <Route path="/my-roadmap/:id?" element={<UserRoute><MyRoadmapPage /></UserRoute>} />
            <Route path="/learning/:roadmapId/:subtopicId" element={<UserRoute><LearningPage /></UserRoute>} />
            <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />
            
          </Route>

          {/* =========================================
              ADMIN PANEL (Uses AdminLayout with Sidebar)
              ========================================= */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Placeholder routes for the Sidebar links */}
            <Route path="users" element={<UserManagement />} />
            <Route path="roadmaps" element={<RoadmapManagement />} />
            <Route path="/admin/roadmaps/create" element={<CreateRoadmap />} />
            <Route path="/admin/roadmaps/edit/:id" element={<EditRoadmap />} />
            <Route path="settings" element={<div className="p-4"><h3>System Settings</h3></div>} />
          </Route>

          {/* --- CATCH ALL --- */}
          <Route path="*" element={
            <div className="container text-center py-5 mt-5">
              <h1 className="display-1 fw-bold text-muted opacity-25">404</h1>
              <h2 className="fw-bold">Page Not Found</h2>
              <p className="text-secondary">The page you are looking for does not exist.</p>
              <button className="btn btn-primary rounded-pill px-4 mt-3" onClick={() => window.location.href = '/'}>
                Back to Safety
              </button>
            </div>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRouter;