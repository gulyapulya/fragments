const fs = require('fs');
const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id', () => {
  // If the id is not valid, return an HTTP 404
  test('no fragments matching requested id', async () => {
    const getRes = await request(app).get(`/v1/fragments/0`).auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });

  //If extension used is invalid, return an HTTP 415
  test('requested conversion invalid', async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from('fragment');
    const fragment = new Fragment({ ownerId: user, type: 'text/plain' });
    await fragment.setData(data);
    await fragment.save();
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.json`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
  });

  // Using a valid username/password pair, valid id, and extension, return converted data
  test('requested text conversion valid', async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from('# fragment');
    const fragment = new Fragment({ ownerId: user, type: 'text/markdown' });
    await fragment.setData(data);
    await fragment.save();
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toEqual('text/html; charset=utf-8');
    expect(res.text).toBe('<h1>fragment</h1>\n');
  });

  // Using a valid username/password pair, valid id, and extension, return converted data
  test('requested image conversion valid', async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from(fs.readFileSync(`${__dirname}/img/test.jpeg`));
    const fragment = new Fragment({ ownerId: user, type: 'image/jpeg' });
    await fragment.setData(data);
    await fragment.save();
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.png`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('image/png');
    expect(res.statusCode).toBe(200);
  });

  // Using a valid username/password pair with valid id, return fragment
  test('requested valid text fragment', async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from('fragment');
    const fragment = new Fragment({ ownerId: user, type: 'text/plain; charset=utf-8' });
    await fragment.setData(data);
    await fragment.save();
    var id = fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
  });

  // Using a valid username/password pair with valid id, return fragment
  test('requested valid image fragment', async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from(fs.readFileSync(`${__dirname}/img/test.jpeg`));
    const fragment = new Fragment({ ownerId: user, type: 'image/jpeg' });
    await fragment.setData(data);
    await fragment.save();
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('image/jpeg');
    expect(res.statusCode).toBe(200);
  });
});
