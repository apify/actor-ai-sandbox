/**
 * Unit tests for the envVars security contract.
 *
 * The Actor exposes user-supplied secrets to the init bash script only and
 * must clear them before any sandboxed code execution or shell session
 * starts. These tests pin that behavior so a future change to main.ts or
 * environment.ts can't silently leak secrets into the execution environment.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

import { parseEnvVars } from '../src/env-vars.js';
import { getExecutionEnvironment, getUserEnvVars, setUserEnvVars } from '../src/environment.js';

const SECRET_KEY = '__AI_SANDBOX_TEST_SECRET__';
const SECRET_VALUE = 's3cret-value-do-not-leak';

const resetUserEnvVars = () => setUserEnvVars({});

void test('parseEnvVars: dotenv format', () => {
    const out = parseEnvVars('FOO=bar\nBAZ="qux"\n# comment\nexport TOKEN=abc');
    assert.deepEqual(out, { FOO: 'bar', BAZ: 'qux', TOKEN: 'abc' });
});

void test('parseEnvVars: JSON format', () => {
    const out = parseEnvVars('{"FOO": "bar", "NUM": 42}');
    assert.deepEqual(out, { FOO: 'bar', NUM: '42' });
});

void test('parseEnvVars: skips invalid keys and non-scalar values', () => {
    const out = parseEnvVars('{"GOOD": "yes", "1BAD": "no", "NESTED": {"a":1}}');
    assert.deepEqual(out, { GOOD: 'yes' });
});

void test('parseEnvVars: empty / missing input', () => {
    assert.deepEqual(parseEnvVars(undefined), {});
    assert.deepEqual(parseEnvVars(null), {});
    assert.deepEqual(parseEnvVars(''), {});
    assert.deepEqual(parseEnvVars('   '), {});
});

void test('getExecutionEnvironment includes user-supplied vars after setUserEnvVars', () => {
    resetUserEnvVars();
    setUserEnvVars({ [SECRET_KEY]: SECRET_VALUE });
    try {
        const env = getExecutionEnvironment();
        assert.equal(env[SECRET_KEY], SECRET_VALUE);
        assert.equal(getUserEnvVars()[SECRET_KEY], SECRET_VALUE);
    } finally {
        resetUserEnvVars();
    }
});

void test('SECURITY: setUserEnvVars({}) clears the secret from getExecutionEnvironment', () => {
    setUserEnvVars({ [SECRET_KEY]: SECRET_VALUE });
    setUserEnvVars({});

    const env = getExecutionEnvironment();
    assert.equal(env[SECRET_KEY], undefined, 'cleared secret must not appear in execution env');
    assert.deepEqual(getUserEnvVars(), {}, 'getUserEnvVars must be empty after clear');
});

void test('SECURITY: cleared secret does not leak into a spawned bash child', () => {
    setUserEnvVars({ [SECRET_KEY]: SECRET_VALUE });
    setUserEnvVars({});

    // Make sure the test runner's own env can't accidentally satisfy the assertion.
    delete process.env[SECRET_KEY];

    const result = spawnSync('bash', ['-c', `printf '%s' "\${${SECRET_KEY}-__UNSET__}"`], {
        env: getExecutionEnvironment(),
        encoding: 'utf8',
    });

    assert.equal(result.status, 0, `bash exited non-zero: ${result.stderr}`);
    assert.equal(result.stdout, '__UNSET__', 'secret leaked into spawned child after clear');
});

void test('SECURITY: setUserEnvVars defensively copies its input', () => {
    const source: Record<string, string> = { [SECRET_KEY]: SECRET_VALUE };
    setUserEnvVars(source);

    // Mutating the caller's object must not affect the module-scope state.
    delete source[SECRET_KEY];

    try {
        assert.equal(getUserEnvVars()[SECRET_KEY], SECRET_VALUE);
    } finally {
        resetUserEnvVars();
    }
});
