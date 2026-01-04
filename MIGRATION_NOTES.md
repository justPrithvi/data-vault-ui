# Frontend Migration Notes

## Changes Made

This frontend has been updated to work with the new JWT authentication and direct file upload backend.

### Authentication Flow
- **Before:** AWS Cognito with confirmation codes
- **After:** JWT tokens received immediately on signup/login

### File Upload Flow
- **Before:** 3-step process (get presigned URL → upload to S3 → save metadata)
- **After:** 1-step process (upload file directly to backend)

## Files Modified

### 1. src/components/UploadModal.tsx
**Changed:** Upload logic from S3 presigned URL to direct FormData upload

**Before:**
```typescript
// Get presigned URL
const presignRes = await api.get("/documents/presigned-url", {...});
// Upload to S3
await fetch(uploadUrl, { method: "PUT", body: file });
// Save metadata
await api.post("/documents/metadata", {...});
```

**After:**
```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("tags", JSON.stringify(selectedTags));
await api.post("/documents/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

### 2. src/app/auth/signup/page.tsx
**Changed:** Store JWT token immediately after signup

**After:**
```typescript
const response = await api.post('/auth/signup', {userName, email, password});
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('user', JSON.stringify(response.data.user));
router.push('/screens/dashboard');
```

### Files Unchanged (Already Compatible)
- `src/context/AuthContext.tsx` - Already using JWT
- `src/app/lib/axios.ts` - Already configured for Bearer tokens
- `src/app/screens/document/page.tsx` - Compatible with new backend

## API Endpoints Used

### Authentication
- `POST /auth/signup` - Register and get JWT token
- `POST /auth/signin` - Login and get JWT token

### Documents (All require JWT in Authorization header)
- `POST /documents/upload` - Upload file (multipart/form-data)
- `GET /documents/:email` - Get user's documents

### Tags
- `GET /internal/tags` - Get all tags

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Testing

1. Navigate to http://localhost:3000/auth/signup
2. Create an account (you'll be logged in immediately)
3. Upload a document from the dashboard
4. Verify the document appears in the list

## How Authentication Works

1. User signs up or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios interceptor automatically adds token to all requests:
   ```typescript
   config.headers.Authorization = `Bearer ${token}`
   ```
5. Backend validates token on protected routes

## How File Upload Works

1. User selects file and tags in UploadModal
2. Create FormData with file and tags
3. POST to `/documents/upload` with multipart/form-data
4. Backend saves file to disk and metadata to database
5. Modal closes and document list refreshes

## Notes

- No AWS credentials needed
- JWT tokens expire in 7 days (configured on backend)
- Unauthorized requests (401) automatically trigger logout
- File uploads include authentication token automatically

