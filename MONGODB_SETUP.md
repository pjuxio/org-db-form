# MongoDB Setup Guide

## Step 1: Create MongoDB Atlas Account (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (select the FREE M0 tier)
4. Wait for cluster creation (2-3 minutes)

## Step 2: Set Up Database Access

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password (save these!)
5. Set privileges to **Read and write to any database**
6. Click **Add User**

## Step 3: Set Up Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (or add `0.0.0.0/0`)
   - For production, you can restrict this later
4. Click **Confirm**

## Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Replace the database name (after `.net/`) with `climate-justice`

## Step 5: Configure Local Environment

1. Open the `.env` file in your project
2. Replace `your_mongodb_connection_string_here` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/climate-justice?retryWrites=true&w=majority
   ```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Import Your Existing Data

```bash
node import-data.js
```

You should see:
```
✅ Successfully imported 335 organizations!
```

## Step 8: Start Your Server

```bash
npm start
```

Visit http://localhost:3000 - everything should work!

## Step 9: Deploy to Heroku

```bash
# Set MongoDB URI on Heroku
heroku config:set MONGODB_URI="your_connection_string_here"

# Deploy
git add .
git commit -m "Switch to MongoDB"
git push heroku main
```

## Testing the Export Endpoint

Your frontend can now get JSON data from:
- **All organizations:** `https://your-app.herokuapp.com/api/organizations`
- **Export as file:** `https://your-app.herokuapp.com/api/export`

Both return the same JSON array format you had before!

## Troubleshooting

**Connection Error?**
- Check username/password are correct
- Check IP whitelist includes your IP
- Ensure connection string has database name

**Import Failed?**
- Make sure `data/source.json` exists
- Check the JSON is valid

**Can't Connect on Heroku?**
- Make sure you set the config var: `heroku config:set MONGODB_URI="..."`
- Check Heroku logs: `heroku logs --tail`
