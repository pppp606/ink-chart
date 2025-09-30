// Test file containing various types of secrets that should be detected by secretlint
// This file is used for testing secretlint configuration in TDD approach

// API Keys
const OPENAI_API_KEY = "sk-FAKE1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const STRIPE_API_KEY = "sk_test_FAKE1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// GitHub Tokens
const GITHUB_TOKEN = "ghp_FAKE1234567890abcdef1234567890abcdef12345";
const GITHUB_CLASSIC_TOKEN = "github_pat_11ABCDEFG0123456789_abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// NPM Tokens
const NPM_TOKEN = "npm_FAKE1234567890abcdef1234567890abcdef12345";

// Database URLs
const DATABASE_URL = "postgresql://user:password123@localhost:5432/mydb";
const MONGODB_URI = "mongodb://admin:secret123@cluster0.mongodb.net/test";

// Private Keys (RSA)
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
wEiOfH4qJJSrYzpTDzOc+6dQrZ1234567890abcdefghijklmnopqrstuvwxyz
-----END PRIVATE KEY-----`;

// Environment variables that often contain secrets
process.env.SECRET_KEY = "super-secret-key-12345";
process.env.API_SECRET = "api-secret-abc123def456";

// JWT Secret
const JWT_SECRET = "jwt-secret-key-that-should-not-be-hardcoded-123456789";

// Slack Webhook
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/FAKE-WEBHOOK-URL-FOR-TESTING";

module.exports = {
  // This file is intentionally left empty for exports to avoid runtime issues
  // The secrets above are just for testing secretlint detection
};