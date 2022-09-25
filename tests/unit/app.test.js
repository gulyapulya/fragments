// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /missingpage', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('resources (e.g., page) cannot be found', () => request(app).get('/missingpage').expect(404));
});