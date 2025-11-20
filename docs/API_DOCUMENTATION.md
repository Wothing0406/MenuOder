# API Documentation - MenuOrder

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

---

## 1. Authentication Endpoints

### 1.1 Register
**POST** `/auth/register`

Register a new store with user account.

**Request Body:**
```json
{
  "email": "store@example.com",
  "password": "password123",
  "storeName": "My Restaurant",
  "storePhone": "0123456789",
  "storeAddress": "123 Main St, City"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "email": "store@example.com",
      "storeName": "My Restaurant"
    },
    "store": {
      "id": 1,
      "storeSlug": "my-restaurant-1"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 Login
**POST** `/auth/login`

Login to existing store account.

**Request Body:**
```json
{
  "email": "store@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "store@example.com",
      "storeName": "My Restaurant"
    },
    "store": {
      "id": 1,
      "storeSlug": "my-restaurant-1"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.3 Get Profile
**GET** `/auth/profile` (Protected)

Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "store@example.com",
      "storeName": "My Restaurant",
      "storePhone": "0123456789",
      "storeAddress": "123 Main St, City"
    },
    "store": {
      "id": 1,
      "userId": 1,
      "storeName": "My Restaurant",
      "storeSlug": "my-restaurant-1",
      "isActive": true
    }
  }
}
```

---

## 2. Store Endpoints

### 2.1 Get Store by Slug (Public)
**GET** `/stores/slug/{slug}`

Get store details with menu and items.

**Parameters:**
- `slug` - Store slug (e.g., "my-restaurant-1")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": 1,
      "storeName": "My Restaurant",
      "storeSlug": "my-restaurant-1",
      "storePhone": "0123456789",
      "storeAddress": "123 Main St, City",
      "isActive": true
    },
    "categories": [
      {
        "id": 1,
        "storeId": 1,
        "categoryName": "Main Dishes",
        "categoryDescription": "Our best dishes",
        "displayOrder": 0,
        "items": [
          {
            "id": 1,
            "categoryId": 1,
            "storeId": 1,
            "itemName": "Pasta Carbonara",
            "itemDescription": "Classic Italian pasta",
            "itemPrice": "12.99",
            "itemImage": "/uploads/pasta.jpg",
            "isAvailable": true,
            "ItemOptions": [
              {
                "id": 1,
                "itemId": 1,
                "optionName": "Size",
                "optionType": "select",
                "optionValues": [
                  {"name": "Small", "price": 0},
                  {"name": "Large", "price": 2.00}
                ],
                "isRequired": true
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### 2.2 Get My Store (Protected)
**GET** `/stores/my-store`

Get current user's store details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "storeName": "My Restaurant",
    "storeSlug": "my-restaurant-1",
    "storePhone": "0123456789",
    "storeAddress": "123 Main St, City",
    "storeDescription": "Best food in town",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2.3 Update Store (Protected)
**PUT** `/stores/my-store`

Update store details.

**Request Body:**
```json
{
  "storeName": "My New Restaurant",
  "storePhone": "9876543210",
  "storeAddress": "456 New St, City",
  "storeDescription": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Store updated successfully",
  "data": {
    "id": 1,
    "storeName": "My New Restaurant",
    "storePhone": "9876543210",
    "storeAddress": "456 New St, City"
  }
}
```

---

## 3. Category Endpoints

### 3.1 Create Category (Protected)
**POST** `/categories`

Create a new menu category.

**Request Body:**
```json
{
  "categoryName": "Main Dishes",
  "categoryDescription": "Our best dishes"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "storeId": 1,
    "categoryName": "Main Dishes",
    "categoryDescription": "Our best dishes",
    "displayOrder": 0
  }
}
```

---

### 3.2 Get My Categories (Protected)
**GET** `/categories/my-categories`

Get all categories for current store.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "storeId": 1,
      "categoryName": "Main Dishes",
      "categoryDescription": "Our best dishes",
      "displayOrder": 0
    },
    {
      "id": 2,
      "storeId": 1,
      "categoryName": "Beverages",
      "categoryDescription": "Drinks",
      "displayOrder": 1
    }
  ]
}
```

---

### 3.3 Get Categories by Store (Public)
**GET** `/categories/store/{storeId}`

Get categories for a specific store.

