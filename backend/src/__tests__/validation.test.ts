import { validate, loginSchema, signupSchema, subscriptionSchema, updateSubscriptionSchema } from '../middleware/validation/schemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a correct login payload', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should validate a correct signup payload', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        businessName: 'Test Business',
        businessPhoneNumber: '254700000000',
      };
      const result = signupSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoSpecialChars123',
        'NoNumbers!!!',
      ];
      
      weakPasswords.forEach(password => {
        const payload = {
          email: 'test@example.com',
          password,
          businessName: 'Test Business',
          businessPhoneNumber: '254700000000',
        };
        const result = signupSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    it('should require business phone number', () => {
      const payload = {
        email: 'test@example.com',
        password: 'Password123!',
        businessName: 'Test Business',
      };
      const result = signupSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('subscriptionSchema', () => {
    it('should validate correct subscription data', () => {
      const validPayload = {
        clientId: '507f1f77bcf86cd799439011',
        planId: '507f1f77bcf86cd799439012',
      };
      const result = subscriptionSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject missing clientId', () => {
      const invalidPayload = {
        planId: '507f1f77bcf86cd799439012',
      };
      const result = subscriptionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateSubscriptionSchema', () => {
    it('should validate status updates', () => {
      const validStatuses = ['PENDING_ACTIVATION', 'ACTIVE', 'PAUSED', 'CANCELLED'];
      
      validStatuses.forEach(status => {
        const payload = { status };
        const result = updateSubscriptionSchema.safeParse(payload);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const payload = { status: 'INVALID_STATUS' };
      const result = updateSubscriptionSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});