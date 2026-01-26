# E-Commerce API

A full-featured e-commerce REST API built with NestJS. This API provides comprehensive functionality for managing an online store, including product management, shopping cart operations, order processing, and secure payment integration with Stripe.

## Features

- **Authentication & Authorization**: JWT-based authentication system with role-based access control
- **Admin Panel**: Complete administrative control over products, orders, and store management
- **Product Management**: CRUD operations for products with image upload via Cloudinary
- **Shopping Cart**: Full cart functionality for adding, updating, and removing items
- **Categories**: Organize products into categories for better navigation
- **Coupons**: Discount code system for promotional campaigns
- **Orders**: Complete order management from creation to fulfillment
- **Payment Processing**: Secure payment integration with Stripe (test mode)
- **Image Hosting**: Cloudinary integration for product image storage

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB
- **Containerization**: Docker
- **Image Storage**: Cloudinary
- **Payment Gateway**: Stripe (Test Mode)
- **Authentication**: JWT (JSON Web Tokens)

## Stripe Test Mode

This API uses Stripe in test mode. Use the following test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

Use any future expiration date, any 3-digit CVC, and any postal code.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET_KEY=your_jwt_secret_key_here

# Mail
GMAIL_EMAIL=
GMAIL_APP_PASSWORD=
TEMPLATE_BASE_PATH=

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_FOLDER_NAME=folder_name_contain_images
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYMENT_SUCCESS_URL=
PAYMENT_FAIL_URL=
```
## Project Structure

```
ecommerce-api/
├── src/
│   ├── common/                 # Shared utilities, and decorators
│   ├── modules/
│   │   ├── admin/              # Admin management and dashboard
│   │   ├── auth/               # Authentication & JWT
│   │   ├── carts/              # Shopping cart operations
│   │   ├── categories/         # Product categories
│   │   ├── cloudinary/         # Image upload service
│   │   ├── coupons/            # Discount coupons
│   │   ├── mail/               # Email service
│   │   ├── orders/             # Order management
│   │   ├── products/           # Product CRUD
│   │   ├── stripe/             # Payment processing
│   │   ├── sub-categories/     # Sub-category management
│   │   └── users/              # User management
│   ├── app.module.ts           # Root application module
│   └── main.ts                 # Application entry point
├── templates/                  # Email and Success/Fail payment templates
├── .env                        # Environment variables
└── docker-compose.yml          # Docker setup
```
---
⭐ If you found this project helpful, please consider giving it a star!