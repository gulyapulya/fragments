const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id/info', () => {
  test(`no fragments matching requested id`, async () => {
    const res = await request(app)
      .get(`/v1/fragments/noid/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test(`requested valid id`, async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from('fragment');
    const fragment = new Fragment({ ownerId: user, type: 'text/plain; charset=utf-8' });
    await fragment.setData(data);
    await fragment.save();
    var id = fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragment).toEqual(fragment);
  });
});
