const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

describe('memory-db-backend', () => {
  test('writeFragment() returns nothing', async () => {
    const data = { ownerId: 'a', id: 'b', fragment: {} };
    const result = await writeFragment(data);
    expect(result).toBe(undefined);
  });

  test('readFragment() returns what we writeFragment() into db', async () => {
    const data = { ownerId: 'a', id: 'b', fragment: { value: 123 } };
    await writeFragment(data);
    const result = await readFragment('a', 'b');
    expect(result).toBe(data);
  });

  test('writeFragmentData() returns nothing', async () => {
    const data = { value: 123 };
    const result = await writeFragmentData('a', 'b', data);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns what we writeFragmentData() into db', async () => {
    const data = { value: 123 };
    await writeFragmentData('a', 'b', data);
    const result = await readFragmentData('a', 'b');
    expect(result).toBe(data);
  });
});
