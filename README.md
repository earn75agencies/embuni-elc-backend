# University of Embu Equity Leaders Program Website

A comprehensive web platform for managing the University of Embu Equity Leaders Program, featuring member management, event coordination, voting systems, and administrative portals.

## 🚀 Features

### Core Features
- **Member Management**: Registration, profiles, and member directories
- **Event Management**: Event creation, registration, and attendance tracking
- **Voting System**: Secure elections with real-time results
- **Content Management**: News, blog posts, and gallery management
- **Admin Portals**: Role-based administrative interfaces
- **Internationalization**: Multi-language support (English, Swahili, French, Arabic)

### Advanced Features
- **Real-time Communication**: WebSocket integration for live updates
- **Mentorship Program**: Mentor-mentee matching and session management
- **Internship Portal**: Internship listings and application management
- **Alumni Network**: Alumni profiles and networking features
- **Learning Management**: Course management and progress tracking
- **Performance Monitoring**: Built-in analytics and performance metrics

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **i18next** - Internationalization framework
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email services
- **Cloudinary** - Image and file storage

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Vitest** - Frontend testing
- **Cypress** - E2E testing
- **Docker** - Containerization

## 📁 Project Structure

```
equity-leaders-website/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── validators/         # Input validation
│   └── tests/              # Backend tests
├── frontend/               # React/Vite frontend
│   ├── src/
│   │   ├── admin/          # Admin components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── i18n/          # Internationalization
│   └── public/            # Static assets
├── scripts/                # Deployment and utility scripts
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/equity-leaders-website.git
   cd equity-leaders-website
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend environment
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start backend (port 5000)
   cd backend
   npm run dev
   
   # Start frontend (port 5173) - in a new terminal
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

### Individual Docker Builds

```bash
# Backend
cd backend
docker build -t elp-backend .
docker run -p 5000:5000 elp-backend

# Frontend
cd frontend
docker build -t elp-frontend .
docker run -p 5173:5173 elp-frontend
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:integration    # Integration tests only
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run unit tests
npm run test:ui            # Interactive test UI
npm run test:coverage      # With coverage
npm run test:e2e          # E2E tests with Cypress
```

## 📚 API Documentation

API documentation is available via Swagger UI:
- Development: http://localhost:5000/api-docs
- Production: https://your-domain.com/api-docs

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

#### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event (admin)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (admin)

#### Voting
- `GET /api/elections` - List elections
- `POST /api/vote` - Submit vote
- `GET /api/vote/results/:id` - Get election results

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/equity-leaders
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
SESSION_SECRET=your-session-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# reCAPTCHA
RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Equity Leaders Program
VITE_RECAPTCHA_SITE_KEY=your-site-key
```

## 🚀 Deployment

### Production Deployment

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure production environment**
   ```bash
   # Set NODE_ENV=production
   # Configure production database URLs
   # Set up SSL certificates
   ```

3. **Deploy backend**
   ```bash
   cd backend
   npm start
   ```

### Deployment Platforms

#### Render (Recommended)
- Backend: Connect to GitHub repository
- Frontend: Connect to GitHub repository with build command
- Database: Use Render's managed MongoDB

#### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Traditional VPS
```bash
# Use PM2 for process management
npm install -g pm2
pm2 start backend/server.js --name "elp-backend"
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@embuni.ac.ke
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/equity-leaders-website/issues)
- 📖 Documentation: [Project Wiki](https://github.com/your-org/equity-leaders-website/wiki)

## 🙏 Acknowledgments

- University of Embu for sponsoring the Equity Leaders Program
- All contributors who have helped build this platform
- The open-source community for the amazing tools and libraries

## 📊 Project Status

- ✅ Core functionality complete
- ✅ Admin portals implemented
- ✅ Voting system operational
- ✅ Internationalization support
- 🚧 Mobile app in development
- 📋 Analytics dashboard planned
- 🔔 Push notifications planned

---

**Built with ❤️ for the University of Embu Equity Leaders Program**