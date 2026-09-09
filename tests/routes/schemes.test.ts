import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { startTestDb, clearTestDb, stopTestDb } from '../setup/db';
import { authedRequest, createAuthenticatedFixture } from '../setup/auth';

describe('Scheme CRUD route handlers', () => {
  beforeAll(async () => {
    await startTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await stopTestDb();
  });

  it('creates, lists, fetches, updates, and deletes a scheme', async () => {
    const { cookieHeader } = await createAuthenticatedFixture();

    const { POST: createScheme, GET: listSchemes } = await import('@/app/api/schemes/route');
    const { GET: getScheme, PATCH: updateScheme, DELETE: deleteScheme } = await import(
      '@/app/api/schemes/[id]/route'
    );

    const createResponse = await createScheme(
      authedRequest('http://localhost/api/schemes', cookieHeader, {
        method: 'POST',
        body: { klass: 'Grade 4', subject: 'English', term: 'Term 2', year: 2026 },
      }),
      undefined,
    );
    expect(createResponse.status).toBe(201);
    const { scheme } = await createResponse.json();
    expect(scheme.klass).toBe('Grade 4');

    const listResponse = await listSchemes(
      authedRequest('http://localhost/api/schemes?page=1&limit=20', cookieHeader),
      undefined,
    );
    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.items).toHaveLength(1);
    expect(listBody.items[0].id).toBe(scheme.id);

    const getResponse = await getScheme(
      authedRequest(`http://localhost/api/schemes/${scheme.id}`, cookieHeader),
      { params: Promise.resolve({ id: scheme.id }) },
    );
    expect(getResponse.status).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody.scheme.subject).toBe('English');
    expect(getBody.weeks).toEqual([]);

    const updateResponse = await updateScheme(
      authedRequest(`http://localhost/api/schemes/${scheme.id}`, cookieHeader, {
        method: 'PATCH',
        body: { subject: 'Literacy' },
      }),
      { params: Promise.resolve({ id: scheme.id }) },
    );
    expect(updateResponse.status).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.scheme.subject).toBe('Literacy');

    const deleteResponse = await deleteScheme(
      authedRequest(`http://localhost/api/schemes/${scheme.id}`, cookieHeader, {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: scheme.id }) },
    );
    expect(deleteResponse.status).toBe(200);

    const getAfterDelete = await getScheme(
      authedRequest(`http://localhost/api/schemes/${scheme.id}`, cookieHeader),
      { params: Promise.resolve({ id: scheme.id }) },
    );
    expect(getAfterDelete.status).toBe(404);
  });

  it("returns not-found for a scheme belonging to a different account (tenant isolation)", async () => {
    const owner = await createAuthenticatedFixture('owner-a@example.com');
    const intruder = await createAuthenticatedFixture('owner-b@example.com');

    const { POST: createScheme } = await import('@/app/api/schemes/route');
    const { GET: getScheme } = await import('@/app/api/schemes/[id]/route');

    const createResponse = await createScheme(
      authedRequest('http://localhost/api/schemes', owner.cookieHeader, {
        method: 'POST',
        body: { klass: 'Grade 3', subject: 'Math', term: 'Term 1', year: 2026 },
      }),
      undefined,
    );
    const { scheme } = await createResponse.json();

    const response = await getScheme(
      authedRequest(`http://localhost/api/schemes/${scheme.id}`, intruder.cookieHeader),
      { params: Promise.resolve({ id: scheme.id }) },
    );

    expect(response.status).toBe(404);
  });

  it('rejects requests with no session cookie', async () => {
    const { GET: listSchemes } = await import('@/app/api/schemes/route');
    const response = await listSchemes(new Request('http://localhost/api/schemes'), undefined);
    expect(response.status).toBe(401);
  });
});
