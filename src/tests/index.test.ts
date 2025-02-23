import request from 'supertest';
import { app } from '../index';
import { describe, it, expect } from '@jest/globals';

describe('Integration', () => {
  it('should respond to GET /home', async () => {
    const response = await request(app).get('/home');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "active",
      integration_name: "CI-CD Monitor",
      description: "Watches your CI-CD pipeline and sends alerts to your team"
    });
  });

  it('should respond to GET /integration', async () => {
    const response = await request(app).get('/integration');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('should respond to POST /monitor-service with missing fields', async () => {
    const response = await request(app).post('/monitor-service').send({
      event_name: 'build_failed',
      message: 'Build failed due to linting errors'
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'All fields are required' });
  });

  it('should respond to POST /monitor-service with valid data', async () => {
    const response = await request(app).post('/monitor-service').send({
      event_name: 'build_failed',
      message: 'Build failed due to errors in nginx configuration',
      status: 'failed',
      username: 'ci-bot'
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Alert sent to Telex Channel');
  });
});