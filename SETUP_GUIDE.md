# ScrollNet Setup Guide: Google Cloud Storage + Supabase

This guide will help you set up Google Cloud Storage for video uploads and Supabase for database & authentication.

## 🚀 Quick Start

1. **Set up Google Cloud Storage**
2. **Set up Supabase**
3. **Configure environment variables**
4. **Upload your videos**
5. **Start the application**

---

## 1. Google Cloud Storage Setup

### Step 1: Create a GCP Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID**

### Step 2: Enable APIs
1. Go to **APIs & Services > Library**
2. Enable the **Cloud Storage API**

### Step 3: Create a Storage Bucket
1. Go to **Cloud Storage > Buckets**
2. Click **Create Bucket**
3. Choose a unique bucket name (e.g., `scrollnet-videos-your-name`)
4. Select a region close to your users
5. Choose **Standard** storage class
6. Set **Public access prevention** to **Off** (we'll make videos publicly accessible)
7. Create the bucket

### Step 4: Create a Service Account
1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Name: `scrollnet-storage`
4. Description: `Service account for ScrollNet video uploads`
5. Click **Create and Continue**
6. Add role: **Storage Admin**
7. Click **Continue** and **Done**

### Step 5: Generate Service Account Key
1. Click on your service account
2. Go to **Keys** tab
3. Click **Add Key > Create New Key**
4. Choose **JSON** format
5. Download the key file
6. Save it as `gcs-service-account.json` in your project root
7. **Keep this file secure and never commit it to git!**

---

## 2. Supabase Setup

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Sign up/Login with GitHub
3. Click **New Project**
4. Choose your organization
5. Name: `scrollnet-mvp`
6. Database Password: Generate a strong password
7. Region: Choose closest to your users
8. Click **Create new project**

### Step 2: Get API Keys
1. Go to **Settings > API**
2. Copy these values:
   - **Project URL**
   - **anon public key**
   - **service_role secret key**

### Step 3: Set up Database Schema
1. Go to **SQL Editor**
2. Copy the contents of `database/supabase-schema.sql`
3. Paste and run the SQL script
4. This creates all necessary tables and security policies

---

## 3. Environment Configuration

### Step 1: Create .env file
Copy `env.example` to `.env` and fill in your values:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Cloud Storage Configuration
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./gcs-service-account.json

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Step 2: Frontend Environment
Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 4. Upload Your Videos

### Option 1: Using the Upload Script (Recommended)
```bash
# Make sure your server is running
npm run dev

# In another terminal, run the upload script
node scripts/upload-videos.js /path/to/your/video/folder
```

### Option 2: Using the API Directly
```bash
# Upload a single video
curl -X POST http://localhost:3001/api/upload/video \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Video Title" \
  -F "description=Video description" \
  -F "tags=tag1,tag2,tag3"

# Upload from directory
curl -X POST http://localhost:3001/api/upload/directory \
  -H "Content-Type: application/json" \
  -d '{
    "directoryPath": "/path/to/your/videos",
    "sessionName": "My Upload Session"
  }'
```

### Option 3: Web Interface (Coming Soon)
We'll add a web-based upload interface in a future update.

---

## 5. Start the Application

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start both backend and frontend
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🔧 Troubleshooting

### Common Issues

#### "Service account key not found"
- Ensure `gcs-service-account.json` is in your project root
- Check the path in `GOOGLE_APPLICATION_CREDENTIALS`

#### "Permission denied" on GCS
- Verify your service account has **Storage Admin** role
- Check that your bucket exists and is accessible

#### "Database connection failed"
- Verify your Supabase URL and keys
- Ensure you've run the database schema setup
- Check that your Supabase project is active

#### "Videos not loading"
- Check browser console for CORS errors
- Verify your backend is running on port 3001
- Ensure videos were uploaded successfully

### Testing Your Setup

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test video API
curl http://localhost:3001/api/videos

# Test upload endpoint
curl -X POST http://localhost:3001/api/upload/videos
```

---

## 📱 Mobile Testing

The app is designed mobile-first. For best testing experience:

1. **Chrome DevTools**: Use device emulation
2. **Real Device**: Use `ngrok` or similar to expose localhost
3. **Network Tab**: Monitor video loading performance

---

## 🔒 Security Notes

- **Never commit** your service account key to git
- **Rotate keys** regularly
- **Use environment variables** for all secrets
- **Enable RLS** (Row Level Security) in Supabase for production

---

## 📊 Monitoring

### Google Cloud Storage
- Monitor usage in GCS Console
- Set up billing alerts
- Track storage costs

### Supabase
- Monitor database usage in Supabase dashboard
- Check API usage and limits
- Set up alerts for high usage

---

## 🚀 Next Steps

Once your setup is complete:

1. **Upload your 60+ videos** using the script
2. **Test the mobile swipe interface**
3. **Customize video metadata** (titles, descriptions, tags)
4. **Set up user authentication** (Supabase Auth)
5. **Add analytics tracking**

---

## 💡 Tips for Large Video Collections

- **Batch uploads**: Use the directory upload for efficiency
- **Video optimization**: Consider compressing videos for mobile
- **CDN**: GCS provides global CDN automatically
- **Thumbnails**: Generate thumbnails for better UX
- **Metadata**: Use descriptive titles and tags for better discovery

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Verify all environment variables are set correctly
4. Test each service independently (GCS, Supabase, Backend)

The setup should take about 15-30 minutes depending on your familiarity with these services. 