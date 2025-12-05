# Admin System Complete Specification

## Overview

Every section visible to the public (viewer side) is fully editable through its corresponding admin panel. Each admin has defined privileges and controls one or more public-facing sections of the website. The system ensures dynamic content management, easy updates, and role-based control without modifying the codebase.

## Admin Roles & Portals

### 👑 1. Super Admin

**Portal Path**: `/superadmin`

**Main Responsibility**: Full system control and admin management

**Editable Section**: Entire website (all sections)

**Capabilities**:
- Create, manage, and remove any admin or user account
- Edit or override any section (Events, Gallery, Blog, etc.)
- Manage backend settings like database links, API keys, and cloud integrations
- Approve content updates from other admins before publication
- Monitor overall site activity, performance, and data backups

**Viewer Side Affected**: Everything the public sees or admins manage ultimately falls under the Super Admin's control.

---

### 🎉 2. Events Admin

**Portal Path**: `/admin/events`

**Main Responsibility**: Manage all ELC-related events

**Editable Section**: Events page

**Capabilities**:
- Create new event listings (workshops, meetings, seminars)
- Upload banners, images, and promotional materials
- Edit event descriptions, dates, times, and venues
- Archive completed events or reorder upcoming ones
- Collaborate with the Gallery Admin to attach post-event photos

**Viewer Side Affected**: `/events` — all event details shown here are fetched from this admin's database updates.

---

### 🖼️ 3. Gallery Admin

**Portal Path**: `/admin/gallery`

**Main Responsibility**: Manage all images and videos

**Editable Section**: Gallery page

**Capabilities**:
- Upload and organize media into event or program categories
- Add captions and tags for each image or video
- Delete outdated or duplicate media
- Optimize files for fast loading without loss of quality
- Control which media appear publicly

**Viewer Side Affected**: `/gallery` — the image and video grid content automatically reflects Gallery Admin updates.

---

### 📰 4. Blog Admin

**Portal Path**: `/admin/blog`

**Main Responsibility**: Manage articles, news, and stories

**Editable Section**: Blog / News page

**Capabilities**:
- Create, edit, or delete posts
- Add images, links, or embedded media
- Format text and categorize content
- Highlight featured stories on the homepage
- Approve or reject community-submitted articles

**Viewer Side Affected**: `/blog` or `/news` — all news stories and announcements come from this admin's content.

---

### 👥 5. Team Admin

**Portal Path**: `/admin/team`

**Main Responsibility**: Manage leadership and staff details

**Editable Section**: Team page

**Capabilities**:
- Add new team members with photos, roles, and bios
- Update positions when leadership changes
- Remove or archive outgoing leaders
- Edit term details and committee responsibilities

**Viewer Side Affected**: `/team` — leadership cards, names, and bios are updated dynamically from this admin's dashboard.

---

### 🤝 6. Partners Admin

**Portal Path**: `/admin/partners`

**Main Responsibility**: Manage partner organizations and sponsors

**Editable Section**: Partners section on the home page

**Capabilities**:
- Add, remove, or edit partner entries
- Upload logos and write short partnership descriptions
- Update links to partner websites
- Highlight featured partners on the homepage

**Viewer Side Affected**: Home page partners carousel/section automatically displays Partner Admin updates.

---

### 🎓 7. Programs Admin

**Portal Path**: `/admin/programs`

**Main Responsibility**: Manage ELP programs and mentorship activities

**Editable Section**: Programs section

**Capabilities**:
- Add new programs (e.g., "Leadership Bootcamp")
- Edit program objectives, requirements, and schedules
- Add photos and progress updates
- Archive past programs or mark them as completed

**Viewer Side Affected**: `/programs` — all programs shown on the site are updated from this admin's edits.

---

### 💬 8. Testimonials Admin

**Portal Path**: `/admin/testimonials`

**Main Responsibility**: Manage testimonials and reviews

**Editable Section**: Testimonials section

**Capabilities**:
- Add testimonials with name, picture, and statement
- Approve or reject submitted feedback
- Highlight the best testimonials for the home page
- Delete outdated or fake reviews

**Viewer Side Affected**: `/testimonials` — all feedback shown on the homepage or dedicated section is pulled directly from this admin's entries.

