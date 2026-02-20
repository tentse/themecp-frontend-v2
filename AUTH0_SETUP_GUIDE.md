# Auth0 Setup Guide for ThemeCP

This guide will walk you through setting up Auth0 authentication for the ThemeCP frontend application.

## What is Auth0?

Auth0 is a comprehensive authentication and authorization platform that provides:
- Multiple social login providers (Google, GitHub, Facebook, Twitter, etc.)
- Universal Login experience
- Built-in security features (MFA, breach detection, bot detection)
- Easy user management through a dashboard
- Single SDK for all authentication needs

## Prerequisites

- A ThemeCP frontend application (this repository)
- A backend API with `/auth/login` and `/auth/register` endpoints
- An email address to create an Auth0 account

## Step 1: Create Auth0 Account

1. Go to [https://auth0.com](https://auth0.com)
2. Click **Sign Up** in the top right corner
3. Sign up with your email or a social provider
4. Verify your email address if required

## Step 2: Create a Tenant

When you first sign up, Auth0 will prompt you to create a tenant:

1. **Tenant Domain**: Choose a unique name (e.g., `themecp` or `themecp-dev`)
   - This will be part of your domain: `your-name.us.auth0.com`
   - You cannot change this later, so choose carefully
2. **Region**: Select the region closest to your users (e.g., US, EU, AU)
3. Click **Create**

## Step 3: Create an Application

1. In the Auth0 Dashboard, go to **Applications** → **Applications** in the left sidebar
2. Click **Create Application**
3. Configure:
   - **Name**: `ThemeCP Frontend` (or any name you prefer)
   - **Application Type**: Select **Single Page Web Applications**
4. Click **Create**
5. You'll be taken to the application's Quick Start page

## Step 4: Configure Application Settings

1. Click the **Settings** tab in your application
2. Scroll down to **Application URIs** section
3. Configure the following:

   **Allowed Callback URLs** (comma-separated):
   ```
   http://localhost:5173,http://localhost:3000,https://yourdomain.com
   ```
   
   **Allowed Logout URLs** (comma-separated):
   ```
   http://localhost:5173,http://localhost:3000,https://yourdomain.com
   ```
   
   **Allowed Web Origins** (comma-separated):
   ```
   http://localhost:5173,http://localhost:3000,https://yourdomain.com
   ```

   > **Note**: Replace `https://yourdomain.com` with your actual production domain when you deploy.

4. Scroll down and click **Save Changes**

## Step 5: Get Your Credentials

In the same **Settings** tab, find these values at the top:

- **Domain**: Something like `your-tenant.us.auth0.com`
- **Client ID**: A long string like `abc123def456...`

Copy these values - you'll need them for your `.env` file.

## Step 6: Configure Social Connections

By default, Auth0 provides a built-in database connection. To add social logins:

### Google

1. Go to **Authentication** → **Social** in the left sidebar
2. Find **Google** and click on it
3. Click the toggle to enable it
4. You'll need to provide:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

**To get Google credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add Authorized redirect URIs:
   ```
   https://your-tenant.us.auth0.com/login/callback
   ```
7. Copy the Client ID and Client Secret to Auth0

### GitHub

1. In Auth0, go to **Authentication** → **Social**
2. Find **GitHub** and click on it
3. Click the toggle to enable it
4. You'll need to provide:
   - **Client ID**: From GitHub
   - **Client Secret**: From GitHub

**To get GitHub credentials:**
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: ThemeCP
   - **Homepage URL**: `http://localhost:5173` or your domain
   - **Authorization callback URL**: `https://your-tenant.us.auth0.com/login/callback`
4. Click **Register application**
5. Copy the Client ID and generate a Client Secret
6. Add these to Auth0

### Other Providers (Optional)

Auth0 supports many other providers:
- Facebook
- Twitter/X
- LinkedIn
- Microsoft
- Apple
- And many more

Follow similar steps for each provider you want to enable.

## Step 7: Enable Connections for Your Application

After enabling social connections:

1. Go to **Authentication** → **Social**
2. Click on each enabled provider
3. Go to the **Applications** tab
4. Make sure your application (`ThemeCP Frontend`) is checked
5. Click **Save**

## Step 8: Update Environment Variables

1. In your ThemeCP frontend project, open the `.env` file
2. Update it with your Auth0 credentials:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-actual-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_GA4_ID=G-XXXXXXXXXX
```

**Replace:**
- `your-tenant.us.auth0.com` with your actual Auth0 domain
- `your-actual-client-id` with your actual Client ID from Step 5
- `https://your-api-identifier` with your API identifier (optional, see note below)

> **Note on VITE_AUTH0_AUDIENCE**: This is optional. If you have an Auth0 API set up, use its identifier. Otherwise, you can omit this or leave it as a placeholder.

## Step 9: Test Your Setup

1. Make sure your backend is running (on `http://localhost:8000` or your configured URL)
2. Start your frontend:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser
4. Click **Login** in the navigation
5. You should be redirected to Auth0's Universal Login page
6. You should see options to sign in with the providers you configured (Google, GitHub, etc.)
7. Sign in with one of the providers
8. You should be redirected back to your app at `/profile`
9. Check the browser console for any errors

## Step 10: Customize Universal Login (Optional)

Auth0 provides a customizable Universal Login experience:

1. Go to **Branding** → **Universal Login** in the Auth0 Dashboard
2. Choose a template or customize the HTML/CSS
3. Add your logo and brand colors
4. Preview your changes
5. Save

## Troubleshooting

### Error: "Callback URL mismatch"

**Solution**: Make sure the callback URL in your Auth0 application settings exactly matches your app's URL, including protocol (`http://` or `https://`) and port.

### Error: "Access Denied"

**Solutions**:
- Check that the social connection is enabled in Auth0
- Verify the connection is enabled for your specific application
- For Google: Make sure your app is not in "Testing" mode or add your email as a test user

### Error: "Invalid state"

**Solution**: This usually means there's a mismatch in the redirect flow. Clear your browser cache and cookies, then try again.

### Login succeeds but user is not redirected

**Solutions**:
- Check browser console for JavaScript errors
- Verify `VITE_API_BASE_URL` is correct
- Check that your backend's `/auth/login` endpoint is working
- Look for CORS errors in the network tab

### Email is not being extracted

**Solutions**:
- Check that your social connection is requesting the `email` scope
- Some providers (like GitHub) require explicit permission to share email
- Verify in Auth0 Dashboard → User Management → Users that the email is present

## Production Deployment

When deploying to production:

1. **Update Auth0 Application Settings**:
   - Add your production domain to Allowed Callback URLs
   - Add your production domain to Allowed Logout URLs
   - Add your production domain to Allowed Web Origins

2. **Update Environment Variables**:
   - In your hosting platform (Vercel, Netlify, etc.), set the production environment variables
   - Use the same Auth0 credentials or create a separate Auth0 tenant for production

3. **Enable Production Mode**:
   - In Auth0 Dashboard → Branding → Universal Login, ensure everything is production-ready
   - Test thoroughly before launching

4. **Security Best Practices**:
   - Enable MFA (Multi-Factor Authentication) in Auth0 settings
   - Enable bot detection and breach detection
   - Set up proper logging and monitoring
   - Review Auth0's security checklist

## Additional Features

Auth0 offers many advanced features you can explore:

- **Multi-Factor Authentication (MFA)**: Add an extra layer of security
- **Passwordless Login**: Allow users to log in with email magic links or SMS
- **Rules and Actions**: Add custom logic to the authentication flow
- **Organizations**: Support B2B use cases with organization-based access
- **Role-Based Access Control (RBAC)**: Manage user permissions

## Support

- **Auth0 Documentation**: [https://auth0.com/docs](https://auth0.com/docs)
- **Auth0 Community**: [https://community.auth0.com](https://community.auth0.com)
- **Auth0 Support**: Available through the dashboard for paid plans

## Summary

You've successfully set up Auth0 for ThemeCP! Your users can now sign in with multiple providers through a secure, managed authentication system. Auth0 handles all the complexity of OAuth, security, and user management, letting you focus on building your application.
