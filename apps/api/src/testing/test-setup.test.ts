import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

// apps/api, where the test command runs.
const apiRoot = fileURLToPath(new URL('../..', import.meta.url));

// Small made-up services, so these tests only check the test setup itself.
@Injectable()
class GreetingService {
  greet(): string {
    return 'hello';
  }
}

@Injectable()
class Greeter {
  constructor(private readonly greeting: GreetingService) {}

  run(): string {
    return this.greeting.greet();
  }
}

describe('backend test setup', () => {
  it('3 injects constructor dependencies in a Nest testing module', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [Greeter, GreetingService],
    }).compile();

    expect(moduleRef.get(Greeter).run()).toBe('hello');
  });

  it('3 replaces a provider with a mock', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [Greeter, { provide: GreetingService, useValue: { greet: () => 'mocked' } }],
    }).compile();

    expect(moduleRef.get(Greeter).run()).toBe('mocked');
  });

  it('3 test command exits non-zero when a test fails', () => {
    // test-fixtures/ holds a test that always fails. It's outside src/, so normal runs skip it.
    const result = spawnSync('pnpm', ['exec', 'vitest', 'run', '--root', 'test-fixtures'], {
      cwd: apiRoot,
      encoding: 'utf8',
    });

    expect(result.stdout).toContain('1 failed');
    expect(result.status).not.toBe(0);
  }, 30_000);
});
