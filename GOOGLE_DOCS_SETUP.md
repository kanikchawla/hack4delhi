# Google Docs Integration Setup Guide

This guide explains how to connect your Hack4Delhi application to Google Docs for automatic query/grievance logging.

## Prerequisites
- Google Cloud Project
- Service Account with Google Sheets API enabled
- A Google Sheet created and shared with the service account

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name it "Hack4Delhi" or similar)
3. Enable the Google Sheets API:
   - Search for "Google Sheets API"
   - Click **Enable**

## Step 2: Create a Service Account

1. In Google Cloud Console, go to **Service Accounts**
2. Click **Create Service Account**
   - Name: `hack4delhi-service`
   - Description: "Service account for Hack4Delhi app"
   - Click **Create and Continue**
3. Click **Continue** on permissions page (skip for now)
4. Click **Create Key**
   - Choose **JSON** format
   - Download the JSON file (keep it safe!)

## Step 3: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet named "Hack4Delhi Queries"
3. Add column headers in the first row:
   ```
   Timestamp | User | Query | Status
   ```
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

## Step 4: Share the Sheet with Service Account

1. Open the JSON file you downloaded
2. Copy the email address that looks like: `hack4delhi-service@project-id.iam.gserviceaccount.com`
3. In your Google Sheet, click **Share**
4. Paste the service account email
5. Give it **Editor** access
6. Uncheck "Notify people"

## Step 5: Configure Your Backend

### Install Google Sheets Library

```bash
cd /Users/kaniklchawla/Desktop/hack4delhi
source .venv/bin/activate
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### Set Environment Variables

1. Save your service account JSON file to a secure location
2. Add to your `.env` file or export as environment variable:

```bash
# Option 1: Via .env file
GOOGLE_SHEETS_CREDENTIALS_JSON=/path/to/your/service-account-key.json
GOOGLE_SHEETS_SHEET_ID=your-sheet-id-here

# Option 2: Via environment variables
export GOOGLE_SHEETS_CREDENTIALS_JSON=/path/to/your/service-account-key.json
export GOOGLE_SHEETS_SHEET_ID=your-sheet-id-here
```

### Update app.py

The backend already has the `/api/submit-query` endpoint configured. Just ensure:

1. Your credentials are in the right place
2. Environment variables are set
3. Restart the Flask app:

```bash
cd /Users/kaniklchawla/Desktop/hack4delhi
source .venv/bin/activate
python app.py
```

## Step 6: Test the Integration

1. Start your frontend:
```bash
cd frontend
npm run dev
```

2. Navigate to **Queries & Docs** in the sidebar
3. Enter a test query and click **Save**
4. Check your Google Sheet - the query should appear!

## Troubleshooting

### "Failed to append to sheet"
- Verify service account email has editor access to the sheet
- Check Sheet ID is correct
- Ensure Google Sheets API is enabled

### "Cannot find credentials"
- Verify `GOOGLE_SHEETS_CREDENTIALS_JSON` path is correct
- Use absolute path, not relative path
- Check file permissions

### "Sheet not found"
- Verify Sheet ID matches your Google Sheet URL
- Try recreating a new sheet and updating the ID

## Security Best Practices

1. **Never commit credentials to GitHub**
   - Add `*.json` to `.gitignore`
   - Add `.env` to `.gitignore`

2. **Rotate keys regularly**
   - Delete old service account keys in Google Cloud Console
   - Create new ones periodically

3. **Restrict API access**
   - Only enable Google Sheets API
   - Use service account (never use personal credentials)

## Accessing Your Data

### View in Google Sheets
- Open your sheet to see all queries in real-time
- Create charts and reports

### Export Data
- Download as CSV: File → Download → CSV
- Use for analysis and reports

## Additional Features

### Add Auto-Formatting
Add formulas or conditional formatting in Google Sheets:
- Color-code by status
- Add timestamp formatting
- Create pivot tables for analysis

### Notifications
- Set up email notifications in Google Sheets
- Share sheet with team members
- Collaborate in real-time

## Support

For issues:
1. Check Google Cloud Console for API errors
2. Verify service account permissions
3. Check Flask logs for backend errors
4. Check browser console (F12) for frontend errors
