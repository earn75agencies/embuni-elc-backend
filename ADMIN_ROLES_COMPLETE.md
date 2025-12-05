# Complete Admin Roles Configuration

## All Admin Roles

The system now supports all 11 admin roles as specified:

### 1. Super Admin
- **Role ID**: `super_admin`
- **Portal Path**: `/superadmin`
- **Main Responsibility**: Has full control over the system, can create and manage other admins, set permissions, and oversee the entire portal.
- **Editable Section**: Everything on the portal.

### 2. Events Admin
- **Role ID**: `events_admin`
- **Portal Path**: `/admin/events` or `/admin/manage-events`
- **Main Responsibility**: Manages all university events, including creating, updating, and deleting events.
- **Editable Section**: Events page.

### 3. Gallery Admin
- **Role ID**: `gallery_admin`
- **Portal Path**: `/admin/gallery` or `/admin/manage-gallery`
- **Main Responsibility**: Handles all media uploads and management, such as photos and videos.
- **Editable Section**: Gallery page.

### 4. Blog Admin (Content Admin)
- **Role ID**: `content_admin`
- **Portal Path**: `/admin/posts` or `/admin/manage-posts`
- **Main Responsibility**: Writes and publishes posts, news articles, and updates relevant to the university community.
- **Editable Section**: Blog / News page.

### 5. Team Admin (Membership Admin)
- **Role ID**: `membership_admin`
- **Portal Path**: `/admin/members` or `/admin/manage-members`
- **Main Responsibility**: Manages leadership or committee members, including updating their profiles and roles.
- **Editable Section**: Team page.

### 6. Team Admin - Leadership (About Admin)
- **Role ID**: `about_admin`
- **Portal Path**: `/admin/manage-about`
- **Main Responsibility**: Edits Mission, Vision, Core Values, and Leadership Team profiles on the About page.
- **Editable Section**: About page (Leadership Team section).

### 7. Partners Admin
- **Role ID**: `partners_admin`
- **Portal Path**: `/admin/partners`
- **Main Responsibility**: Oversees partner organizations, sponsors, and collaborations.
- **Editable Section**: Home page (partners section).

### 8. Programs Admin
- **Role ID**: `programs_admin`
- **Portal Path**: `/admin/programs` or `/admin/manage-programs`
- **Main Responsibility**: Manages the university's ELP (Equity Leadership Program) initiatives and details.
- **Editable Section**: Programs section.

### 9. Testimonials Admin
- **Role ID**: `testimonials_admin`
- **Portal Path**: `/admin/testimonials`
- **Main Responsibility**: Collects, verifies, and publishes testimonials from students, alumni, or partners.
- **Editable Section**: Testimonials section.

### 10. Announcements Admin
- **Role ID**: `announcements_admin`
- **Portal Path**: `/admin/announcements`
- **Main Responsibility**: Updates and manages important announcements and notifications for the university community.
- **Editable Section**: Announcement bar.

### 11. User Support Admin (Contact Admin)
- **Role ID**: `contact_admin`
- **Portal Path**: `/admin/contact` or `/admin/manage-contact`
- **Main Responsibility**: Handles queries, messages, and support requests from users.
- **Editable Section**: Contact page.

### 12. Security Admin
- **Role ID**: `security_admin`
- **Portal Path**: `/admin/security` or `/admin/manage-security`
- **Main Responsibility**: Monitors system security, tracks threats, manages access permissions, and ensures portal safety.
- **Editable Section**: Backend security tools.

## Additional Roles (System Management)

### Resources Admin
- **Role ID**: `resources_admin`
- **Portal Path**: `/admin/manage-resources`
- **Main Responsibility**: Uploads and manages PDFs, handbooks, guides, and reference documents.

### Design Admin
- **Role ID**: `design_admin`
- **Portal Path**: `/admin/manage-design`
- **Main Responsibility**: Manages UI content, banner texts, footer information, colors, and overall design consistency.

### Logs Admin
- **Role ID**: `logs_admin`
- **Portal Path**: `/admin/manage-logs`
- **Main Responsibility**: Monitors backend logs, server health, error reports, and generates system reports.

## Creating Admins

All roles can be created using the Super Admin portal at `/superadmin`:

```json
POST /api/auth/admin/create-login
{
  "email": "admin@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!",
  "adminRole": "partners_admin"  // Use any role from the list above
}
```

## Role Permissions

Each role has specific permissions defined in:
- `backend/constants/adminRoles.js`
- `frontend/src/constants/adminRoles.js`

Permissions are automatically enforced by the `AdminRoute` component and backend middleware.

## Portal Access

Each admin role has a dedicated portal accessible through:
1. Admin Dashboard (`/admin/dashboard`) - Shows role-specific modules
2. Direct portal routes (e.g., `/admin/partners`, `/admin/testimonials`)

All portals are protected by role-based access control (RBAC).

