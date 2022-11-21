const request = require('supertest');

const app = require('../../src/app');

const isISODate = require('is-iso-date');

const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const data = Buffer.from('fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(401);
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', async () => {
    const data = Buffer.from('fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(401);
  });

  // If the wrong content-type or data used, it should return 415
  test('incorrect types are denied', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'audio/mpeg')
      .send(data);
    expect(res.statusCode).toBe(415);
  });

  // Using a valid username/password pair should give a success result
  test('authenticated users create a plain text fragment', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // Using a valid username/password pair should give a success result with proper location
  test('location header should return location url', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.headers.location).toMatch(`/v1/fragments/${JSON.parse(res.text).fragment.id}`);
  });

  // Using a valid username/password pair should give a success result with proper id
  test('fragment id should be UUID', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    const UUIDregex = new RegExp(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
    expect(res.body.fragment.id).toMatch(UUIDregex);
  });

  // Using a valid username/password pair should give a success result with proper ownerId
  test('ownerId should be SHA256 hash', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.ownerId).toEqual(hash('user1@email.com'));
  });

  // Using a valid username/password pair should give a success result with proper dates
  test('created, updated should be ISO 8601 Date strings', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(isISODate(res.body.fragment.created)).toBe(true);
    expect(isISODate(res.body.fragment.updated)).toBe(true);
  });

  // Using a valid username/password pair should give a success result with proper type
  test('type should be a Content Type', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toEqual('text/plain');
  });

  // Using a valid username/password pair should give a success result with proper size
  test('size should be the number (integer) of bytes of data stored', async () => {
    const data = Buffer.from('This is fragment');
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toEqual(Buffer.byteLength(data));
  });
});
