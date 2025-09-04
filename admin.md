# Admin API Documentation

## Authentication

### POST `/api/admin/login`
**Request Body:**
```json
{
  "phone_number": "+998990330919",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid admin credentials"
}
```

**Error Response (404):**
```json
{
  "detail": "Admin user not found in database. Please register via Telegram first."
}
```

---

## Statistics

### GET `/api/admin/stats`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "total_users": 150,
  "total_modules": 5,
  "total_lessons": 20,
  "total_packs": 80,
  "total_words": 500,
  "total_grammar_questions": 300,
  "total_translations": 1200,
  "active_users_last_7_days": 45
}
```

**Error Response (403):**
```json
{
  "detail": "Admin access required"
}
```

---

## User Management

### GET `/api/admin/users`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "telegram_id": 123456789,
      "phone_number": "+998901234567",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "/storage/user_photos/998901234567.jpg",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-02T15:30:00Z"
    }
  ]
}
```

---

## Grammar Topics Management

### POST `/api/grammar-topics/topics`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "pack_id": 2,
  "video_url": "https://youtube.com/watch?v=abc123",
  "markdown_text": "# Grammar Rules\n\nThis pack covers present tense..."
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "pack_id": 2,
  "video_url": "https://youtube.com/watch?v=abc123",
  "markdown_text": "# Grammar Rules\n\nThis pack covers present tense...",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Response (400):**
```json
{
  "detail": "Pack is not a grammar pack"
}
```

**Error Response (400):**
```json
{
  "detail": "Grammar topic already exists for this pack"
}
```

### PUT `/api/grammar-topics/topics/{topic_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "video_url": "https://youtube.com/watch?v=xyz789",
  "markdown_text": "# Updated Grammar Rules\n\nRevised content..."
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "pack_id": 2,
  "video_url": "https://youtube.com/watch?v=xyz789",
  "markdown_text": "# Updated Grammar Rules\n\nRevised content...",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

