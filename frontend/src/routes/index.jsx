/**
 * Route Configuration with Lazy Loading
 * Modern code splitting for better performance
 */

import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load public pages
export const Home = lazy(() => import('../pages/Home'));
export const About = lazy(() => import('../pages/About'));
export const Programs = lazy(() => import('../pages/Programs'));
export const Events = lazy(() => import('../pages/Events'));
export const News = lazy(() => import('../pages/News'));
export const Gallery = lazy(() => import('../pages/Gallery'));
export const Resources = lazy(() => import('../pages/Resources'));
export const Contact = lazy(() => import('../pages/Contact'));
export const Login = lazy(() => import('../pages/Login'));
export const VotePage = lazy(() => import('../pages/VotePage'));
export const LiveResults = lazy(() => import('../pages/LiveResults'));

// Lazy load portal pages
export const Dashboard = lazy(() => import('../portal/Dashboard'));
export const Profile = lazy(() => import('../portal/Profile'));
export const VolunteerForm = lazy(() => import('../portal/VolunteerForm'));

// Lazy load admin pages
export const AdminDashboard = lazy(() => import('../admin/AdminDashboard'));
export const ManageMembers = lazy(() => import('../admin/ManageMembers'));
export const ManageEvents = lazy(() => import('../admin/ManageEvents'));
export const ManagePosts = lazy(() => import('../admin/ManagePosts'));
export const ManageGallery = lazy(() => import('../admin/ManageGallery'));
export const ManageAdminLogins = lazy(() => import('../admin/ManageAdminLogins'));

// Lazy load admin portals
export const SuperAdminPortal = lazy(() => import('../admin/SuperAdminPortal'));
export const EventsAdminPortal = lazy(() => import('../admin/EventsAdminPortal'));
export const GalleryAdminPortal = lazy(() => import('../admin/GalleryAdminPortal'));
export const MembershipAdminPortal = lazy(() => import('../admin/MembershipAdminPortal'));
export const ContentAdminPortal = lazy(() => import('../admin/ContentAdminPortal'));
export const ProgramsAdminPortal = lazy(() => import('../admin/ProgramsAdminPortal'));
export const AboutAdminPortal = lazy(() => import('../admin/AboutAdminPortal'));
export const ResourcesAdminPortal = lazy(() => import('../admin/ResourcesAdminPortal'));
export const ContactAdminPortal = lazy(() => import('../admin/ContactAdminPortal'));
export const DesignAdminPortal = lazy(() => import('../admin/DesignAdminPortal'));
export const LogsAdminPortal = lazy(() => import('../admin/LogsAdminPortal'));
export const PartnersAdminPortal = lazy(() => import('../admin/PartnersAdminPortal'));
export const TestimonialsAdminPortal = lazy(() => import('../admin/TestimonialsAdminPortal'));
export const AnnouncementsAdminPortal = lazy(() => import('../admin/AnnouncementsAdminPortal'));
export const ElectionManagement = lazy(() => import('../admin/ElectionManagement'));

/**
 * Suspense wrapper for lazy-loaded components
 */
export const withSuspense = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
    <Component {...props} />
  </Suspense>
);

