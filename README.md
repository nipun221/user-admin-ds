# Project Documentation: User Admin System

## Overview

The User Admin System is a RESTful API built with Node.js, Express, and MongoDB. It provides functionality for user and admin registration, login, profile management, and admin operations.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
    - [User Registration](#user-registration)
    - [User Login](#user-login)
    - [Protected Routes](#protected-routes)
    - [Admin Registration](#admin-registration)
    - [Admin Login](#admin-login)
    - [Admin Operations](#admin-operations)
4. [API Endpoints](#api-endpoints)
5. [Middleware](#middleware)
6. [Error Handling](#error-handling)
7. [Security](#security)
8. [Contributing](#contributing)
9. [License](#license)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/nipun221/user-admin-ds.git
    ```

2. Install dependencies:

    ```bash
    cd user-admin-ds
    npm install
    ```

## Configuration

1. Create a `.env` file in the project root:

    ```plaintext
    ATLAS_STRING=your_mongodb_atlas_connection_string
    JWT_SECRET_KEY=your_jwt_secret_key
    JWT_SECRET_KEY_ADMIN=your_admin_jwt_secret_key
    PORT=3001
    ```

    Replace the placeholder values with your actual MongoDB Atlas connection string and JWT secret keys.

## Usage

### User Registration

- **Endpoint:** `POST /user/register`
- **Request Body:**

    ```json
    {
        "email": "user@example.com",
        "phone": "1234567890",
        "name": "John Doe",
        "password": "password123",
        "profileImage": "url_to_image"
    }
    ```

- **Response:**

    ```json
    {
        "message": "User registered successfully"
    }
    ```

### User Login

- **Endpoint:** `POST /user/login`
- **Request Body:**

    ```json
    {
        "email": "user@example.com",
        "phone": "1234567890",
        "password": "password123"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Login successful",
        "name": "John Doe",
        "email": "user@example.com",
        "phone": "1234567890",
        "token": "user_jwt_token"
    }
    ```

### Protected Routes

- **Protected Route:** `GET /protected`
- **Request Header:**

    ```plaintext
    Authorization: Bearer user_jwt_token
    ```

- **Response:**

    ```json
    {
        "message": "Protected route"
    }
    ```

### Admin Registration

- **Endpoint:** `POST /admin/register`
- **Request Body:**

    ```json
    {
        "email": "admin@example.com",
        "phone": "9876543210",
        "name": "Admin User",
        "password": "adminpassword",
        "profileImage": "url_to_image"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Admin registered successfully"
    }
    ```

### Admin Login

- **Endpoint:** `POST /admin/login`
- **Request Body:**

    ```json
    {
        "email": "admin@example.com",
        "phone": "9876543210",
        "password": "adminpassword"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Login successful",
        "name": "Admin User",
        "email": "admin@example.com",
        "phone": "9876543210",
        "isAdmin": true,
        "token": "admin_jwt_token"
    }
    ```

### Admin Operations

- **Get All Users (Admin):** `GET /allUsers`
- **Get User by ID (Admin):** `GET /user/:id`
- **Update User by ID (Admin):** `PUT /user/:id`
- **Delete User by ID (Admin):** `DELETE /user/:id`

## API Endpoints

- **User Registration:** `POST /user/register`
- **User Login:** `POST /user/login`
- **Protected Route:** `GET /protected`
- **Get User:** `GET /user`
- **Update User:** `PUT /user`
- **Delete User:** `DELETE /user`
- **Admin Registration:** `POST /admin/register`
- **Admin Login:** `POST /admin/login`
- **Get All Users (Admin):** `GET /allUsers`
- **Get User by ID (Admin):** `GET /user/:id`
- **Update User by ID (Admin):** `PUT /user/:id`
- **Delete User by ID (Admin):** `DELETE /user/:id`

## Middleware

- `authenticateToken`: Middleware to authenticate JWT token for regular users.
- `authenticateTokenAdmin`: Middleware to authenticate JWT token for admin users.

## Error Handling

- 400 Bad Request: Invalid request or validation errors.
- 401 Unauthorized: Token not provided or invalid credentials.
- 403 Forbidden: Access denied.
- 404 Not Found: Resource not found.
- 500 Internal Server Error: Unexpected server error.

## Security

- Passwords are hashed using bcrypt before storing in the database.
- JWT tokens are used for authentication and authorization.
- Express-validator is used for request data validation.
- CORS is configured to allow cross-origin requests from specified origins.

##

 Contributing

Feel free to contribute to this project by creating issues or pull requests. Follow the [contributing guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).

---

This is a basic template, and you may need to customize it based on your specific project structure, features, and documentation needs.
