import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { SessionCleanupService } from '../dist/auth/session-cleanup.service.js';
import { PrismaService } from '../dist/database/prisma.service.js';

// Fixed times make expiration boundary tests predictable.
const cutoff = new Date('2030-01-15T12:00:00Z');
const before = new Date(cutoff.getTime() - 1);
const after = new Date(cutoff.getTime() + 1);

// Stand in for Prisma without needing a real database.
function setup(rows = []) {
  const sessions = new Map(rows.map(([id, expiresAt]) => [id, { expiresAt }]));

  let lastCutoff;

  const prisma = {
    session: {
      async deleteMany({ where }) {
        lastCutoff = where.expiresAt.lte;
        let count = 0;

        for (const [id, session] of sessions) {
          if (session.expiresAt <= lastCutoff) {
            sessions.delete(id);
            count += 1;
          }
        }

        return { count };
      },
    },
  };

  return {
    service: new SessionCleanupService(prisma),
    prisma,
    sessions,
    getLastCutoff: () => lastCutoff,
  };
}

test('session-cleanup-1 deletes sessions before the cutoff', async () => {
  const { service, sessions } = setup([['old', before]]);

  await service.deleteExpiredSessions(cutoff);

  assert.equal(sessions.has('old'), false);
});

test('session-cleanup-1 deletes sessions exactly at the cutoff', async () => {
  const { service, sessions } = setup([['boundary', cutoff]]);

  await service.deleteExpiredSessions(cutoff);

  assert.equal(sessions.has('boundary'), false);
});

test('session-cleanup-1 preserves sessions after the cutoff', async () => {
  const { service, sessions } = setup([
    ['old', before],
    ['valid', after],
  ]);

  await service.deleteExpiredSessions(cutoff);

  assert.deepEqual([...sessions.keys()], ['valid']);
  assert.equal(sessions.get('valid').expiresAt.getTime(), after.getTime());
});

test('session-cleanup-1 returns the deletion count including zero', async () => {
  const { service } = setup([
    ['old', before],
    ['boundary', cutoff],
    ['valid', after],
  ]);

  assert.equal(await service.deleteExpiredSessions(cutoff), 2);

  const empty = setup();
  assert.equal(await empty.service.deleteExpiredSessions(cutoff), 0);
});

test('session-cleanup-1 can repeat cleanup safely', async () => {
  const { service, sessions } = setup([
    ['old', before],
    ['valid', after],
  ]);

  assert.equal(await service.deleteExpiredSessions(cutoff), 1);
  assert.equal(await service.deleteExpiredSessions(cutoff), 0);
  assert.deepEqual([...sessions.keys()], ['valid']);
});

test('session-cleanup-1 uses the current time when no cutoff is supplied', async () => {
  const { service, sessions, getLastCutoff } = setup([
    ['expired', new Date(Date.now() - 60_000)],
    ['valid', new Date(Date.now() + 60_000)],
  ]);

  const started = Date.now();
  assert.equal(await service.deleteExpiredSessions(), 1);
  const finished = Date.now();

  // The default cutoff should have been captured during this call.
  assert.ok(getLastCutoff() instanceof Date);
  assert.ok(getLastCutoff().getTime() >= started);
  assert.ok(getLastCutoff().getTime() <= finished);
  assert.deepEqual([...sessions.keys()], ['valid']);
});

test('session-cleanup-1 nightly handler invokes cleanup', async () => {
  const { service, sessions } = setup([
    ['expired', new Date(Date.now() - 60_000)],
    ['valid', new Date(Date.now() + 60_000)],
  ]);

  await service.handleNightlyCleanup();

  assert.deepEqual([...sessions.keys()], ['valid']);
});

test('session-cleanup-1 registers a daily midnight UTC job', async () => {
  const { prisma } = setup();

  // Start Nest scheduling with the real cleanup service.
  class TestModule {}

  Module({
    imports: [ScheduleModule.forRoot()],
    providers: [SessionCleanupService, { provide: PrismaService, useValue: prisma }],
  })(TestModule);

  const app = await NestFactory.createApplicationContext(TestModule, {
    logger: false,
  });

  try {
    const registry = app.get(SchedulerRegistry);
    const job = registry.getCronJob('expired-session-cleanup');

    // Inspect upcoming runs instead of waiting until midnight.
    const dates = job.nextDates(2).map((date) => date.toJSDate());

    assert.equal(dates.length, 2);

    for (const date of dates) {
      assert.equal(date.getUTCHours(), 0);
      assert.equal(date.getUTCMinutes(), 0);
      assert.equal(date.getUTCSeconds(), 0);
    }

    assert.equal(dates[1].getTime() - dates[0].getTime(), 24 * 60 * 60 * 1000);
  } finally {
    // Stop scheduled timers so the test process can finish.
    await app.close();
  }
});
