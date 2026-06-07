# DataVault Frontend (`data-vault-ui`)

A Next.js 15 web application that serves as the visual dashboard for managing secure documents and communicating with an AI Chat Assistant.

---

## 🏗️ Codebase Structure

```bash
data-vault-ui/
├── public/                 # Static assets (images, icons, etc.)
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css     # Global styles and Tailwind base settings
│   │   ├── layout.tsx      # Main layout provider wrapper
│   │   ├── page.tsx        # Entry redirect page
│   │   │
│   │   ├── auth/           # Authentication Routes
│   │   │   ├── signin/
│   │   │   │   └── page.tsx # Login page (forms, validation, storage)
│   │   │   └── signup/
│   │   │       └── page.tsx # Registration page (user signup trigger)
│   │   │
│   │   ├── lib/            # REST API Clients & Axios Configuration
│   │   │   ├── axios.ts    # Main NestJS Axios client configured with JWT interceptors
│   │   │   ├── axiosFactory.ts # Dynamic Axios creator (for custom base URLs)
│   │   │   ├── nestApi.ts  # Endpoints calling the NestJS Backend
│   │   │   └── pythonApi.ts # Endpoints calling the Python RAG Microservice
│   │   │
│   │   └── screens/        # Main Dashboard Layout and Routes
│   │       ├── layout.tsx  # Sidebar context layout wrapper for dashboard pages
│   │       ├── sidebar.tsx # Persistent left sidebar navigation menu
│   │       ├── chat/
│   │       │   └── page.tsx # AI Chat Assistant interface (conversations, prompt context)
│   │       ├── dashboard/
│   │       │   └── page.tsx # Main Files table, tags filtering, and search controls
│   │       ├── document/
│   │       │   └── page.tsx # Document description detail screen
│   │       ├── document-types/
│   │       │   └── page.tsx # View categories/types of documents
│   │       ├── tags/
│   │       │   └── page.tsx # Add/view document categorization tags
│   │       └── settings/
│   │           └── page.tsx # User settings screen
│   │
│   ├── components/         # Reusable React UI Components
│   │   ├── PageHeader.tsx  # Persistent page titles, search inputs, and headers
│   │   ├── TableComponent.tsx # File lists metadata table (sorting, downloading, deleting)
│   │   └── UploadModal.tsx # Upload modal handling files and tags uploads to NestJS and Python
│   │
│   └── context/            # React Context Providers for Global State
│       ├── AuthContext.tsx # User session status & auth headers wrapper
│       └── PageHeaderContext.tsx # Handles persistent states of headers, icons, and searches
│
├── package.json            # Scripts & frontend dependencies
├── postcss.config.mjs
├── tailwind.config.ts      # Tailwind configuration settings
└── tsconfig.json           # TypeScript compilation config
```

---

## ⚙️ Configuration & Environment Setup

Create an environment configuration file named `.env.local` in the root of `data-vault-ui/`:

```env
# URL of the NestJS Backend API (Port 5001)
NEXT_PUBLIC_API_URL=http://localhost:5001

# URL of the Python RAG Chat Microservice (Port 8000)
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

---

## 🔐 How Frontend Authentication Works

1. **Sign In / Sign Up:**
   The user enters credentials in the [auth routes](file:///Users/prithviraj/Documents/datavault/data-vault-ui/src/app/auth). The form submits requests to the NestJS endpoints `/auth/signin` or `/auth/signup`.
2. **Token Storage:**
   Upon successful authentication, the backend returns a custom JWT string. The frontend stores it immediately in `localStorage`:
   ```typescript
   localStorage.setItem('accessToken', response.data.accessToken);
   localStorage.setItem('user', JSON.stringify(response.data.user));
   ```
3. **Axios Interceptor (`data-vault-ui/src/app/lib/axios.ts`):**
   An interceptor intercepts all outgoing HTTP requests, automatically appending the Bearer token:
   ```typescript
   config.headers.Authorization = `Bearer ${token}`;
   ```
4. **Token Verification:**
   Any API request (to either NestJS or the Python service) includes this header. The backend validates it on protected routes and returns `401 Unauthorized` if expired, triggering a logout in the UI.

---

## 📤 The Frontend File Upload Flow

When you click **Upload** inside [UploadModal.tsx](file:///Users/prithviraj/Documents/datavault/data-vault-ui/src/components/UploadModal.tsx):

1. **Upload to NestJS Backend:**
   Sends file and tags via FormData (`POST /documents/upload`). NestJS saves the file in `./uploads/` and returns the generated catalog database object with its database `id`.
2. **Forward to Python Service:**
   If NestJS returns a status code of `200` or `201`, the client extracts the new database `id` and immediately uploads the same file to the Python service using `uploadDocumentToPython(file, documentId)`.
3. **Asynchronous Processing:**
   The Python service responds with `202 Accepted` ("processing"), letting the client close the modal immediately, and generates chunk embeddings in the background.

---

## 🚀 Getting Started

1. Navigate to the UI folder and install dependencies:
   ```bash
   cd data-vault-ui
   npm install
   ```
2. Verify environment configuration in `.env.local`.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.
