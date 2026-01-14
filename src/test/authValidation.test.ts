import { describe, it, expect } from "vitest";
import { 
  validatePassword, 
  validateEmail, 
  getAuthErrorMessage, 
  PASSWORD_MIN_LENGTH 
} from "@/lib/authTypes";

describe("validatePassword", () => {
  it("should reject passwords shorter than minimum length", () => {
    const result = validatePassword("short");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(PASSWORD_MIN_LENGTH.toString());
  });

  it("should reject empty passwords", () => {
    const result = validatePassword("");
    expect(result.isValid).toBe(false);
  });

  it("should accept passwords at minimum length", () => {
    const result = validatePassword("a".repeat(PASSWORD_MIN_LENGTH));
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept passwords longer than minimum length", () => {
    const result = validatePassword("a".repeat(PASSWORD_MIN_LENGTH + 10));
    expect(result.isValid).toBe(true);
  });
});

describe("validateEmail", () => {
  it("should reject empty email", () => {
    const result = validateEmail("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should reject invalid email formats", () => {
    const invalidEmails = [
      "invalid",
      "invalid@",
      "@example.com",
      "invalid@example",
      "in valid@example.com",
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
    });
  });

  it("should accept valid email formats", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.org",
      "user+tag@example.co.uk",
    ];

    validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

describe("getAuthErrorMessage", () => {
  it("should return friendly message for invalid credentials", () => {
    const message = getAuthErrorMessage("Invalid login credentials");
    expect(message).toBe("That email or password doesn't look right.");
  });

  it("should return friendly message for already registered user", () => {
    const variations = [
      "User already registered",
      "Email already exists",
      "User has already been registered",
    ];

    variations.forEach((error) => {
      const message = getAuthErrorMessage(error);
      expect(message).toBe("This email is already in use.");
    });
  });

  it("should return friendly message for email not confirmed", () => {
    const message = getAuthErrorMessage("Email not confirmed");
    expect(message).toContain("check your email");
  });

  it("should return friendly message for rate limiting", () => {
    const message = getAuthErrorMessage("Email rate limit exceeded");
    expect(message).toContain("Too many attempts");
  });

  it("should return friendly message for network errors", () => {
    const message = getAuthErrorMessage("Network error occurred");
    expect(message).toContain("Connection issue");
  });

  it("should return generic message for unknown errors", () => {
    const message = getAuthErrorMessage("Some unknown error xyz");
    expect(message).toBe("Something went wrong. Please try again.");
  });

  it("should be case insensitive", () => {
    const message = getAuthErrorMessage("INVALID LOGIN CREDENTIALS");
    expect(message).toBe("That email or password doesn't look right.");
  });
});