**Parameters:**
- `storeId` - Store ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "storeId": 1,
      "categoryName": "Main Dishes"
    }
  ]
}
```

---

### 3.4 Update Category (Protected)
**PUT** `/categories/{categoryId}`

Update a category.

**Request Body:**
```json
{
  "categoryName": "Main Courses",
  "categoryDescription": "Updated description",
  "displayOrder": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "categoryName": "Main Courses",
    "displayOrder": 1
  }
}
```

---

### 3.5 Delete Category (Protected)
**DELETE** `/categories/{categoryId}`

Delete a category.

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 4. Item Endpoints

### 4.1 Create Item (Protected)
**POST** `/items`

Create a new menu item.

**Request Body:**
```json
{
  "categoryId": 1,
  "itemName": "Pasta Carbonara",
  "itemDescription": "Classic Italian pasta with bacon",
  "itemPrice": 12.99
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 1,
    "categoryId": 1,
    "storeId": 1,
    "itemName": "Pasta Carbonara",
    "itemDescription": "Classic Italian pasta with bacon",
    "itemPrice": "12.99",
    "isAvailable": true
  }
}
```

---

### 4.2 Get Items by Category (Public)
**GET** `/items/category/{categoryId}`

Get all items in a category.

**Parameters:**
- `categoryId` - Category ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "itemName": "Pasta Carbonara",
      "itemPrice": "12.99",
      "isAvailable": true,
      "ItemOptions": [
        {
          "id": 1,
          "optionName": "Size",
          "optionType": "select",
          "optionValues": [
            {"name": "Small", "price": 0},
            {"name": "Large", "price": 2.00}
          ]
        }
      ]
    }
  ]
}
```

---

### 4.3 Get Item Detail (Public)
**GET** `/items/{itemId}`

Get detailed information about an item.

**Parameters:**
- `itemId` - Item ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "itemName": "Pasta Carbonara",
    "itemDescription": "Classic Italian pasta",
    "itemPrice": "12.99",
    "itemImage": "/uploads/pasta.jpg",
    "isAvailable": true,
    "ItemOptions": [
      {
        "id": 1,
        "optionName": "Size",
        "optionType": "select",
        "optionValues": [
          {"name": "Small", "price": 0},
          {"name": "Large", "price": 2.00}
        ]
      }
    ]
  }
}
```

---

### 4.4 Update Item (Protected)
**PUT** `/items/{itemId}`

Update an item.

**Request Body:**
```json
{
  "itemName": "Updated Pasta",
  "itemPrice": 13.99,
  "isAvailable": true,
  "displayOrder": 0
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "id": 1,
    "itemName": "Updated Pasta",
    "itemPrice": "13.99"
  }
}
```

---

### 4.5 Delete Item (Protected)
**DELETE** `/items/{itemId}`

Delete an item.

**Response (200):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 5. Item Option Endpoints

### 5.1 Create Item Option (Protected)
**POST** `/item-options`

Add an option to an item (size, topping, etc).

**Request Body:**
```json
{
  "itemId": 1,
  "optionName": "Size",
  "optionType": "select",
  "optionValues": [
    {"name": "Small", "price": 0},
    {"name": "Medium", "price": 1.00},
    {"name": "Large", "price": 2.00}
  ],
  "isRequired": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item option created successfully",
  "data": {
    "id": 1,
    "itemId": 1,
    "optionName": "Size",
    "optionType": "select",
    "optionValues": [...],
    "isRequired": true
  }
}
```

---

### 5.2 Get Item Options (Public)
**GET** `/item-options/item/{itemId}`

Get all options for an item.

**Parameters:**
- `itemId` - Item ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "itemId": 1,
      "optionName": "Size",
      "optionType": "select",
      "optionValues": [
        {"name": "Small", "price": 0},
        {"name": "Large", "price": 2.00}
      ],
      "isRequired": true
    },
    {
      "id": 2,
      "itemId": 1,
      "optionName": "Extra Toppings",
      "optionType": "multiselect",
      "optionValues": [
        {"name": "Bacon", "price": 1.50},
        {"name": "Cheese", "price": 1.00}
      ],
      "isRequired": false
    }
  ]
}
```

---

### 5.3 Update Item Option (Protected)
**PUT** `/item-options/{optionId}`

Update an item option.

**Request Body:**
```json
{
  "optionName": "Size",
  "optionValues": [
    {"name": "Small", "price": 0},
    {"name": "Medium", "price": 1.50},
    {"name": "Large", "price": 2.50}
  ],
  "isRequired": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item option updated successfully",
  "data": {
    "id": 1,
    "optionName": "Size",
    "optionValues": [...]
  }
}
```

---

### 5.4 Delete Item Option (Protected)
**DELETE** `/item-options/{optionId}`

Delete an item option.

**Response (200):**
```json
{
  "success": true,
  "message": "Item option deleted successfully"
}
```

---

## 6. Order Endpoints