---

### 📢 9. Announcements Admin

**Portal Path**: `/admin/announcements`

**Main Responsibility**: Manage news flashes, reminders, and urgent updates

**Editable Section**: Announcement bar / notification panel

**Capabilities**:
- Post short urgent messages (e.g., "Meeting postponed", "Registration open")
- Set expiration dates for announcements
- Manage which messages appear on homepage, dashboard, or both
- Remove old notifications automatically

**Viewer Side Affected**: Top banner or announcement area on all pages dynamically updates from this admin's data.

---

### 📞 10. User Support Admin

**Portal Path**: `/admin/support`

**Main Responsibility**: Handle contact form submissions and user queries

**Editable Section**: Contact page

**Capabilities**:
- View messages submitted from the contact form
- Respond to messages directly through the dashboard or by email
- Escalate technical or sensitive issues to the Super Admin
- Update contact information shown on the public page (emails, phone numbers, social links)

**Viewer Side Affected**: `/contact` — public contact details and message responses reflect this admin's configuration.

---

### 🔐 11. Security Admin

**Portal Path**: `/admin/security`

**Main Responsibility**: Monitor and manage site security

**Editable Section**: Backend security configuration tools

**Capabilities**:
- Monitor login logs, failed attempts, and suspicious activities
- Enforce password and 2FA policies
- Revoke access for compromised accounts
- Collaborate with Super Admin on updates and patches
- Track all backend activity logs

**Viewer Side Affected**: None (security is backend-only). However, all public content safety relies on this admin's work.

---

## System Summary

| Admin Role | Portal Path | Viewer Page Controlled | Editable Content | Visibility to Viewers |
|------------|-------------|----------------------|------------------|---------------------|
| Super Admin | `/superadmin` | All pages | Everything | No (backend only) |
| Events Admin | `/admin/events` | `/events` | Events content | Yes |
| Gallery Admin | `/admin/gallery` | `/gallery` | Media, images, videos | Yes |
| Blog Admin | `/admin/blog` | `/blog` or `/news` | Blog articles, stories | Yes |
| Team Admin | `/admin/team` | `/team` | Leadership profiles | Yes |
| Partners Admin | `/admin/partners` | Home (partners section) | Partner details, logos | Yes |
| Programs Admin | `/admin/programs` | `/programs` | ELP programs | Yes |
| Testimonials Admin | `/admin/testimonials` | `/testimonials` | User feedback | Yes |
| Announcements Admin | `/admin/announcements` | Homepage banner / dashboard bar | Notices, alerts | Yes |
| User Support Admin | `/admin/support` | `/contact` | Messages, contacts | Yes |
| Security Admin | `/admin/security` | Backend only | Access logs, security rules | No |

---

## Technical Implementation

### Frontend (React)
- All pages dynamically fetch content from backend APIs (`/api/events`, `/api/posts`, etc.)
- Admin portals use role-based access control (RBAC)
- Protected routes ensure only authorized admins can access their portals

### Backend (Node.js/Express)
- Provides CRUD routes for each admin to update their respective section
- Role-based middleware enforces permissions
- All content stored in MongoDB with proper validation

### Database (MongoDB)
- Stores all viewer-facing content editable by admins
- Collections: Events, Posts, Gallery, Members, Partners, Testimonials, Announcements, etc.

### Cloud Storage (Cloudinary)
- Handles image/video uploads for Gallery Admin and other media needs
- Automatic optimization and CDN delivery

### Authentication
- JWT + Role-Based Access Control (RBAC)
- Each admin role has specific permissions defined in `constants/adminRoles.js`

### Deployment
- Securely hosted (Render for backend, Vercel for frontend)
- HTTPS enforced
- Environment variables for sensitive configuration

---

## ✅ Final Output Definition

Every public-facing element on the University of Embu ELC website — including text, images, events, partners, programs, and testimonials — is fully dynamic and editable only through the respective admin dashboards.

The Super Admin oversees, manages, and approves all changes to ensure consistency, accuracy, and security.

**Key Features**:
- ✅ Dynamic content management without code changes
- ✅ Role-based access control for security
- ✅ Real-time updates visible to viewers
- ✅ Centralized admin management
- ✅ Full audit trail and activity logging

