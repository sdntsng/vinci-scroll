# Fix Google OAuth Configuration - ScrollNet

## 🚨 Current Error
```
Error 400: redirect_uri_mismatch
Request details: redirect_uri=https://qypdxjufzwombujqgkhz.supabase.co/auth/v1/callback
```

## 🔧 Solution Steps

### Step 1: Google Cloud Console Configuration

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Select project: `vinci-scroll`

2. **Navigate to OAuth Configuration**:
   - Go to: **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID (or create one if missing)

3. **Add Authorized Redirect URIs**:
   ```
   https://qypdxjufzwombujqgkhz.supabase.co/auth/v1/callback
   ```

4. **For Development (Optional)**:
   ```
   http://localhost:3004/auth/callback
   http://localhost:3005/auth/callback
   ```

### Step 2: Supabase Configuration

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select project: `qypdxjufzwombujqgkhz`

2. **Configure Google OAuth**:
   - Go to: **Authentication** > **Providers**
   - Find **Google** provider
   - Enable it if not already enabled

3. **Add OAuth Credentials**:
   - **Client ID**: Copy from Google Cloud Console
   - **Client Secret**: Copy from Google Cloud Console

### Step 3: Verify Configuration

1. **Check Redirect URI in Supabase**:
   - Should be: `https://qypdxjufzwombujqgkhz.supabase.co/auth/v1/callback`

2. **Test OAuth Flow**:
   - Start the application
   - Try Google sign-in
   - Should redirect properly

## 🎯 Quick Fix Commands

```bash
# 1. Start backend
npm run dev:backend

# 2. Start frontend (in new terminal)
cd frontend && npm run dev

# 3. Test OAuth
# Visit: http://localhost:3004
# Click "Sign In with Google"
```

## 📋 Checklist

- [ ] Google Cloud Console: OAuth Client ID created
- [ ] Google Cloud Console: Redirect URI added
- [ ] Supabase: Google provider enabled
- [ ] Supabase: Client ID and Secret configured
- [ ] Application: OAuth flow tested

## 🔍 Troubleshooting

### If still getting redirect_uri_mismatch:
1. Double-check the exact URI in Google Cloud Console
2. Ensure no trailing slashes or extra characters
3. Wait 5-10 minutes for changes to propagate

### If OAuth provider not found:
1. Verify Supabase project ID matches
2. Check environment variables are correct
3. Restart both backend and frontend

## 📞 Support

If issues persist:
1. Check Google Cloud Console > APIs & Services > Credentials
2. Verify Supabase Authentication settings
3. Review browser developer console for errors

---

**Next Steps**: Follow Step 1 first, then test the OAuth flow. 