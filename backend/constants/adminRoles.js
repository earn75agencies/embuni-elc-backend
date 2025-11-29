/**
 * Admin Roles & Permissions Configuration
 * Defines role-based access control for the ELP admin system
 */

const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  // Page-specific admins only
  DESIGN_ADMIN: 'design_admin', // Home page (hero content, banners, UI)
  ABOUT_ADMIN: 'about_admin', // About page
  PROGRAMS_ADMIN: 'programs_admin', // Programs page
  EVENTS_ADMIN: 'events_admin', // Events page
  CONTENT_ADMIN: 'content_admin', // News page (posts/articles)
  GALLERY_ADMIN: 'gallery_admin', // Gallery page
  RESOURCES_ADMIN: 'resources_admin', // Resources page
  CONTACT_ADMIN: 'contact_admin' // Contact page
};

const ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: 'Super Admin',
  [ADMIN_ROLES.DESIGN_ADMIN]: 'Home Admin',
  [ADMIN_ROLES.ABOUT_ADMIN]: 'About Admin',
  [ADMIN_ROLES.PROGRAMS_ADMIN]: 'Programs Admin',
  [ADMIN_ROLES.EVENTS_ADMIN]: 'Events Admin',
  [ADMIN_ROLES.CONTENT_ADMIN]: 'News Admin',
  [ADMIN_ROLES.GALLERY_ADMIN]: 'Gallery Admin',
  [ADMIN_ROLES.RESOURCES_ADMIN]: 'Resources Admin',
  [ADMIN_ROLES.CONTACT_ADMIN]: 'Contact Admin'
};

const ROLE_DESCRIPTIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: 'Top-level system owner. Creates and manages admin accounts. Monitors system health and activities.',
  [ADMIN_ROLES.DESIGN_ADMIN]: 'Manages Home page content including hero sections, banners, featured content, and overall page design.',
  [ADMIN_ROLES.ABOUT_ADMIN]: 'Edits About page content including Mission, Vision, Core Values, and Leadership Team profiles.',
  [ADMIN_ROLES.PROGRAMS_ADMIN]: 'Manages Programs page content including ELP initiatives, program details, and descriptions.',
  [ADMIN_ROLES.EVENTS_ADMIN]: 'Manages Events page including creating, updating, and deleting events.',
  [ADMIN_ROLES.CONTENT_ADMIN]: 'Manages News page content including posts, articles, and news updates.',
  [ADMIN_ROLES.GALLERY_ADMIN]: 'Manages Gallery page including photo and video uploads and organization.',
  [ADMIN_ROLES.RESOURCES_ADMIN]: 'Manages Resources page including PDFs, handbooks, guides, and reference documents.',
  [ADMIN_ROLES.CONTACT_ADMIN]: 'Manages Contact page including contact information, queries, messages, and support requests.'
};

const ROLE_COLORS = {
  [ADMIN_ROLES.SUPER_ADMIN]: 'bg-red-600 text-white',
  [ADMIN_ROLES.DESIGN_ADMIN]: 'bg-violet-600 text-white',
  [ADMIN_ROLES.ABOUT_ADMIN]: 'bg-indigo-600 text-white',
  [ADMIN_ROLES.PROGRAMS_ADMIN]: 'bg-blue-600 text-white',
  [ADMIN_ROLES.EVENTS_ADMIN]: 'bg-orange-600 text-white',
  [ADMIN_ROLES.CONTENT_ADMIN]: 'bg-purple-600 text-white',
  [ADMIN_ROLES.GALLERY_ADMIN]: 'bg-pink-600 text-white',
  [ADMIN_ROLES.RESOURCES_ADMIN]: 'bg-emerald-600 text-white',
  [ADMIN_ROLES.CONTACT_ADMIN]: 'bg-cyan-600 text-white'
};

const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  MEMBERS: '/admin/members',
  EVENTS: '/admin/events',
  POSTS: '/admin/posts',
  GALLERY: '/admin/gallery',
  ADMIN_MANAGEMENT: '/admin/logins',
  SECURITY: '/admin/security',
  REPORTS: '/admin/reports',
  DOCUMENTS: '/admin/documents'
};

