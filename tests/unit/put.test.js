const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  test(`incorrect id returns not found`, async () => {
    const data = Buffer.from('fragment');
    const res = await request(app)
      .put(`/v1/fragments/incId`)
      .send(data)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test(`type should not be changed`, async () => {
    const data = Buffer.from('fragment');
    const newData = Buffer.from('<p>new fragment</p>');

    const postres = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const putres = await request(app)
      .put(`/v1/fragments/${postres.body.fragment.id}`)
      .send(newData)
      .set('Content-Type', 'text/html')
      .auth('user1@email.com', 'password1');

    expect(putres.statusCode).toBe(400);
    expect(putres.body.status).toBe('error');
    expect(putres.body.error.message).toBe('Type should not be changed after creation');
  });

  test(`authenticated users update existing fragment's data`, async () => {
    const data = Buffer.from('fragment');
    const newData = Buffer.from('new fragment');

    const postres = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const putres = await request(app)
      .put(`/v1/fragments/${postres.body.fragment.id}`)
      .send(newData)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const getres = await request(app)
      .get(`/v1/fragments/${postres.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(putres.statusCode).toBe(200);
    expect(getres.statusCode).toBe(200);
    expect(getres.text).toBe('new fragment');
  });
});