### 6.1 Create Order (Public)
**POST** `/orders`

Create a new order. No authentication required.

**Request Body:**
```json
{
  "storeId": 1,
  "customerName": "John Doe",
  "customerPhone": "0123456789",
  "customerEmail": "john@example.com",
  "customerNote": "Please no onions",
  "paymentMethod": "cash",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "selectedOptions": {
        "1": "Large",
        "2": "Bacon"
      },
      "notes": "Extra sauce"
    },
    {
      "itemId": 2,
      "quantity": 1,
      "selectedOptions": {},
      "notes": ""
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "storeId": 1,
    "orderCode": "ORD-ZRZW5R-ABC123",
    "customerName": "John Doe",
    "customerPhone": "0123456789",
    "totalAmount": "31.97",
    "status": "pending",
    "paymentMethod": "cash",
    "isPaid": false,
    "OrderItems": [
      {
        "id": 1,
        "orderId": 1,
        "itemId": 1,
        "itemName": "Pasta Carbonara",
        "itemPrice": "12.99",
        "quantity": 2,
        "selectedOptions": {"1": "Large"},
        "subtotal": "25.98"
      }
    ]
  }
}
```

---

### 6.2 Get My Store Orders (Protected)
**GET** `/orders/my-store/list`

Get all orders for current store.

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, preparing, ready, delivered, cancelled) [Optional]
- `page` - Page number (default: 1) [Optional]
- `limit` - Items per page (default: 10) [Optional]

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "storeId": 1,
        "orderCode": "ORD-ZRZW5R-ABC123",
        "customerName": "John Doe",
        "customerPhone": "0123456789",
        "totalAmount": "31.97",
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00Z",
        "OrderItems": [...]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

### 6.3 Get Order Detail (Public)
**GET** `/orders/{orderId}`

Get detailed information about an order.

**Parameters:**
- `orderId` - Order ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "storeId": 1,
    "orderCode": "ORD-ZRZW5R-ABC123",
    "customerName": "John Doe",
    "customerPhone": "0123456789",
    "customerEmail": "john@example.com",
    "customerNote": "Please no onions",
    "totalAmount": "31.97",
    "status": "pending",
    "paymentMethod": "cash",
    "isPaid": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "OrderItems": [
      {
        "id": 1,
        "itemName": "Pasta Carbonara",
        "itemPrice": "12.99",
        "quantity": 2,
        "selectedOptions": {"1": "Large"},
        "notes": "Extra sauce",
        "subtotal": "25.98"
      }
    ]
  }
}
```

---

### 6.4 Update Order Status (Protected)
**PUT** `/orders/{orderId}/status`

Update order status and payment status.

**Request Body:**
```json
{
  "status": "confirmed",
  "isPaid": false
}
```

**Status Values:** pending, confirmed, preparing, ready, delivered, cancelled

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": 1,
    "status": "confirmed",
    "isPaid": false
  }
}
```

---

### 6.5 Get Order Statistics (Protected)
**GET** `/orders/my-store/stats`

Get order statistics for current store.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "pendingOrders": 5,
    "completedOrders": 140,
    "totalRevenue": 5234.50
  }
}
```

---

## 7. QR Code Endpoints

### 7.1 Get My Store QR Code (Protected)
**GET** `/qr/my-store`

Generate QR code for current store.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "storeUrl": "http://localhost:3000/store/my-restaurant-1",
    "storeName": "My Restaurant"
  }
}
```

---

### 7.2 Generate Store QR Code (Public)
**GET** `/qr/store/{storeId}`

Generate QR code for any store.

**Parameters:**
- `storeId` - Store ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAA...",
    "storeUrl": "http://localhost:3000/store/my-restaurant-1",
    "storeName": "My Restaurant"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Store not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": {}
}
```

---

## Example Flow

1. **Store Owner Registration:**
   - POST `/auth/register` with store details
   - Receive token and store slug

2. **Add Menu:**
   - POST `/categories` to create categories
   - POST `/items` to add items
   - POST `/item-options` to add options

3. **Generate QR Code:**
   - GET `/qr/my-store` to generate QR code
   - Download and print

4. **Customer Orders:**
   - GET `/stores/slug/{slug}` to view menu
   - POST `/orders` to place order

5. **Manage Orders:**
   - GET `/orders/my-store/list` to view all orders
   - PUT `/orders/{orderId}/status` to update status

---

## Rate Limiting
No rate limiting implemented in this version. Production should include rate limiting.

## CORS
CORS is enabled for:
- `http://localhost:3000` (development)
- Configure in `.env` for production
