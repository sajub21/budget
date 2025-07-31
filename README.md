# 💼 LOFT - Reseller Business Tracker

*"Track smart. Sell faster."*

## 🚀 Overview

LOFT is a comprehensive reseller business tracker designed to help entrepreneurs manage their inventory, track expenses, monitor sales, and analyze profits across platforms like Vinted and Depop.

## ✨ Features

### Core Features
- 📦 **Inventory Management** - Add products manually or via barcode scanning
- 💰 **Expense Tracking** - Log all business expenses with category breakdown
- 📈 **Sales Tracking** - Sync with Vinted/Depop or manual entry
- 💹 **Profit Dashboard** - Real-time analytics and insights

### Advanced Features
- 🤖 **Smart Price Recommendations** - AI-powered pricing suggestions
- 👥 **Multi-User Support** - Team collaboration with role-based access
- 📊 **CSV Export/Import** - Data portability
- 🔔 **Smart Notifications** - Inventory alerts and goal tracking
- 🎤 **Voice Notes** - Speak to create items
- 📸 **Receipt Scanning** - Image-to-expense conversion

## 🎨 Design System

- **Colors**: 
  - Background: #F7F9FA (off-white)
  - Primary: #24292F (charcoal black)
  - Accent: #63D2FF (soft blue), #4ECDC4 (mint green)
- **Typography**: Inter SemiBold (headers), Manrope Regular (body)
- **Style**: Clean iOS aesthetic with glassmorphism panels

## 🏗️ Architecture

```
/
├── backend/          # Node.js API server
├── mobile/           # React Native app
├── shared/           # Shared utilities and types
└── docs/            # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- MongoDB
- iOS Simulator / Android Emulator

### Installation

1. Clone the repository
```bash
git clone https://github.com/sajub21/budget.git
cd budget
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install mobile dependencies
```bash
cd ../mobile
npm install
```

4. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Mobile
cd mobile
npm run ios  # or npm run android
```

## 💰 Pricing Tiers

- **Free Tier**: Up to 100 items, manual sales tracking
- **Pro Tier** (£7.99/month): Unlimited items, API integrations, advanced analytics

## 🛠️ Tech Stack

- **Frontend**: React Native, TypeScript, React Navigation
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT
- **Payments**: Stripe
- **Image Storage**: Cloudinary
- **Push Notifications**: Firebase Cloud Messaging

## 📱 Supported Platforms

- iOS 12+
- Android 8+ (API level 26)

## 🤝 Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
