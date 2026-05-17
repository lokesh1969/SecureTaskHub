import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../db/prisma';

jest.mock('../db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should return 400 if user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });
  });
});