### DELETE `/api/grammar-topics/topics/{topic_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Grammar topic deleted successfully"
}
```

**Error Response (404):**
```json
{
  "detail": "Grammar topic not found"
}
```

---

## Education Management

### Modules

#### POST `/api/education/modules`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "title": "Beginner Module",
  "order": 1
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "title": "Beginner Module",
  "order": 1,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### PUT `/api/education/modules/{module_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "title": "Updated Module Name",
  "order": 2
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Updated Module Name",
  "order": 2,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

#### DELETE `/api/education/modules/{module_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Module deleted successfully"
}
```

**Error Response (404):**
```json
{
  "detail": "Module not found"
}
```

### Lessons

#### POST `/api/education/lessons`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "title": "Basic Greetings",
  "description": "Learn basic greeting phrases",
  "module_id": 1,
  "order": 1
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "title": "Basic Greetings",
  "description": "Learn basic greeting phrases",
  "module_id": 1,
  "order": 1,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### PUT `/api/education/lessons/{lesson_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "title": "Advanced Greetings",
  "description": "Learn advanced greeting phrases"
}
```

#### DELETE `/api/education/lessons/{lesson_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Lesson deleted successfully"
}
```

### Packs

#### POST `/api/education/packs`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "title": "Greeting Words",
  "lesson_id": 1,
  "type": "word",
  "word_count": 10
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "title": "Greeting Words",
  "lesson_id": 1,
  "type": "word",
  "word_count": 10,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### PUT `/api/education/packs/{pack_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "title": "Updated Pack Name",
  "word_count": 15
}
```

#### DELETE `/api/education/packs/{pack_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Pack deleted successfully"
}
```

---

## Quiz Management

### Words

#### POST `/api/quiz/words`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "pack_id": 1,
  "audio_url": "/storage/word_audio/1.mp3",
  "ru_text": "Привет",
  "uz_text": "Salom"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "pack_id": 1,
  "audio_url": "/storage/word_audio/1.mp3",
  "ru_text": "Привет",
  "uz_text": "Salom",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Response (400):**
```json
{
  "detail": "Pack is not a word pack"
}
```

#### PUT `/api/quiz/words/{word_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "ru_text": "Здравствуйте",
  "uz_text": "Assalomu alaykum"
}
```

#### DELETE `/api/quiz/words/{word_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Word deleted successfully"
}
```

#### POST `/api/quiz/words/{word_id}/audio`
**Headers:** `Authorization: Bearer {access_token}`
**Content-Type:** `multipart/form-data`
**Request Body:** File upload (max 1MB, MP3/WAV/OGG/M4A)

**Success Response (200):**
```json
{
  "id": 1,
  "pack_id": 1,
  "audio_url": "/storage/word_audio/1.mp3",
  "ru_text": "Привет",
  "uz_text": "Salom",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

**Error Response (413):**
```json
{
  "detail": "Audio size must be less than 1MB"
}
```

### Grammar

#### POST `/api/quiz/grammars`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body (Fill Type):**
```json
{
  "pack_id": 2,
  "type": "fill",
  "question_text": "I ___ a student.",
  "options": ["am", "is", "are", "be"],
  "correct_option": 0
}
```

**Request Body (Build Type):**
```json
{
  "pack_id": 2,
  "type": "build",
  "sentence": "I am learning English"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "pack_id": 2,
  "type": "fill",
  "question_text": "I ___ a student.",
  "options": ["am", "is", "are", "be"],
  "correct_option": 0,
  "sentence": null,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Response (400):**
```json
{
  "detail": "Fill type requires question_text, options, and correct_option"
}
```

#### PUT `/api/quiz/grammars/{grammar_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "question_text": "She ___ a teacher.",
  "options": ["am", "is", "are", "be"],
  "correct_option": 1
}
```

#### DELETE `/api/quiz/grammars/{grammar_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Grammar deleted successfully"
}
```

---

## Subscription Management

### POST `/api/subscription/admin/payment`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "user_id": 1,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-02-01T00:00:00Z",
  "amount": 29.99,
  "currency": "USD",
  "notes": "Monthly subscription"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-02-01T00:00:00Z",
  "amount": 29.99,
  "currency": "USD",
  "is_active": true,
  "created_by_admin_id": 5,
  "notes": "Monthly subscription",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Response (404):**
```json
{
  "detail": "User not found"
}
```

### GET `/api/subscription/admin/payment`
**Headers:** `Authorization: Bearer {access_token}`
**Query Parameters:**
- `skip` (optional): Number to skip (default: 0)
- `limit` (optional): Number to return (default: 50)
- `user_id` (optional): Filter by user ID
- `active_only` (optional): Only active subscriptions (default: false)

**Success Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-02-01T00:00:00Z",
    "amount": 29.99,
    "currency": "USD",
    "is_active": true,
    "created_by_admin_id": 5,
    "notes": "Monthly subscription",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

### PUT `/api/subscription/admin/payment/{subscription_id}`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "end_date": "2024-03-01T00:00:00Z",
  "notes": "Extended subscription"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-03-01T00:00:00Z",
  "amount": 29.99,
  "currency": "USD",
  "is_active": true,
  "created_by_admin_id": 5,
  "notes": "Extended subscription",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

### DELETE `/api/subscription/admin/payment/{subscription_id}`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "message": "Subscription deleted successfully"
}
```

### GET `/api/subscription/admin/payment/stats`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "total_revenue": 1500.00,
  "monthly_revenue": 299.99,
  "yearly_revenue": 1200.00,
  "active_subscriptions": 25,
  "total_paid_subscriptions": 50,
  "average_subscription_value": 30.00,
  "revenue_by_month": [
    {
      "month": "2024-01",
      "revenue": 299.99,
      "count": 10
    }
  ]
}
```

### GET `/api/subscription/admin/business`
**Headers:** `Authorization: Bearer {access_token}`

**Success Response (200):**
```json
{
  "id": 1,
  "telegram_url": "https://t.me/support",
  "instagram_url": "https://instagram.com/app",
  "website_url": "https://app.com",
  "support_email": "support@app.com",
  "required_app_version": "1.2.0",
  "company_name": "Educational Platform",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

### PUT `/api/subscription/admin/business`
**Headers:** `Authorization: Bearer {access_token}`
**Request Body:**
```json
{
  "required_app_version": "1.3.0",
  "support_email": "help@app.com"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "telegram_url": "https://t.me/support",
  "instagram_url": "https://instagram.com/app",
  "website_url": "https://app.com",
  "support_email": "help@app.com",
  "required_app_version": "1.3.0",
  "company_name": "Educational Platform",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Error Response (400):**
```json
{
  "detail": "Invalid version format. Use format like '1.0.0'"
}
```