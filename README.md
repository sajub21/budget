# DiCalen - AI-Powered Calendar App

A production-ready, intelligent calendar application built with Next.js, featuring AI-powered scheduling, PWA support, and seamless integrations.

## 🚀 Features

- **AI-Powered Scheduling**: Natural language processing for effortless event creation
- **Multi-View Calendar**: Day, week, month, and agenda views
- **Smart Notifications**: Email, push, and SMS reminders with Resend
- **PWA Ready**: Installable on iOS, Android, and desktop
- **Secure Authentication**: Multiple OAuth providers with Better Auth
- **File Attachments**: Image and video support with Cloudflare
- **Stripe Integration**: Subscription management and billing
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Dark/Light Mode**: System-aware theme switching

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with OAuth support
- **AI**: OpenAI GPT-4 for intelligent scheduling
- **Payments**: Stripe for subscription management
- **Email**: Resend for transactional emails
- **Storage**: Cloudflare Images for media
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Environment variables (see `.env.example`)

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd dicalen
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

3. **Set up database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dicalen"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id" 
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenAI for AI features
OPENAI_API_KEY="your-openai-api-key"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend for emails
RESEND_API_KEY="re_..."

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"
CLOUDFLARE_IMAGES_HASH="your-images-hash"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📱 PWA Installation

DiCalen is a Progressive Web App that can be installed on any device:

- **Desktop**: Click the install button in your browser's address bar
- **iOS**: Add to Home Screen from Safari
- **Android**: Use "Add to Home Screen" from Chrome menu

## 🔐 Authentication

Supports multiple authentication methods:
- Email/Password with verification
- Google OAuth
- GitHub OAuth
- Apple OAuth (when configured)

## 💳 Subscription Plans

- **Free**: 10 calendars, basic AI, email reminders
- **Pro ($9.99/month)**: Unlimited calendars, advanced AI, file attachments, priority support

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible components:
- Buttons, Cards, Inputs, Dialogs
- Calendar components with drag & drop
- Dark/light mode support
- Mobile-responsive design

## 📊 Database Schema

PostgreSQL schema with Prisma ORM:
- Users with authentication data
- Calendars with custom colors
- Events with recurrence support
- Files for attachments
- Subscriptions for billing
- Notifications for reminders

## 🤖 AI Features

OpenAI integration for:
- Natural language event creation
- Optimal time suggestions
- Schedule summarization
- Smart conflict detection

## 📧 Email Integration

Resend integration for:
- Event reminders
- Daily schedule summaries
- Account notifications
- Subscription updates

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## 🛣 API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/events` - Event CRUD operations
- `/api/calendars` - Calendar management
- `/api/ai/parse` - AI text parsing
- `/api/stripe/*` - Payment handling

## 🧪 Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create migrations
npm run db:studio    # Open Prisma Studio

# Build for production
npm run build
```

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Main app interface
│   │   └── ...
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state management
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── public/                # Static assets
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Documentation: [docs.dicalen.com](https://docs.dicalen.com)
- Support: [support@dicalen.com](mailto:support@dicalen.com)
- Issues: GitHub Issues

---

**DiCalen** - Transform your scheduling with AI-powered intelligence.
