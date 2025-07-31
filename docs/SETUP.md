# LOFT Setup Guide

## Prerequisites

Before running the LOFT Reseller Tracker app, ensure you have the following installed:

### Backend Requirements
- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### Mobile App Requirements
- React Native development environment
- Xcode (for iOS development)
- Android Studio (for Android development)

## Environment Setup

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/loft_reseller_tracker

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

5. Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### 2. Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. For iOS (macOS only):
```bash
cd ios && pod install && cd ..
```

4. Start Metro bundler:
```bash
npm start
```

5. Run on iOS:
```bash
npm run ios
```

6. Run on Android:
```bash
npm run android
```

## Database Setup

1. Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB instance.

2. The application will automatically create the necessary collections when you start using it.

## External Services Configuration

### Cloudinary (Image Storage)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Update the `.env` file with these values

### Stripe (Payments)
1. Sign up at [stripe.com](https://stripe.com)
2. Get your secret key from the dashboard
3. Set up webhooks for subscription management
4. Update the `.env` file with your keys

### Platform APIs (Optional)
- **Vinted API**: Currently not publicly available
- **Depop API**: Contact Depop for API access

## Development

### Backend Development
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Check code style

### Mobile Development
- `npm start` - Start Metro bundler
- `npm run ios` - Run iOS app
- `npm run android` - Run Android app
- `npm run type-check` - Check TypeScript types

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**:
```bash
npx react-native start --reset-cache
```

2. **iOS build issues**:
```bash
cd ios && pod install && cd ..
```

3. **Android build issues**:
```bash
cd android && ./gradlew clean && cd ..
```

4. **Database connection issues**:
- Ensure MongoDB is running
- Check the connection string in `.env`

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Configure proper security headers
4. Set up HTTPS
5. Configure proper CORS origins

### Mobile App
1. Build release versions:
   - iOS: Build in Xcode with Release configuration
   - Android: `cd android && ./gradlew assembleRelease`
2. Submit to app stores following their guidelines

## Support

For development support, check:
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

For app-specific issues, create an issue in the repository.
