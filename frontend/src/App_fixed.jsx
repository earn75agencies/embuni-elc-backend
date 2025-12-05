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

// Admin Portal Pages (Private) - Lazy loaded
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const ManageAdmins = lazy(() => import('./admin/ManageAdmins'));
const EventsAdminPortal = lazy(() => import('./admin/EventsAdminPortal'));
const ElectionManagement = lazy(() => import('./admin/ElectionManagement'));
const GalleryAdminPortal = lazy(() => import('./admin/GalleryAdminPortal'));
const TeamAdminPortal = lazy(() => import('./admin/TeamAdminPortal'));
const BlogAdminPortal = lazy(() => import('./admin/BlogAdminPortal'));
const SupportAdminPortal = lazy(() => import('./admin/SupportAdminPortal'));
const ProgramsAdminPortal = lazy(() => import('./admin/ProgramsAdminPortal'));
const AboutAdminPortal = lazy(() => import('./admin/AboutAdminPortal'));
const ResourcesAdminPortal = lazy(() => import('./admin/ResourcesAdminPortal'));
const ContactAdminPortal = lazy(() => import('./admin/ContactAdminPortal'));
const DesignAdminPortal = lazy(() => import('./admin/DesignAdminPortal'));
const LogsAdminPortal = lazy(() => import('./admin/LogsAdminPortal'));
const PartnersAdminPortal = lazy(() => import('./admin/PartnersAdminPortal'));
const TestimonialsAdminPortal = lazy(() => import('./admin/TestimonialsAdminPortal'));
const AnnouncementsAdminPortal = lazy(() => import('./admin/AnnouncementsAdminPortal'));
const SecurityAdminPortal = lazy(() => import('./admin/SecurityAdminPortal'));

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
      <AuthProvider>
        <ContactProvider>
          <ToastProvider>
            <Router>
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
                  
                 {/* Portal Routes (Private) */}
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
                     <Dashboard />
                   </ProtectedRoute>
                 } />
                  
                 {/* Admin Routes (Super Admin) */}
                 <Route path="/admin/dashboard" element={
                   <AdminRoute>
                     <AdminDashboard />
                   </AdminRoute>
                 } />
                  
                 <Route path="/superadmin" element={
                   <AdminRoute>
                     <AdminDashboard />
                   </AdminRoute>
                 } />
                  
               <Route path="/admin/manage-admins" element={
                   <AdminRoute>
                     <ManageAdmins />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/events" element={
                   <AdminRoute>
                     <EventsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/elections" element={
                   <AdminRoute>
                     <ElectionManagement />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/elections/:id/manage" element={
                   <AdminRoute>
                     <ElectionManagement />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/gallery" element={
                   <AdminRoute>
                     <GalleryAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/team" element={
                   <AdminRoute>
                     <TeamAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/blog" element={
                   <AdminRoute>
                     <BlogAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/support" element={
                   <AdminRoute>
                     <SupportAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/programs" element={
                   <AdminRoute>
                     <ProgramsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-about" element={
                   <AdminRoute>
                     <AboutAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-resources" element={
                   <AdminRoute>
                     <ResourcesAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-contact" element={
                   <AdminRoute>
                     <ContactAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-design" element={
                   <AdminRoute>
                     <DesignAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-logs" element={
                   <AdminRoute>
                     <LogsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/partners" element={
                   <AdminRoute>
                     <PartnersAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/testimonials" element={
                   <AdminRoute>
                     <TestimonialsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/announcements" element={
                   <AdminRoute>
                     <AnnouncementsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/security" element={
                   <AdminRoute>
                     <SecurityAdminPortal />
                   </AdminRoute>
                 } />
                  
                 {/* Event Management Routes */}
                 <Route path="/admin/manage-events" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_EVENTS}>
                     <EventsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-gallery" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_GALLERY}>
                     <GalleryAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-members" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_MEMBERS}>
                     <TeamAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-posts" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_POSTS}>
                     <BlogAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/members" element={
                   <AdminRoute permission={PERMISSIONS.VIEW_MEMBERS}>
                     <TeamAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/posts" element={
                   <AdminRoute permission={PERMISSIONS.VIEW_POSTS}>
                     <BlogAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-contact" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_CONTACT}>
                     <ContactAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/manage-programs" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_PROGRAMS}>
                     <ProgramsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/logins" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_ADMIN_ACCESS}>
                     <ManageAdmins />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/reports" element={
                   <AdminRoute permission={PERMISSIONS.VIEW_REPORTS}>
                     <SupportAdminPortal />
                   </AdminRoute>
                 } />
                  
                 {/* Document Management Routes */}
                 <Route path="/admin/documents" element={
                   <AdminRoute permission={PERMISSIONS.MANAGE_DOCUMENTS}>
                     <ResourcesAdminPortal />
                   </AdminRoute>
                 } />
                  
                 <Route path="/admin/logs" element={
                   <AdminRoute permission={PERMISSIONS.VIEW_LOGS}>
                     <LogsAdminPortal />
                   </AdminRoute>
                 } />
                  
                 {/* 404 Page */}
                 <Route path="*" element={<NotFound />} />
               </Routes>
             </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
          </ToastProvider>
        </ContactProvider>
      </AuthProvider>
    </ProductionErrorBoundary>
  );
}

export default App;