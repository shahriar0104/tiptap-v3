import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import database from '../src/config/database.js';

describe('Board Papers API', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is healthy');
    });
  });

  describe('Board Meetings', () => {
    it('should create a board meeting with agenda items', async () => {
      const boardMeetingData = {
        title: 'Test Board Meeting',
        description: 'Test description',
        status: 'DRAFT',
        meetingDate: '2025-01-15T10:00:00Z',
        agendaItems: [
          {
            title: 'Test Agenda Item 1',
            description: 'Test agenda item description',
            order: 1,
            duration: 30,
            status: 'PENDING'
          },
          {
            title: 'Test Agenda Item 2',
            description: 'Another test agenda item',
            order: 2,
            duration: 45,
            status: 'PENDING'
          }
        ]
      };

      const response = await request(app)
        .post('/api/board-meetings')
        .send(boardMeetingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(boardMeetingData.title);
      expect(response.body.data.agendaItems).toHaveLength(2);
    });

    it('should get all board papers', async () => {
      const response = await request(app)
        .get('/api/board-papers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        agendaItems: []
      };

      const response = await request(app)
        .post('/api/board-papers')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });
}); 