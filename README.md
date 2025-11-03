<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🏆 Policy Hackathon AI Platform

**Nền tảng tổ chức cuộc thi hackathon chính sách với AI hỗ trợ đánh giá và chấm điểm**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.0-blue)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt](#-cài-đặt)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Tính năng](#-tính-năng)
- [Scripts](#-scripts)
- [Deployment](#-deployment)

---

## 🎯 Giới thiệu

**Policy Hackathon AI Platform** là hệ thống quản lý cuộc thi hackathon chính sách với tích hợp AI (Google Gemini) để:

- ✨ **Tự động đề xuất đề tài** dựa trên chủ đề cuộc thi
- 🤖 **AI chấm điểm** và đưa ra gợi ý đánh giá cho ban giám khảo
- 📊 **Quản lý đội thi** và bài nộp theo thời gian thực
- 🔒 **Bảo mật cao** với JWT authentication và MongoDB GridFS
- 📱 **Responsive UI** với Tailwind CSS

### Các vai trò trong hệ thống:

- **👥 Contestant (Thí sinh)**: Đăng ký đội, nhận đề tài AI, nộp bài
- **⚖️ Judge (Giám khảo)**: Chấm điểm, xem gợi ý AI, đánh giá bài thi
- **👑 Admin**: Quản lý users, teams, xem leaderboard, giám sát hệ thống

---

## 🛠️ Công nghệ sử dụng

### Frontend

- **[Next.js 16.0.1](https://nextjs.org/)** - React framework với App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 3.x](https://tailwindcss.com/)** - Styling framework

### Backend & Database

- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** - Cloud database
- **[Mongoose 8.x](https://mongoosejs.com/)** - MongoDB ODM
- **[GridFS](https://www.mongodb.com/docs/manual/core/gridfs/)** - File storage trong MongoDB

### AI & APIs

- **[Google Gemini 2.0 Flash](https://ai.google.dev/)** - AI model cho:
  - Topic generation (đề xuất đề tài)
  - Scoring suggestions (gợi ý chấm điểm)
  - Consistency analysis (phân tích tính nhất quán)

### Authentication & Security

- **[JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)** - Access tokens (15 phút)
- **[Refresh Tokens](https://auth0.com/docs/secure/tokens/refresh-tokens)** - Long-lived sessions (7 ngày)
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

### File Processing

- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** - PDF text extraction
- **[pdf2json](https://www.npmjs.com/package/pdf2json)** - Alternative PDF parser
- **[formidable](https://github.com/node-formidable/formidable)** - File upload handling

---

## 📁 Cấu trúc dự án

```
PolicyHackathon/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── refresh/route.ts
│   │   ├── teams/route.ts        # Teams management
│   │   ├── submissions/route.ts  # Submissions CRUD
│   │   ├── users/route.ts        # Users management
│   │   ├── upload/route.ts       # File upload to GridFS
│   │   ├── download/[fileId]/route.ts  # File download
│   │   ├── read-file/route.ts    # PDF/TXT content extraction
│   │   ├── generate-topic/route.ts     # AI topic generation
│   │   ├── score-suggestion/route.ts   # AI scoring
│   │   └── parse-pdf-external/route.ts # External PDF parsing
│   ├── admin/dashboard/page.tsx  # Admin dashboard
│   ├── judge/dashboard/page.tsx  # Judge dashboard
│   ├── contestant/dashboard/page.tsx  # Contestant dashboard
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Register page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── AdminDashboard.tsx
│   ├── JudgeDashboard.tsx
│   ├── ContestantDashboard.tsx
│   ├── AuthForm.tsx
│   ├── LandingPage.tsx
│   ├── Leaderboard.tsx
│   ├── Timer.tsx
│   ├── UploadModal.tsx
│   ├── Chatbot.tsx
│   └── icons.tsx
├── contexts/                     # React Context
│   └── AppContext.tsx            # Global state management
├── lib/                          # Utilities
│   ├── mongodb.ts                # MongoDB connection
│   ├── gridfs.ts                 # GridFS file operations
│   └── auth.ts                   # JWT utilities
├── models/                       # MongoDB schemas
│   ├── User.ts
│   ├── Team.ts
│   └── Submission.ts
├── services/                     # External services
│   ├── geminiService.ts          # Gemini AI (server-side)
│   └── geminiServiceClient.ts    # Gemini AI (client-side)
├── types.ts                      # TypeScript types
├── middleware.ts                 # Next.js middleware (auth)
├── .env.local                    # Environment variables
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## 🚀 Cài đặt

### Prerequisites

- **Node.js** >= 20.14.0 (khuyến nghị: v22.19.0)
- **npm** >= 10.7.0
- **MongoDB Atlas account** (hoặc local MongoDB)
- **Google Gemini API key**

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd PolicyHackathon
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Packages chính sẽ được cài đặt:

**Core:**

- `next@16.0.1` - React framework
- `react@19.0.0` - UI library
- `typescript@5.x` - Type checking

**Database & Storage:**

- `mongodb@^6.11.0` - MongoDB driver
- `mongoose@^8.8.3` - MongoDB ODM
- `pdf-parse@^2.4.5` - PDF parsing
- `pdf2json@^3.1.5` - Alternative PDF parser

**Authentication:**

- `jsonwebtoken@^9.0.2` - JWT tokens
- `bcrypt@^5.1.1` - Password hashing
- `cookie@^1.0.2` - Cookie parsing

**AI & External:**

- `@google/generative-ai@^0.21.0` - Gemini AI SDK

**File Upload:**

- `formidable@^3.5.2` - Multipart form data
- `canvas@^3.0.2` - PDF rendering support

---

## ⚙️ Cấu hình môi trường

### Tạo file `.env.local`

Tạo file `.env.local` ở root directory:

```bash
touch .env.local  # Linux/Mac
# hoặc
type nul > .env.local  # Windows
```

### Cấu hình các biến môi trường

Paste nội dung sau vào `.env.local`:

```env
# ===========================================
# GOOGLE GEMINI API
# ===========================================
# Lấy API key tại: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ===========================================
# MONGODB CONNECTION
# ===========================================
# MongoDB Atlas connection string
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/policy-hackathon?retryWrites=true&w=majority

# ===========================================
# JWT AUTHENTICATION
# ===========================================
# Secret key cho access token (15 phút expire)
# Generate với: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_random_64_char_hex_string_here

# Secret key cho refresh token (7 ngày expire)
REFRESH_TOKEN_SECRET=another_random_64_char_hex_string_here

# ===========================================
# EXTERNAL PDF PARSING (OPTIONAL)
# ===========================================
# ILovePDF API - Free tier: 1000 requests/month
# Get API key at: https://developer.ilovepdf.com/
ILOVEPDF_API_KEY=your_ilovepdf_key_here

# Adobe PDF Extract API - Free tier: 500 pages/month
# Get credentials at: https://developer.adobe.com/document-services/
ADOBE_CLIENT_ID=your_adobe_client_id_here
ADOBE_CLIENT_SECRET=your_adobe_client_secret_here
```

### Chi tiết từng biến:

#### 1. **GEMINI_API_KEY** (Required)

- **Lấy ở đâu:** https://aistudio.google.com/apikey
- **Free tier:** 60 requests/minute
- **Công dụng:** AI topic generation, scoring suggestions

#### 2. **MONGODB_URI** (Required)

- **Setup MongoDB Atlas:**
  1. Tạo account tại: https://www.mongodb.com/cloud/atlas
  2. Create free cluster (M0 - 512MB)
  3. Create database user (username + password)
  4. Add IP whitelist (0.0.0.0/0 cho development)
  5. Copy connection string
- **Format:** `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db-name>`

#### 3. **JWT_SECRET & REFRESH_TOKEN_SECRET** (Required)

- **Generate random strings:**

```bash
# Method 1: OpenSSL
openssl rand -hex 64

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- **Lưu ý:** Không commit vào Git, giữ bí mật!

#### 4. **PDF Parsing APIs** (Optional)

- **ILOVEPDF_API_KEY:** Cho PDF phức tạp (encrypted, scanned)
- **ADOBE_CLIENT_ID/SECRET:** Cho PDF chất lượng cao với OCR
- **Không bắt buộc:** App vẫn hoạt động với local PDF parsing

---

## 🏃 Chạy ứng dụng

### Development mode

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

### Build for production

```bash
npm run build
npm start
```

### Lint & Type check

```bash
npm run lint        # ESLint checking
npm run type-check  # TypeScript validation
```

---

## ✨ Tính năng

Xem chi tiết trong **[FEATURES.md](./FEATURES.md)**:

### Tính năng chính:

✅ **Authentication System**

- Register/Login với email + password
- JWT access tokens (15 phút)
- Refresh tokens (7 ngày)
- Role-based access control

✅ **AI Integration**

- Topic generation với Gemini 2.0 Flash
- Scoring suggestions với criteria breakdown
- Consistency analysis giữa judge và AI

✅ **File Management**

- Upload files to MongoDB GridFS
- PDF/TXT content extraction
- Secure download với authentication
- 10MB file size limit

✅ **Real-time Features**

- Timer countdown
- Live leaderboard updates
- Submission status tracking

✅ **Admin Dashboard**

- User management
- Team monitoring
- System overview

---

## 📜 Scripts

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database Management Scripts

```bash
# Migrate submissions to GridFS schema
node scripts/migrate-submissions.js

# Clean announcements collection
node scripts/clean-announcements.js

# Test PDF parsing for a specific file
node scripts/test-pdf-parsing.js <fileId>
```

### Utility Commands

```bash
# Generate JWT secret (64 chars hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Check Node.js version (required >= 20.16.0)
node -v

# Check npm version
npm -v

# List installed packages
npm list --depth=0

# Clean node_modules and reinstall
Remove-Item -Recurse -Force node_modules; npm install
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project vào Vercel
3. Add environment variables
4. Deploy!

**Lưu ý:**

- Set `MONGODB_URI` trong Vercel Environment Variables
- Set `JWT_SECRET` và `REFRESH_TOKEN_SECRET`
- Set `GEMINI_API_KEY`

### Docker (Optional)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📚 Tài liệu

- **[FEATURES.md](./FEATURES.md)** - Chi tiết tính năng từng role
- **[MONGODB_COLLECTIONS.md](./MONGODB_COLLECTIONS.md)** - Cấu trúc database (nếu có)
- **[PDF_PARSING_GUIDE.md](./PDF_PARSING_GUIDE.md)** - Hướng dẫn parse PDF (nếu có)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Support

Nếu gặp vấn đề:

1. Check [Issues](https://github.com/your-repo/issues)
2. Xem [FEATURES.md](./FEATURES.md) cho troubleshooting
3. Contact: your-email@example.com

---

**Made with ❤️ by Policy Hackathon Team**
