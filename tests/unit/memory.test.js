const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
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

  test('listFragments(expand=true) returns metadata', async () => {
    const data1 = { ownerId: 'a', id: 'b', fragment: { value: 123 } };
    const data2 = { ownerId: 'a', id: 'c', fragment: { value: 234 } };
    const data3 = { ownerId: 'a', id: 'd', fragment: { value: 345 } };
    await writeFragment(data1);
    await writeFragment(data2);
    await writeFragment(data3);
    const results = await listFragments('a', true);
    expect(results).toEqual([data1, data2, data3]);
  });

  test('listFragments(expand=false) returns ids', async () => {
    const data1 = { ownerId: 'a', id: 'b', fragment: { value: 123 } };
    const data2 = { ownerId: 'a', id: 'c', fragment: { value: 234 } };
    const data3 = { ownerId: 'a', id: 'd', fragment: { value: 345 } };
    await writeFragment(data1);
    await writeFragment(data2);
    await writeFragment(data3);
    const results = await listFragments('a', false);
    expect(results).toEqual([data1.id, data2.id, data3.id]);
  });

  test('deleteFragment() deletes metadata and data', async () => {
    const data = { ownerId: 'a', id: 'b', fragment: { value: 123 } };
    await writeFragment(data);
    await deleteFragment(data.ownerId, data.id);
    const metaResult = await readFragment(data.ownerId, data.id);
    expect(metaResult).toBe(undefined);
    const result = await readFragmentData(data.ownerId, data.id);
    expect(result).toBe(undefined);
  });
});
