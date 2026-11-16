import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

// Set before importing the controller to test production cookie settings.
// Check that production cookies include the Secure setting
process.env.NODE_ENV = 'production';

const { AuthController } = await import('../dist/auth/auth.controller.js');
const { AuthService } = await import('../dist/auth/auth.service.js');
const { SessionGuard } = await import('../dist/auth/session.guard.js');

// Start a fresh test API and session store for each test
async function withApi(run) {
  const users = {
    alice: {
      id: 'alice',
      email: 'alice@example.com',
      name: 'Alice',
      avatarUrl: null,
    },
    bob: {
      id: 'bob',
      email: 'bob@example.com',
      name: 'Bob',
      avatarUrl: null,
    },
  };

  // Give Alice two active sessions, Bob one, and include an expired session
  const sessions = new Map([
    ['alice-one', { userId: 'alice', expiresAt: new Date(Date.now() + 60_000) }],
    ['alice-two', { userId: 'alice', expiresAt: new Date(Date.now() + 60_000) }],
    ['bob-one', { userId: 'bob', expiresAt: new Date(Date.now() + 60_000) }],
    ['expired', { userId: 'alice', expiresAt: new Date(Date.now() - 60_000) }],
  ]);

  // Stand in for the database so these tests don't need PostgreSQL
  const prisma = {
    session: {
      async findUnique({ where }) {
        const session = sessions.get(where.id);
        if (!session) return null;

        return {
          expiresAt: session.expiresAt,
          user: users[session.userId],
        };
      },

      async deleteMany({ where }) {
        let count = 0;

        for (const [id, session] of sessions) {
          const matches =
            (where.id === undefined || where.id === id) &&
            (where.userId === undefined || where.userId === session.userId);

          if (matches) {
            sessions.delete(id);
            count += 1;
          }
        }

        return { count };
      },
    },
  };

  // Stand in for the config service so these tests don't need real secrets or external calls
  const config = new ConfigService({
    // Test-only key; no real secrets or external calls.
    TOKEN_ENCRYPTION_KEY: Buffer.alloc(32).toString('base64'),
  });

  const authService = new AuthService(prisma, config);

  class TestModule {}

  Module({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: authService },
      { provide: ConfigService, useValue: config },
      {
        provide: SessionGuard,
        useValue: new SessionGuard(authService),
      },
    ],
  })(TestModule);

  const app = await NestFactory.create(TestModule, { logger: false });
  app.use(cookieParser());

  try {
    await app.listen(0, '127.0.0.1');
    const baseUrl = await app.getUrl();

    async function request(path, sessionId, method = 'GET', body) {
      const headers = {};

      if (sessionId !== undefined) {
        headers.Cookie = `session=${sessionId}`;
      }

      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      return fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    }

    await run({ request });
  } finally {
    await app.close();
  }
}

test('logout-all-1 returns 204 with an empty body', async () => {
  await withApi(async ({ request }) => {
    const response = await request('/auth/logout-all', 'alice-one', 'POST');

    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
  });
});

test('logout-all-1 invalidates both sessions belonging to the user', async () => {
  await withApi(async ({ request }) => {
    for (const session of ['alice-one', 'alice-two']) {
      assert.equal((await request('/auth/me', session)).status, 200);
    }

    assert.equal((await request('/auth/logout-all', 'alice-one', 'POST')).status, 204);

    for (const session of ['alice-one', 'alice-two']) {
      assert.equal((await request('/auth/me', session)).status, 401);
    }
  });
});

test('logout-all-1 preserves another user’s session', async () => {
  await withApi(async ({ request }) => {
    assert.equal((await request('/auth/logout-all', 'alice-one', 'POST')).status, 204);

    const response = await request('/auth/me', 'bob-one');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).id, 'bob');
  });
});

test('logout-all-1 rejects missing, invalid, and expired sessions', async () => {
  await withApi(async ({ request }) => {
    for (const session of [undefined, 'unknown', 'expired']) {
      const response = await request('/auth/logout-all', session, 'POST');
      assert.equal(response.status, 401);

      for (const valid of ['alice-one', 'alice-two', 'bob-one']) {
        assert.equal((await request('/auth/me', valid)).status, 200);
      }
    }
  });
});

test('logout-all-1 expires the cookie with production security settings', async () => {
  await withApi(async ({ request }) => {
    const response = await request('/auth/logout-all', 'alice-one', 'POST');
    assert.equal(response.status, 204);

    const cookie = response.headers.get('set-cookie');
    assert.ok(cookie);
    assert.match(cookie, /^session=;/);
    assert.match(cookie, /Path=\//i);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /;\s*Secure(?:;|$)/i);

    const expires = /Expires=([^;]+)/i.exec(cookie);
    assert.ok(expires);
    assert.ok(Date.parse(expires[1]) < Date.now());
  });
});

test('logout-all-1 ignores a target userId supplied in body or query', async () => {
  for (const source of ['body', 'query']) {
    await withApi(async ({ request }) => {
      const path = source === 'query' ? '/auth/logout-all?userId=bob' : '/auth/logout-all';

      const body = source === 'body' ? { userId: 'bob' } : undefined;
      const response = await request(path, 'alice-one', 'POST', body);

      assert.equal(response.status, 204);
      assert.equal((await request('/auth/me', 'alice-one')).status, 401);
      assert.equal((await request('/auth/me', 'alice-two')).status, 401);
      assert.equal((await request('/auth/me', 'bob-one')).status, 200);
    });
  }
});

test('logout-all-1 preserves single-session logout behavior', async () => {
  await withApi(async ({ request }) => {
    const response = await request('/auth/logout', 'alice-one', 'POST');

    assert.equal(response.status, 204);
    assert.equal((await request('/auth/me', 'alice-one')).status, 401);
    assert.equal((await request('/auth/me', 'alice-two')).status, 200);
    assert.equal((await request('/auth/me', 'bob-one')).status, 200);
  });
});
