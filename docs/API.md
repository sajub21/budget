# LOFT API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.loft-reseller.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "My Store",
  "currency": "GBP"
}
```

#### GET /auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Dashboard

#### GET /dashboard
Get dashboard overview data.

**Query Parameters:**
- `period` (optional): week, month, quarter, year
- `currency` (optional): GBP, USD, EUR

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { ... },
    "metrics": { ... },
    "charts": { ... },
    "insights": { ... }
  }
}
```

#### GET /dashboard/alerts
Get important alerts and notifications.

### Inventory

#### GET /inventory
Get user's inventory with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `status` (optional): active, low_stock, out_of_stock, archived
- `brand` (optional): Filter by brand
- `search` (optional): Search term

#### POST /inventory
Add a new product to inventory.

**Request Body:**
```json
{
  "name": "Product Name",
  "brand": "Brand Name",
  "category": "Clothing",
  "condition": "New with tags",
  "size": "M",
  "pricing": {
    "purchasePrice": 25.00,
    "listingPrice": 45.00
  },
  "inventory": {
    "quantity": 1,
    "restockThreshold": 1
  }
}
```

#### GET /inventory/:id
Get a specific product by ID.

#### PUT /inventory/:id
Update a product.

#### DELETE /inventory/:id
Archive a product (soft delete).

### Sales

#### GET /sales
Get user's sales with pagination and filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `platform`: vinted, depop, ebay, etc.
- `status`: pending, paid, shipped, delivered, completed
- `startDate`, `endDate`: Date range filter
- `product`: Filter by product ID

#### POST /sales
Record a new sale.

**Request Body:**
```json
{
  "product": "product_id",
  "quantity": 1,
  "salePrice": 45.00,
  "platform": "vinted",
  "fees": {
    "platformFee": 2.25,
    "paymentFee": 1.00
  }
}
```

### Expenses

#### GET /expenses
Get user's expenses with pagination and filtering.

#### POST /expenses
Add a new expense.

**Request Body:**
```json
{
  "amount": 25.00,
  "category": "Product Cost",
  "description": "Purchase from supplier",
  "date": "2023-12-01",
  "product": "product_id"
}
```

### Users

#### PUT /users/profile
Update user profile.

#### PUT /users/preferences
Update user preferences.

### Subscriptions

#### GET /subscriptions/plans
Get available subscription plans.

#### GET /subscriptions/status
Get current subscription status.

#### POST /subscriptions/create-checkout
Create Stripe checkout session for Pro subscription.

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Pagination

Paginated endpoints return data in this format:
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```
