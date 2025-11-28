# Quick Setup Guide - Voting System

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Cloudinary account (for candidate photos)
- reCAPTCHA v3 keys (optional but recommended)

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install socket.io nodemailer
```

### Frontend
```bash
cd frontend
npm install socket.io-client recharts
```

## Step 2: Configure Environment

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017/elp-voting
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
VOTE_LINK_SECRET=your-hmac-secret-for-voting-tokens-min-32-chars
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
FRONTEND_URL=http://localhost:5173
SOCKET_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: reCAPTCHA
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET_KEY=your-secret-key
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=your-site-key
```

## Step 3: Seed Sample Data

```bash
cd backend
node scripts/seed-voting.js
```

This creates:
- A test election
- 4 positions (Chairperson, Vice Chairperson, Secretary General, Treasurer)
- 3 candidates per position (12 total)
- Test admin account (admin@elp.org / password123)

## Step 4: Start Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 5: Test the System

1. **Login as Admin**: http://localhost:5173/login
   - Email: Check seed script or use environment variables (TEST_ADMIN_EMAIL)
   - Password: Check seed script or use environment variables (TEST_ADMIN_PASSWORD)
   - ⚠️ **IMPORTANT**: Change default credentials in production!

2. **Create/Manage Elections**: http://localhost:5173/admin/elections

3. **Start an Election**: 
   - Go to election management
   - Click "Start Election" on an approved election

4. **Generate Voting Links**:
   - Click "Generate Links" on an active election
   - Links will be created for all verified members

5. **Vote**:
   - Access voting link: http://localhost:5173/vote/<token>
   - Select candidates and vote

6. **View Live Results**:
   - http://localhost:5173/elections/<electionId>/results
   - Watch real-time updates as votes are cast

## Testing Multiple Voters

1. Open multiple browser windows (or incognito tabs)
2. Use different voting tokens
3. Cast votes simultaneously
4. Watch real-time updates on the results page

## API Testing with cURL

### Validate Voting Link
```bash
curl -X POST http://localhost:5000/api/vote/validate-link \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

### Cast Vote
```bash
curl -X POST http://localhost:5000/api/vote/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "candidateId": "CANDIDATE_ID",
    "positionId": "POSITION_ID",
    "electionId": "ELECTION_ID",
    "token": "VOTING_TOKEN"
  }'
```

### Get Results
```bash
curl http://localhost:5000/api/vote/results/ELECTION_ID
```

## Troubleshooting

### Socket.io Not Working
- Check backend console for Socket.io initialization message
- Verify `SOCKET_ORIGIN` in backend `.env`
- Check browser console for connection errors
- Ensure CORS is configured correctly

### Voting Links Not Generating
- Verify `VOTE_LINK_SECRET` is set in backend `.env`
- Check that members exist and are verified
- Review backend logs for errors

### Real-Time Updates Not Showing
- Verify Socket.io connection in browser console
- Check that election is subscribed: `socket.emit('subscribe', { electionId })`
- Ensure backend is emitting events correctly

### Database Errors
- Verify MongoDB is running
- Check `MONGO_URI` in backend `.env`
- Ensure database connection is successful

## Next Steps

1. **Customize**: Modify election settings, positions, and candidates
2. **Configure Email**: Set up SMTP for automated voting link emails
3. **Enable reCAPTCHA**: Add keys for bot protection
4. **Deploy**: Follow deployment guide in `VOTING_SYSTEM_README.md`

## Support

For detailed documentation, see `VOTING_SYSTEM_README.md`

