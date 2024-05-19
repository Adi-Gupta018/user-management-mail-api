
### Models Documentation

#### 1. User Model
The User model represents a user entity in the system.

**Fields**:
- **`name`**: The name of the user (String, required).
- **`email`**: The email of the user (String, required).
- **`list`**: A reference to the List model indicating the list to which the user belongs (ObjectId, required).
- **`customProperties`**: An array of references to the UserCustomProperty model representing custom properties associated with the user (Array of ObjectIds).

**Indexes**:
- A composite index on `email` and `list` to ensure a unique combination of email and list.

#### 2. List Model
The List model represents a collection or group of users.

**Fields**:
- **`title`**: The title of the list (String, required).
- **`customProperties`**: An array of references to the CustomPropertyList model representing custom properties associated with the list (Array of ObjectIds).

#### 3. CustomPropertyList Model
The CustomPropertyList model represents a custom property associated with a list.

**Fields**:
- **`title`**: The title of the custom property (String, required).
- **`list_id`**: A reference to the List model indicating the list to which the custom property belongs (ObjectId, required).
- **`defaultValue`**: The default value of the custom property (String).

**Indexes**:
- A composite index on `title` and `list_id` to ensure a unique combination of title and list ID.

#### 4. UserCustomProperty Model
The UserCustomProperty model represents a custom property value associated with a specific user.

**Fields**:
- **`user_id`**: A reference to the User model indicating the user to which this custom property value belongs (ObjectId, required).
- **`custom_property_list_id`**: A reference to the CustomPropertyList model indicating the custom property definition (ObjectId, required).
- **`value`**: The value of the custom property (String).

**Indexes**:
- Ensures a unique combination of `user_id` and `custom_property_list_id`.

### API Documentation:
https://documenter.getpostman.com/view/26807996/2sA3QmCuPK

### Controllers Documentation

#### List Controllers

**`listInsertion`**
- **Description**: Inserts a new list along with its custom properties.
- **Route**: `POST /list`
- **Request Body**:
  ```json
  {
    "title": "test",
    "customProperties": [
      {
        "title": "city",
        "defaultValue": "Jhansi"
      }
    ]
  }
  ```
- **Response**:
  - `201 Created`: `{ message: 'List created successfully!', list: newList }`
  - `500 Internal Server Error`: `{ message: 'Error creating list' }`
- **Example**:
  ```json
  {
    "message": "List created successfully!",
    "list": {
      "_id": "609b9b2c2f8fb814c89f1234",
      "title": "test",
      "customProperties": ["609b9b2c2f8fb814c89f5678"]
    }
  }
  ```

**`fetchList`**
- **Description**: Fetches all lists or a specific list by ID.
- **Route**: `GET /list` or `GET /list/:list_id`
- **Response**:
  - `200 OK`: Array of lists or a single list object.
  - `404 Not Found`: `{ message: 'There are no lists' }` or `{ message: 'List is not present' }`
  - `500 Internal Server Error`: `{ message: error }`
- **Example**:
  ```json
  [
    {
      "_id": "609b9b2c2f8fb814c89f1234",
      "title": "test",
      "customProperties": [
        {
          "_id": "609b9b2c2f8fb814c89f5678",
          "title": "city",
          "list_id": "609b9b2c2f8fb814c89f1234",
          "defaultValue": "Jhansi"
        }
      ]
    }
  ]
  ```

#### User Controllers

**`uploadCSV`**
- **Description**: Uploads a CSV file to add users to a specific list.
- **Route**: `POST /upload/:list_id`
- **Request**: Form-data with a file field named 'file'.
- **Response**:
  - `201 Created`: `{ message: 'CSV data uploaded successfully!', successfulUsers, failedUsers, totalUsers }`
  - `400 Bad Request`: Various error messages for missing or invalid data.
  - `500 Internal Server Error`: `{ message: 'Internal server error' }`
- **Example**:
  ```json
  {
    "message": "CSV data uploaded successfully!",
    "successfulUsers": 5,
    "failedUsers": 0,
    "totalUsers": 5
  }
  ```

**`fetchUser`**
- **Description**: Fetches all users or a specific user by ID.
- **Route**: `GET /user` or `GET /user/:user_id`
- **Response**:
  - `200 OK`: Array of users or a single user object.
  - `404 Not Found`: `{ message: 'Users list is empty' }` or `{ message: 'User not found' }`
  - `500 Internal Server Error`: `{ message: error }`
- **Example**:
  ```json
  [
    {
      "_id": "609b9b2c2f8fb814c89f1234",
      "name": "John Doe",
      "email": "john@example.com",
      "list": "609b9b2c2f8fb814c89f5678",
      "customProperties": [
        {
          "_id": "609b9b2c2f8fb814c89f6789",
          "user_id": "609b9b2c2f8fb814c89f1234",
          "custom_property_list_id": "609b9b2c2f8fb814c89f8901",
          "value": "Value"
        }
      ]
    }
  ]
  ```

**`fetchListUsers`**
- **Description**: Fetches all users in a specific list.
- **Route**: `GET /userlist/:list_id`
- **Response**:
  - `200 OK`: Array of users.
  - `400 Bad Request`: `{ message: 'Required parameter missing: listId' }`
  - `404 Not Found`: `{ message: 'List is empty' }`
  - `500 Internal Server Error`: `{ message: 'Error fetching users' }`
- **Example**:
  ```json
  [
    {
      "_id": "609b9b2c2f8fb814c89f1234",
      "name": "John Doe",
      "email": "john@example.com",
      "list": "609b9b2c2f8fb814c89f5678",
      "customProperties": [
        {
          "_id": "609b9b2c2f8fb814c89f6789",
          "user_id": "609b9b2c2f8fb814c89f1234",
          "custom_property_list_id": "609b9b2c2f8fb814c89f8901",
          "value": "Value"
        }
      ]
    }
  ]
  ```

#### Mail Controller

**`sendEmailToList`**
- **Description**: Sends an email to all users in a specific list.
- **Route**: `POST /sendmail/:list_id`
- **Request Body**:
  ```json
  {
    "subject": "Email Subject",
    "content": "<p>Email Content</p>"
  }
  ```
- **Response**:
  - `200 OK`: `{ message: 'Emails sent successfully', emailsSent, failedEmails, errors }`
  - `400 Bad Request`: `{ message: 'Missing required fields: listId, subject, or content' }` or `{ message: 'List is empty' }`
  - `500 Internal Server Error`: `{ message: error }`
- **Example**:
  ```json
  {
    "message": "10 emails sent successfully, 2 failed",
    "emailsSent": ["user1@example.com", "user2@example.com"],
    "failedEmails": ["user3@example.com", "user4@example.com"],
    "errors": ["Error sending email to user3@example.com", "Error sending email to user4@example.com"]
  }
  ```

This documentation outlines the endpoints, request and response formats, and example responses for the list, user, and mail controllers. It provides a comprehensive guide for interacting with the API for managing lists, users, and sending emails.