const PERMISSIONS = {
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_SECURITY: 'manage_security',
  VIEW_LOGS: 'view_logs',
  MANAGE_SYSTEM_LOGS: 'manage_system_logs',
  APPROVE_EVENTS: 'approve_events',
  APPROVE_POSTS: 'approve_posts',
  APPROVE_MEMBERS: 'approve_members',
  VIEW_REPORTS: 'view_reports',
  MANAGE_COMMUNICATIONS: 'manage_communications',
  MANAGE_MEDIA: 'manage_media',
  MANAGE_POSTS: 'manage_posts',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_EVENT_DRAFTS: 'manage_event_drafts',
  MANAGE_VOLUNTEERS: 'manage_volunteers',
  MANAGE_ATTENDANCE: 'manage_attendance',
  MANAGE_MEMBERS: 'manage_members',
  MANAGE_APPLICATIONS: 'manage_applications',
  UPDATE_MEMBER_PROFILES: 'update_member_profiles',
  MANAGE_DOCUMENTS: 'manage_documents',
  EDIT_ABOUT_PAGE: 'edit_about_page',
  MANAGE_RESOURCES: 'manage_resources',
  PUBLISH_APPROVED_CONTENT: 'publish_approved_content',
  MANAGE_GALLERY: 'manage_gallery',
  MANAGE_HERO_CONTENT: 'manage_hero_content',
  MANAGE_PROGRAMS: 'manage_programs',
  MANAGE_CONTACT: 'manage_contact',
  MANAGE_DESIGN: 'manage_design',
  MANAGE_PARTNERS: 'manage_partners',
  MANAGE_TESTIMONIALS: 'manage_testimonials',
  MANAGE_ANNOUNCEMENTS: 'manage_announcements'
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: ALL_PERMISSIONS, // Full access to everything
  [ADMIN_ROLES.DESIGN_ADMIN]: [ // Home page admin
    PERMISSIONS.MANAGE_DESIGN,
    PERMISSIONS.MANAGE_HERO_CONTENT,
    PERMISSIONS.MANAGE_PARTNERS // For partners section on home
  ],
  [ADMIN_ROLES.ABOUT_ADMIN]: [ // About page admin
    PERMISSIONS.EDIT_ABOUT_PAGE
  ],
  [ADMIN_ROLES.PROGRAMS_ADMIN]: [ // Programs page admin
    PERMISSIONS.MANAGE_PROGRAMS
  ],
  [ADMIN_ROLES.EVENTS_ADMIN]: [ // Events page admin
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.APPROVE_EVENTS
  ],
  [ADMIN_ROLES.CONTENT_ADMIN]: [ // News page admin
    PERMISSIONS.MANAGE_POSTS,
    PERMISSIONS.APPROVE_POSTS,
    PERMISSIONS.MANAGE_COMMUNICATIONS,
    PERMISSIONS.PUBLISH_APPROVED_CONTENT
  ],
  [ADMIN_ROLES.GALLERY_ADMIN]: [ // Gallery page admin
    PERMISSIONS.MANAGE_GALLERY,
    PERMISSIONS.MANAGE_MEDIA
  ],
  [ADMIN_ROLES.RESOURCES_ADMIN]: [ // Resources page admin
    PERMISSIONS.MANAGE_RESOURCES,
    PERMISSIONS.MANAGE_DOCUMENTS
  ],
  [ADMIN_ROLES.CONTACT_ADMIN]: [ // Contact page admin
    PERMISSIONS.MANAGE_CONTACT,
    PERMISSIONS.MANAGE_COMMUNICATIONS
  ]
};

const checkPermission = (userRole, requiredPermission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission);
};

const hasMultiplePermissions = (userRole, requiredPermissions) => {
  return requiredPermissions.every(permission => checkPermission(userRole, permission));
};

const hasAnyPermission = (userRole, requiredPermissions) => {
  return requiredPermissions.some(permission => checkPermission(userRole, permission));
};

module.exports = {
  ADMIN_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  ADMIN_ROUTES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  checkPermission,
  hasMultiplePermissions,
  hasAnyPermission
};
