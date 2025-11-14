# Climate Justice Organization Database

A web application for managing a global database of climate justice organizations, with a focus on Afrodescendant communities.

## Features

- ✅ Add new organizations via web form
- ✅ View and search existing organizations
- ✅ Automatic backup before each save
- ✅ Validation and data integrity
- ✅ Mobile-friendly responsive design
- ✅ Ready for Heroku deployment

## Local Development

### Prerequisites

- Node.js 18.x or higher
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Deployment to Heroku

### Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new app (replace 'your-app-name' with your desired name)
heroku create your-app-name
```

### Step 2: Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 3: Deploy

```bash
# Set the remote
heroku git:remote -a your-app-name

# Push to Heroku
git push heroku main
```

### Step 4: Open Your App

```bash
heroku open
```

## API Endpoints

- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

## Project Structure

```
org-db-form/
├── data/
│   └── source.json          # Main database file
├── public/
│   ├── index.html           # Add organization form
│   ├── view.html            # View organizations
│   ├── styles.css           # Styling
│   ├── script.js            # Form logic
│   └── view.js              # View page logic
├── server.js                # Express server
├── package.json             # Dependencies
├── Procfile                 # Heroku configuration
└── README.md                # This file
```

## Notes

- The app automatically creates backups before saving changes
- All backups are stored in the `data/` folder with timestamps
- The form validates required fields (Name and Overview)
- Multi-select fields: Hold Ctrl (Windows) or Cmd (Mac) for multiple selections

## Support

For issues or questions, please open an issue in the repository.
