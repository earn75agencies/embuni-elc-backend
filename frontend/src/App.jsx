/**
 * Main App Component
 * Optimized with lazy loading for better performance and code splitting
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from './components/ToastProvider';

// i18n Configuration
import './i18n/config';

// RTL Support Styles
import './styles/rtl.css';

// Animation Styles
import './styles/animations.css';

// Accessibility Styles
import './styles/accessibility.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { ContactProvider } from './context/ContactContext';

// Layout Components (eagerly loaded - needed immediately)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages for code splitting and better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Programs = lazy(() => import('./pages/Programs'));
const Events = lazy(() => import('./pages/Events'));
const News = lazy(() => import('./pages/News'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Resources = lazy(() => import('./pages/Resources'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const VotePage = lazy(() => import('./pages/VotePage'));
const LiveResults = lazy(() => import('./pages/LiveResults'));
const Mentorship = lazy(() => import('./pages/Mentorship'));
const Internships = lazy(() => import('./pages/Internships'));
const Alumni = lazy(() => import('./pages/Alumni'));
const Learning = lazy(() => import('./pages/Learning'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Portal Pages (Private) - Lazy loaded
const Dashboard = lazy(() => import('./portal/Dashboard'));
const Profile = lazy(() => import('./portal/Profile'));
const VolunteerForm = lazy(() => import('./portal/VolunteerForm'));

// Admin Pages - Lazy loaded
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const ManageMembers = lazy(() => import('./admin/ManageMembers'));
const ManageEvents = lazy(() => import('./admin/ManageEvents'));
const ManagePosts = lazy(() => import('./admin/ManagePosts'));
const ManageGallery = lazy(() => import('./admin/ManageGallery'));
const ManageAdminLogins = lazy(() => import('./admin/ManageAdminLogins'));

// Role-Specific Admin Portals - Lazy loaded
const SuperAdminPortal = lazy(() => import('./admin/SuperAdminPortal'));
const EventsAdminPortal = lazy(() => import('./admin/EventsAdminPortal'));
const GalleryAdminPortal = lazy(() => import('./admin/GalleryAdminPortal'));
const MembershipAdminPortal = lazy(() => import('./admin/MembershipAdminPortal'));
const ContentAdminPortal = lazy(() => import('./admin/ContentAdminPortal'));
const ProgramsAdminPortal = lazy(() => import('./admin/ProgramsAdminPortal'));
const AboutAdminPortal = lazy(() => import('./admin/AboutAdminPortal'));
const ResourcesAdminPortal = lazy(() => import('./admin/ResourcesAdminPortal'));
const ContactAdminPortal = lazy(() => import('./admin/ContactAdminPortal'));
const DesignAdminPortal = lazy(() => import('./admin/DesignAdminPortal'));
const LogsAdminPortal = lazy(() => import('./admin/LogsAdminPortal'));
const PartnersAdminPortal = lazy(() => import('./admin/PartnersAdminPortal'));
const TestimonialsAdminPortal = lazy(() => import('./admin/TestimonialsAdminPortal'));
const AnnouncementsAdminPortal = lazy(() => import('./admin/AnnouncementsAdminPortal'));
const ElectionManagement = lazy(() => import('./admin/ElectionManagement'));

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ProductionErrorBoundary from './components/ProductionErrorBoundary';
import SEOHead from './components/SEOHead';
import { PERMISSIONS } from './constants/adminRoles';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set HTML lang and dir attributes based on current language
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

return (
    <ProductionErrorBoundary>
      <Router>
        <AuthProvider>
          <ContactProvider>
            <ToastProvider>
          <SEOHead />
          <div className={`min-h-screen flex flex-col bg-white ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
            <Navbar />
            <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/events" element={<Events />} />
                <Route path="/news" element={<News />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                
                {/* Voting Routes */}
                <Route path="/vote/:token" element={<VotePage />} />
                <Route path="/elections/:electionId/results" element={<LiveResults />} />
                
                {/* Mentorship Routes */}
                <Route path="/mentorship" element={
                  <ProtectedRoute>
                    <Mentorship />
                  </ProtectedRoute>
                } />
                
                 {/* Internship Routes */}
                 <Route path="/internships" element={
                   <ProtectedRoute>
                     <Internships />
                   </ProtectedRoute>
                 } />
                 
                 {/* Alumni Routes */}
                 <Route path="/alumni" element={
                   <ProtectedRoute>
                     <Alumni />
                   </ProtectedRoute>
                 } />
                 
                 {/* Learning Routes */}
                 <Route path="/learning" element={
                   <ProtectedRoute>
                     <Learning />
                   </ProtectedRoute>
                 } />
                
                {/* Protected Portal Routes */}
                <Route path="/portal/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/portal/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/portal/volunteer" element={
                  <ProtectedRoute>
                    <VolunteerForm />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes - Role-Specific Portals */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
              
              {/* Super Admin Portal - Only for admin account management */}
              <Route path="/superadmin" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_ADMINS}>
                  <SuperAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/manage-admins" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_ADMINS}>
                  <SuperAdminPortal />
                </AdminRoute>
              } />
              
              {/* Events Admin Portal */}
              <Route path="/admin/events" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_EVENTS}>
                  <EventsAdminPortal />
                </AdminRoute>
              } />
              
              {/* Election Management */}
              <Route path="/admin/elections" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_EVENTS}>
                  <ElectionManagement />
                </AdminRoute>
              } />
              <Route path="/admin/elections/:id/manage" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_EVENTS}>
                  <ElectionManagement />
                </AdminRoute>
              } />
              
              {/* Gallery Admin Portal */}
              <Route path="/admin/gallery" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_GALLERY}>
                  <GalleryAdminPortal />
                </AdminRoute>
              } />
              
              {/* Team Admin Portal (Membership Admin) */}
              <Route path="/admin/team" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_MEMBERS}>
                  <MembershipAdminPortal />
                </AdminRoute>
              } />
              
              {/* Blog Admin Portal (Content Admin) */}
              <Route path="/admin/blog" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_POSTS}>
                  <ContentAdminPortal />
                </AdminRoute>
              } />
              
              {/* User Support Admin Portal (Contact Admin) */}
              <Route path="/admin/support" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_CONTACT}>
                  <ContactAdminPortal />
                </AdminRoute>
              } />
              
              {/* Programs Admin Portal */}
              <Route path="/admin/programs" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_PROGRAMS}>
                  <ProgramsAdminPortal />
                </AdminRoute>
              } />
              
              {/* About Admin Portal */}
              <Route path="/admin/manage-about" element={
                <AdminRoute requiredPermission={PERMISSIONS.EDIT_ABOUT_PAGE}>
                  <AboutAdminPortal />
                </AdminRoute>
              } />
              
              {/* Resources Admin Portal */}
              <Route path="/admin/manage-resources" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_RESOURCES}>
                  <ResourcesAdminPortal />
                </AdminRoute>
              } />
              
              {/* Contact Admin Portal */}
              <Route path="/admin/manage-contact" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_CONTACT}>
                  <ContactAdminPortal />
                </AdminRoute>
              } />
              
              {/* Design Admin Portal */}
              <Route path="/admin/manage-design" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_DESIGN}>
                  <DesignAdminPortal />
                </AdminRoute>
              } />
              
              {/* Logs Admin Portal */}
              <Route path="/admin/manage-logs" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_SYSTEM_LOGS}>
                  <LogsAdminPortal />
                </AdminRoute>
              } />
              
              {/* Partners Admin Portal */}
              <Route path="/admin/partners" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_PARTNERS}>
                  <PartnersAdminPortal />
                </AdminRoute>
              } />
              
              {/* Testimonials Admin Portal */}
              <Route path="/admin/testimonials" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_TESTIMONIALS}>
                  <TestimonialsAdminPortal />
                </AdminRoute>
              } />
              
              {/* Announcements Admin Portal */}
              <Route path="/admin/announcements" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_ANNOUNCEMENTS}>
                  <AnnouncementsAdminPortal />
                </AdminRoute>
              } />
              
              {/* Security Admin Portal */}
              <Route path="/admin/security" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_SECURITY}>
                  <div className="container-custom py-8">
                    <h1 className="text-3xl font-bold mb-4">Security Management</h1>
                    <p className="text-neutral-600">Security portal coming soon...</p>
                    <p className="text-sm text-neutral-500 mt-2">
                      Monitor login logs, failed attempts, and suspicious activities.
                      Enforce password and 2FA policies. Revoke access for compromised accounts.
                    </p>
                  </div>
                </AdminRoute>
              } />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="/admin/manage-events" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_EVENTS}>
                  <EventsAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/manage-gallery" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_GALLERY}>
                  <GalleryAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/manage-members" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_MEMBERS}>
                  <MembershipAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/manage-posts" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_POSTS}>
                  <ContentAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/members" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_MEMBERS}>
                  <MembershipAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/posts" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_POSTS}>
                  <ContentAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/manage-contact" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_CONTACT}>
                  <ContactAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/manage-programs" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_PROGRAMS}>
                  <ProgramsAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/logins" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_ADMINS}>
                  <SuperAdminPortal />
                </AdminRoute>
              } />
              <Route path="/admin/reports" element={
                <AdminRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}>
                  <div className="container-custom py-8">
                    <h1 className="text-3xl font-bold mb-4">Reports & Analytics</h1>
                    <p className="text-neutral-600">Reports page coming soon...</p>
                  </div>
                </AdminRoute>
              } />
              <Route path="/admin/documents" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_DOCUMENTS}>
                  <div className="container-custom py-8">
                    <h1 className="text-3xl font-bold mb-4">Documents Manager</h1>
                    <p className="text-neutral-600">Documents management coming soon...</p>
                  </div>
                </AdminRoute>
              } />
              <Route path="/admin/logs" element={
                <AdminRoute requiredPermission={PERMISSIONS.MANAGE_SYSTEM_LOGS}>
                  <LogsAdminPortal />
                </AdminRoute>
              } />
              
              {/* 404 Catch-all Route */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </main>
          </div>
            </ToastProvider>
        </ContactProvider>
      </AuthProvider>
        </Router>
    </ProductionErrorBoundary>
  );
}

export default App;
