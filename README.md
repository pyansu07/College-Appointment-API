
# College Appointment System API

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
   - [User Authentication](#user-authentication)
     - [Register User](#register-user)
     - [Login User](#login-user)
   - [Appointment Management](#appointment-management)
     - [Create Availability (Professor)](#create-availability-professor)
     - [View Available Time Slots (Student)](#view-available-time-slots-student)
     - [Book Appointment (Student)](#book-appointment-student)
     - [Check My Appointments (Student)](#check-my-appointments-student)
     - [Cancel Appointment (Professor)](#cancel-appointment-professor)
5. [Error Handling](#error-handling)
6. [Example Usage](#example-usage)
7. [Conclusion](#conclusion)

## Overview

The College Appointment System API allows students to book appointments with professors. It provides functionalities for user registration, authentication, appointment management, and viewing available time slots. The API is built using Node.js, Express, and MongoDB.

## Base URL
`http://localhost:3000/api`


## Authentication

The API uses JSON Web Tokens (JWT) for authentication. After a user registers or logs in, they receive a token that must be included in the `Authorization` header for protected routes.

### Example of Authorization Header

To access protected routes, include the token in the `Authorization` header as follows:
`Authorization: Bearer <token>`

## Endpoints

### 1. User Authentication

#### Register User

- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Description**: Registers a new user (either a student or a professor).
- **Request Body**:
    ```json
    {
        "name": "User Name",
        "email": "user@example.com",
        "password": "password123",
        "role": "student" // or "professor"
    }
    ```
- **Response**:
    - **Success (201)**:
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR...",
        "userId": "60d5f484f1a2c8b1f8e4e1a0"
    }
    ```
    - **Error (400)**:
    ```json
    {
        "message": "User already exists"
    }
    ```

#### Login User

- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```
- **Response**:
    - **Success (200)**:
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR...",
        "userId": "60d5f484f1a2c8b1f8e4e1a0"
    }
    ```
    - **Error (401)**:
    ```json
    {
        "message": "Invalid credentials"
    }
    ```

### 2. Appointment Management

#### Create Availability (Professor)

- **Endpoint**: `/professor/availability`
- **Method**: `POST`
- **Description**: Allows professors to specify their available time slots for appointments.
- **Headers**: 
    - `Authorization: Bearer <professor_token>`
- **Request Body**:
    ```json
    {
        "startTime": "2024-12-20T10:00:00Z",
        "endTime": "2024-12-20T11:00:00Z"
    }
    ```
- **Response**:
    - **Success (201)**:
    ```json
    {
        "_id": "60d5f484f1a2c8b1f8e4e1a2",
        "professor": "60d5f484f1a2c8b1f8e4e1a1",
        "student": null,
        "startTime": "2024-12-20T10:00:00Z",
        "endTime": "2024-12-20T11:00:00Z",
        "status": "available"
    }
    ```

#### View Available Time Slots (Student)

- **Endpoint**: `/student/appointments/available`
- **Method**: `GET`
- **Description**: Allows students to view available appointment slots for a specific professor.
- **Headers**: 
    - `Authorization: Bearer <student_token>`
- **Query Parameters**:
    - `professorId`: The ID of the professor whose slots are being queried.
- **Response**:
    - **Success (200)**:
    ```json
    [
        {
            "_id": "60d5f484f1a2c8b1f8e4e1a2",
            "professor": "60d5f484f1a2c8b1f8e4e1a1",
            "student": null,
            "startTime": "2024-12-20T10:00:00Z",
            "endTime": "2024-12-20T11:00:00Z",
            "status": "available"
        }
    ]
    ```

#### Book Appointment (Student)

- **Endpoint**: `/student/appointments/:id/book`
- **Method**: `POST`
- **Description**: Allows students to book an available appointment.
- **Headers**: 
    - `Authorization: Bearer <student_token>`
- **URL Parameters**:
    - `id`: The ID of the appointment to book.
- **Response**:
    - **Success (200)**:
    ```json
    {
        "_id": "60d5f484f1a2c8b1f8e4e1a2",
        "professor": "60d5f484f1a2c8b1f8e4e1a1",
        "student": "60d5f484f1a2c8b1f8e4e1a0",
        "startTime": "2024-12-20T10:00:00Z",
        "endTime": "2024-12-20T11:00:00Z",
        "status": "booked"
    }
    ```
    - **Error (404)**:
    ```json
    {
        "message": "Appointment not found"
    }
    ```

#### Check My Appointments (Student)

- **Endpoint**: `/student/appointments/my`
- **Method**: `GET`
- **Description**: Allows students to check their booked appointments.
- **Headers**: 
    - `Authorization: Bearer <student_token>`
- **Response**:
    - **Success (200)**:
    ```json
    [
        {
            "_id": "60d5f484f1a2c8b1f8e4e1a2",
            "professor": "60d5f484f1a2c8b1f8e4e1a1",
            "student": "60d5f484f1a2c8b1f8e4e1a0",
            "startTime": "2024-12-20T10:00:00Z",
            "endTime": "2024-12-20T11:00:00Z",
            "status": "booked"
        }
    ]
    ```

#### Cancel Appointment (Professor)

- **Endpoint**: `/professor/appointments/:id/cancel`
- **Method**: `PUT`
- **Description**: Allows professors to cancel a booked appointment.
- **Headers**: 
    - `Authorization: Bearer <professor_token>`
- **URL Parameters**:
    - `id`: The ID of the appointment to cancel.
- **Response**:
    - **Success (200)**:
    ```json
    {
        "_id": "60d5f484f1a2c8b1f8e4e1a2",
        "status": "cancelled"
    }
    ```
    - **Error (404)**:
    ```json
    {
        "message": "Appointment not found"
    }
    ```

## Error Handling

The API returns appropriate HTTP status codes and error messages for various scenarios:

- **400 Bad Request**: Indicates that the request was invalid (e.g., missing required fields).
- **401 Unauthorized**: Indicates that authentication failed (e.g., invalid credentials or missing token).
- **404 Not Found**: Indicates that the requested resource was not found (e.g., appointment not found).
- **500 Internal Server Error**: Indicates a server error (e.g., database connection issues).

### Common Error Responses

- **Invalid Input**:
    ```json
    {
        "message": "Invalid input data"
    }
    ```

- **Access Denied**:
    ```json
    {
        "message": "Access denied. No token provided."
    }
    ```
## Example Usage

Refer here : 

## Conclusion

This documentation provides a comprehensive overview of the College Appointment System API, including its endpoints, request/response formats, error handling, and example usage. The API is designed to facilitate the booking of appointments between students and professors while ensuring secure access through authentication.

This API is intended to be user-friendly and efficient, making it easy for students and professors to manage their appointments effectively.
