/**
 * Unit tests for src/env-vars.ts (parseEnvVars).
 *
 * Run with:
 *   npm run test:unit
 *   node --import tsx --test tests/unit/env-vars.test.ts
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { parseEnvVars } from '../../src/env-vars.js';

describe('parseEnvVars - empty inputs', () => {
    it('returns {} for undefined', () => {
        assert.deepEqual(parseEnvVars(undefined), {});
    });

    it('returns {} for null', () => {
        assert.deepEqual(parseEnvVars(null), {});
    });

    it('returns {} for empty string', () => {
        assert.deepEqual(parseEnvVars(''), {});
    });

    it('returns {} for whitespace-only string', () => {
        assert.deepEqual(parseEnvVars('   \n\t  \n'), {});
    });
});

describe('parseEnvVars - dotenv format', () => {
    it('parses a single KEY=VALUE line', () => {
        assert.deepEqual(parseEnvVars('FOO=bar'), { FOO: 'bar' });
    });

    it('parses multiple lines', () => {
        const result = parseEnvVars('FOO=bar\nBAZ=qux\nNUM=42');
        assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux', NUM: '42' });
    });

    it('handles \\r\\n line endings', () => {
        const result = parseEnvVars('FOO=bar\r\nBAZ=qux');
        assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux' });
    });

    it('skips blank lines', () => {
        const result = parseEnvVars('\n\nFOO=bar\n\n\nBAZ=qux\n');
        assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux' });
    });

    it('skips comment lines starting with #', () => {
        const result = parseEnvVars('# this is a comment\nFOO=bar\n#FOO=overridden');
        assert.deepEqual(result, { FOO: 'bar' });
    });

    it('strips surrounding double quotes from values', () => {
        assert.deepEqual(parseEnvVars('FOO="hello world"'), { FOO: 'hello world' });
    });

    it('strips surrounding single quotes from values', () => {
        assert.deepEqual(parseEnvVars("FOO='hello world'"), { FOO: 'hello world' });
    });

    it('does not strip mismatched quotes', () => {
        assert.deepEqual(parseEnvVars(`FOO="hello'`), { FOO: `"hello'` });
    });

    it('preserves quotes that are part of a longer value', () => {
        assert.deepEqual(parseEnvVars('FOO=hello"world'), { FOO: 'hello"world' });
    });

    it('accepts optional `export ` prefix', () => {
        const result = parseEnvVars('export FOO=bar\nexport   BAZ=qux');
        assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux' });
    });

    it('preserves "=" characters inside the value', () => {
        const result = parseEnvVars('CONNECTION_STRING=postgres://u:p=word@host/db');
        assert.deepEqual(result, { CONNECTION_STRING: 'postgres://u:p=word@host/db' });
    });

    it('allows empty values', () => {
        assert.deepEqual(parseEnvVars('EMPTY='), { EMPTY: '' });
    });

    it('trims whitespace around key and value', () => {
        assert.deepEqual(parseEnvVars('  FOO  =  bar  '), { FOO: 'bar' });
    });

    it('skips lines without an `=`', () => {
        const result = parseEnvVars('FOO=bar\nNOT_AN_ASSIGNMENT\nBAZ=qux');
        assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux' });
    });

    it('skips lines starting with `=` (empty key)', () => {
        const result = parseEnvVars('=value\nFOO=bar');
        assert.deepEqual(result, { FOO: 'bar' });
    });

    it('skips keys that do not match identifier pattern', () => {
        const result = parseEnvVars('9BAD=x\nGOOD_1=y\nbad-key=z\nVALID=ok');
        assert.deepEqual(result, { GOOD_1: 'y', VALID: 'ok' });
    });

    it('allows underscore-prefixed keys', () => {
        assert.deepEqual(parseEnvVars('_PRIVATE=secret'), { _PRIVATE: 'secret' });
    });

    it('later duplicates override earlier ones', () => {
        assert.deepEqual(parseEnvVars('FOO=first\nFOO=second'), { FOO: 'second' });
    });
});

describe('parseEnvVars - JSON format', () => {
    it('parses a flat JSON object of strings', () => {
        const result = parseEnvVars('{"FOO": "bar", "BAZ": "qux"}');
        assert.deepEqual(result, { FOO: 'bar', BAZ: 'qux' });
    });

    it('coerces number values to strings', () => {
        assert.deepEqual(parseEnvVars('{"PORT": 8080}'), { PORT: '8080' });
    });

    it('coerces boolean values to strings', () => {
        assert.deepEqual(parseEnvVars('{"DEBUG": true, "QUIET": false}'), { DEBUG: 'true', QUIET: 'false' });
    });

    it('skips null and undefined values', () => {
        assert.deepEqual(parseEnvVars('{"FOO": "bar", "NULLED": null}'), { FOO: 'bar' });
    });

    it('skips object values', () => {
        const result = parseEnvVars('{"FOO": "bar", "NESTED": {"a": 1}}');
        assert.deepEqual(result, { FOO: 'bar' });
    });

    it('skips array values', () => {
        const result = parseEnvVars('{"FOO": "bar", "LIST": [1, 2]}');
        assert.deepEqual(result, { FOO: 'bar' });
    });

    it('skips invalid keys but keeps valid ones', () => {
        const result = parseEnvVars('{"9BAD": "x", "GOOD": "y", "bad-key": "z"}');
        assert.deepEqual(result, { GOOD: 'y' });
    });

    it('returns {} for malformed JSON', () => {
        assert.deepEqual(parseEnvVars('{not valid json'), {});
    });

    it('returns {} for top-level array', () => {
        assert.deepEqual(parseEnvVars('[{"FOO": "bar"}]'), {});
    });

    it('handles JSON with leading/trailing whitespace', () => {
        const result = parseEnvVars('   \n  {"FOO": "bar"}  \n');
        assert.deepEqual(result, { FOO: 'bar' });
    });

    it('returns {} for top-level null', () => {
        assert.deepEqual(parseEnvVars('null'), {});
    });
});

describe('parseEnvVars - format auto-detection', () => {
    it('treats input starting with `{` as JSON', () => {
        const result = parseEnvVars('{"FOO": "bar"}');
        assert.deepEqual(result, { FOO: 'bar' });
    });

    it('treats input starting with non-`{` as dotenv even if it looks JSON-ish', () => {
        // Leading "[" is not "{", so dotenv path applies and the line is rejected as malformed.
        assert.deepEqual(parseEnvVars('["FOO=bar"]'), {});
    });

    it('falls back to dotenv when JSON parse fails (still starts with `{`)', () => {
        // Once we commit to the JSON branch on a leading `{`, a parse failure yields {} - we don't retry as dotenv.
        assert.deepEqual(parseEnvVars('{ FOO=bar'), {});
    });
});
