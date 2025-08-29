# OTP API - Readme

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://blueprintjs.com/docs/images/favicon.ico)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

A robust and scalable OTP (One-Time Password) generation and verification API built with Node.js and Express. This API provides secure email verification capabilities that can be integrated into any application.

## 🌟 Features

- **OTP Generation**: Create and send 6-digit verification codes via email
- **OTP Verification**: Validate OTP codes with expiration checks
- **Rate Limiting**: Built-in attempt limiting to prevent abuse
- **Email Integration**: Seamless integration with Gmail/SMTP services
- **RESTful API**: Clean and intuitive endpoints
- **CORS Enabled**: Ready for cross-origin requests
- **Production Ready**: Optimized for Vercel deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gmail account (for email sending)
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd otp-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   PORT=9000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Enable 2-Step Verification
   - Generate App Password
   - Use this password in your `EMAIL_PASS` variable

### Alternative Email Providers

Update the transporter configuration in `server.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'outlook', // or 'yahoo', 'hotmail', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set environment variables in Vercel Dashboard**
   - Go to your project → Settings → Environment Variables
   - Add `EMAIL_USER` and `EMAIL_PASS`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 9000) | No |
| `EMAIL_USER` | Email address for sending OTPs | Yes |
| `EMAIL_PASS` | App password for email service | Yes |

## 📚 API Reference

### Base URL
```
https://your-app.vercel.app
```

### Endpoints

#### 1. Generate OTP
**POST** `/api/otp/generate`

Send a verification OTP to the specified email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": "10 minutes"
}
```

#### 2. Verify OTP
**POST** `/api/otp/verify`

Validate an OTP for a specific email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### 3. Check OTP Status
**GET** `/api/otp/status/:email`

Check if an active OTP exists for an email.

**Response:**
```json
{
  "exists": true,
  "expiresIn": "8 minutes",
  "attempts": 0
}
```

#### 4. Health Check
**GET** `/health`

Verify API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## 🔧 Usage Examples

### JavaScript Fetch API
```javascript
// Generate OTP
const generateOTP = async (email) => {
  const response = await fetch('https://your-api.vercel.app/api/otp/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('https://your-api.vercel.app/api/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return response.json();
};
```

### cURL Examples
```bash
# Generate OTP
curl -X POST https://your-api.vercel.app/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Verify OTP
curl -X POST https://your-api.vercel.app/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

## 🛡️ Security Features

- **OTP Expiration**: Codes expire after 10 minutes
- **Attempt Limiting**: Maximum 3 attempts per OTP
- **Input Validation**: Email format validation
- **CORS Protection**: Configured for secure cross-origin requests
- **No Sensitive Data Exposure**: OTPs are not returned in responses

## 🗄️ Data Storage

**Current Implementation**: In-memory storage (Map object)
- **Pros**: Fast, simple, no dependencies
- **Cons**: Data lost on server restart/scale

**Recommended for Production**: 
- Redis (for automatic expiration)
- MongoDB/PostgreSQL (for persistence)
- Database integration example available in `/examples` directory

## 📊 Monitoring

The API includes built-in logging:
- OTP generation and verification attempts
- Email sending status
- Error tracking
- Periodic cleanup of expired OTPs

## 🚦 Rate Limiting

Consider implementing additional rate limiting:
- IP-based request limiting
- Email-based cooldown periods
- Use packages like `express-rate-limit`

## 🔮 Future Enhancements

- [ ] Database integration (Redis/MongoDB)
- [ ] SMS OTP support (Twilio integration)
- [ ] Rate limiting middleware
- [ ] Admin dashboard
- [ ] Webhook support
- [ ] Analytics endpoints
- [ ] Multiple language support
- [ ] Customizable OTP length/expiry

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Verify Gmail app password is correct
   - Check email service provider settings

2. **CORS errors**
   - Verify frontend URL is allowed in CORS configuration

3. **Vercel deployment issues**
   - Check environment variables are set correctly
   - Verify `vercel.json` configuration

### Debug Mode

Enable debug logging by setting:
```javascript
// Add to server.js
process.env.DEBUG = 'otp-api:*';
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🏆 Acknowledgments

- Express.js team
- Nodemailer library
- Vercel for hosting
- Contributors and testers

---

**Note**: This API is designed for development and production use. For mission-critical applications, consider implementing additional security measures and database persistence.
