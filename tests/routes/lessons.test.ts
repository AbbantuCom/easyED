import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { startTestDb, clearTestDb, stopTestDb } from '../setup/db';
import { authedRequest, createAuthenticatedFixture } from '../setup/auth';

const baseLessonPayload = {
  date: '2026-09-01',
  klass: 'Grade 5',
  subject: 'Mathematics',
  topic: 'Fractions',
  duration: '40 minutes',
  numLearners: 30,
};

describe('Lesson CRUD route handlers', () => {
  beforeAll(async () => {
    await startTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await stopTestDb();
  });

  it('creates, lists, fetches, updates, and deletes a lesson', async () => {
    const { cookieHeader } = await createAuthenticatedFixture();

    const { POST: createLesson, GET: listLessons } = await import('@/app/api/lessons/route');
    const { GET: getLesson, PATCH: updateLesson, DELETE: deleteLesson } = await import(
      '@/app/api/lessons/[id]/route'
    );

    const createResponse = await createLesson(
      authedRequest('http://localhost/api/lessons', cookieHeader, {
        method: 'POST',
        body: baseLessonPayload,
      }),
      undefined,
    );
    expect(createResponse.status).toBe(201);
    const { lesson } = await createResponse.json();
    expect(lesson.topic).toBe('Fractions');
    expect(lesson.introduction).toBe('');

    const listResponse = await listLessons(
      authedRequest('http://localhost/api/lessons?page=1&limit=20', cookieHeader),
      undefined,
    );
    const listBody = await listResponse.json();
    expect(listBody.items).toHaveLength(1);

    const getResponse = await getLesson(
      authedRequest(`http://localhost/api/lessons/${lesson.id}`, cookieHeader),
      { params: Promise.resolve({ id: lesson.id }) },
    );
    expect(getResponse.status).toBe(200);

    const updateResponse = await updateLesson(
      authedRequest(`http://localhost/api/lessons/${lesson.id}`, cookieHeader, {
        method: 'PATCH',
        body: { introduction: 'Recap the previous lesson on decimals.' },
      }),
      { params: Promise.resolve({ id: lesson.id }) },
    );
    expect(updateResponse.status).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.lesson.introduction).toBe('Recap the previous lesson on decimals.');

    const deleteResponse = await deleteLesson(
      authedRequest(`http://localhost/api/lessons/${lesson.id}`, cookieHeader, {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: lesson.id }) },
    );
    expect(deleteResponse.status).toBe(200);

    const getAfterDelete = await getLesson(
      authedRequest(`http://localhost/api/lessons/${lesson.id}`, cookieHeader),
      { params: Promise.resolve({ id: lesson.id }) },
    );
    expect(getAfterDelete.status).toBe(404);
  });

  it('rejects a malformed lesson payload with structured field errors', async () => {
    const { cookieHeader } = await createAuthenticatedFixture();
    const { POST: createLesson } = await import('@/app/api/lessons/route');

    const response = await createLesson(
      authedRequest('http://localhost/api/lessons', cookieHeader, {
        method: 'POST',
        body: { ...baseLessonPayload, topic: '' },
      }),
      undefined,
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors.topic).toBeTruthy();
  });
});
