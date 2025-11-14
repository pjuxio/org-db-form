# Climate Justice Organization Database

A full-stack web application for managing a database of climate justice organizations worldwide, with user authentication and collaborative editing.

## Features

- 🌍 Browse and search organizations
- ✏️ Edit existing records (authenticated users)
- 👥 Multi-user support with invite-only access
- 🔐 Secure authentication with sessions
- 📊 Audit trail (tracks who created/updated records)
- 📤 JSON export functionality
- 🎯 Role-based permissions (admin/editor)
- 📱 Mobile-friendly responsive design

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Auth:** bcrypt, express-session, connect-mongo
- **Deployment:** Heroku + MongoDB Atlas

## Local Development

### Prerequisites

- Node.js 18.x
- MongoDB Atlas account

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/pjuxio/org-db-form.git
   cd org-db-form
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   SESSION_SECRET=your-random-secret-key
   PORT=3000
   ```

3. **Create your first user:**
   ```bash
   npm run create-user
   ```
   Follow prompts to create an admin user.

4. **Import existing data (optional):**
   ```bash
   node import-data.js
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Access the application:**
   - Add: http://localhost:3000/
   - Browse: http://localhost:3000/view.html
   - Login: http://localhost:3000/login.html

## User Management (Invite-Only)

### Creating Users

```bash
npm run create-user
```

Prompts for:
- Email
- Name  
- Password
- Role (admin/editor)

**Roles:**
- **Editor:** Can create and edit organizations
- **Admin:** Can create, edit, and delete organizations

### Authentication

1. Admin creates user accounts via script
2. Users login at `/login.html`
3. Sessions persist for 7 days
4. No public registration allowed

## Deployment to Heroku

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set SESSION_SECRET="your-secret-key"
   ```

3. **Deploy:**
   ```bash
   git push heroku master
   ```

4. **Create first production user:**
   ```bash
   heroku run npm run create-user --app your-app-name
   ```

## API Endpoints

### Public
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/:id` - Get single organization  
- `POST /api/organizations` - Create organization
- `GET /api/export` - Download JSON export

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Check auth status

### Protected
- `PUT /api/organizations/:id` - Update organization (requires auth)
- `DELETE /api/organizations/:id` - Delete organization (requires admin)

## Project Structure

```
org-db-form/
├── models/
│   └── User.js              # User model with password hashing
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/
│   ├── index.html           # Add organization form
│   ├── view.html            # Browse organizations
│   ├── edit.html            # Edit organization
│   ├── login.html           # Login page
│   ├── script.js            # Form logic
│   ├── view.js              # View/search logic
│   ├── edit.js              # Edit logic
│   └── styles.css           # Styles
├── data/
│   └── source.json          # Original data source
├── server.js                # Express server
├── create-user.js           # User creation script
├── import-data.js           # Data import script
├── .env                     # Environment variables (not in git)
├── package.json
├── Procfile                 # Heroku config
└── README.md
```

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- Sessions stored in MongoDB
- HTTPS required in production
- No public user registration
- Admin manually creates all accounts
- Audit trail tracks all changes

## License

MIT
