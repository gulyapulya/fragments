const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('DELETE /v1/fragments/:id', () => {
  test('no fragments matching requested id', async () => {
    const res = await request(app)
      .delete(`/v1/fragments/no-id`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('delete valid fragment', async () => {
    const user = hash('user1@email.com');
    const data = Buffer.from('fragment');
    const fragment = new Fragment({ ownerId: user, type: 'text/plain; charset=utf-8' });
    await fragment.setData(data);
    await fragment.save();
    const delResponse = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(delResponse.statusCode).toBe(200);
    expect(delResponse.body.status).toBe('ok');
  });
});
