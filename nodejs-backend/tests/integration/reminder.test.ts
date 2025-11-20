import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Reminder Endpoints', () => {
  let authToken: string;

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'reminder@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      });

    authToken = response.body.data.tokens.accessToken;
  });

  describe('POST /api/v1/reminders', () => {
    it('should create a reminder', async () => {
      const response = await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'John Doe',
          relation: 'friend',
          birthday: '1990-05-15',
          phone: '+11234567890',
          email: 'john@example.com',
          notes: 'College friend',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.personName).toBe('John Doe');
      expect(response.body.data.age).toBeDefined();
      expect(response.body.data.daysUntil).toBeDefined();
    });

    it('should create a reminder with message', async () => {
      const response = await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'Jane Doe',
          relation: 'sister',
          birthday: '1995-08-20',
          message: {
            content: 'Happy Birthday! Wishing you all the best!',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBeDefined();
      expect(response.body.data.message.content).toBe(
        'Happy Birthday! Wishing you all the best!'
      );
    });

    it('should reject without auth', async () => {
      const response = await request(app)
        .post('/api/v1/reminders')
        .send({
          personName: 'John Doe',
          relation: 'friend',
          birthday: '1990-05-15',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/reminders', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'Person 1',
          relation: 'friend',
          birthday: '1990-01-15',
        });

      await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'Person 2',
          relation: 'family',
          birthday: '1985-06-20',
        });
    });

    it('should list reminders', async () => {
      const response = await request(app)
        .get('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by relation', async () => {
      const response = await request(app)
        .get('/api/v1/reminders?relation=friend')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].relation).toBe('friend');
    });
  });

  describe('GET /api/v1/reminders/:id', () => {
    it('should get reminder by id', async () => {
      const createResponse = await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'Test Person',
          relation: 'friend',
          birthday: '1990-05-15',
        });

      const reminderId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(reminderId);
    });

    it('should return 404 for non-existent reminder', async () => {
      const response = await request(app)
        .get('/api/v1/reminders/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/reminders/:id', () => {
    it('should update reminder', async () => {
      const createResponse = await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'Original Name',
          relation: 'friend',
          birthday: '1990-05-15',
        });

      const reminderId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.personName).toBe('Updated Name');
    });
  });

  describe('DELETE /api/v1/reminders/:id', () => {
    it('should delete reminder', async () => {
      const createResponse = await request(app)
        .post('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personName: 'To Delete',
          relation: 'friend',
          birthday: '1990-05-15',
        });

      const reminderId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify deleted
      const getResponse = await request(app)
        .get(`/api/v1/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
