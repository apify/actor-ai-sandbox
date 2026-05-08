/* eslint-disable @typescript-eslint/no-floating-promises -- node:test's describe/it return promises by design */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseEnvVars } from '../../src/env-vars.js';

describe('parseEnvVars', () => {
    describe('empty / nullish input', () => {
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
            assert.deepEqual(parseEnvVars('   \n\t  '), {});
        });
    });

    describe('JSON object input', () => {
        it('parses a flat object of strings', () => {
            assert.deepEqual(parseEnvVars('{"FOO":"bar","BAZ":"qux"}'), { FOO: 'bar', BAZ: 'qux' });
        });

        it('coerces scalar values (number, boolean) to strings', () => {
            assert.deepEqual(parseEnvVars('{"PORT":3000,"DEBUG":true}'), { PORT: '3000', DEBUG: 'true' });
        });

        it('skips null and undefined values', () => {
            assert.deepEqual(parseEnvVars('{"FOO":"bar","NIL":null}'), { FOO: 'bar' });
        });

        it('skips object and array values', () => {
            assert.deepEqual(parseEnvVars('{"FOO":"bar","OBJ":{"x":1},"ARR":[1,2]}'), { FOO: 'bar' });
        });

        it('skips invalid keys (must start with letter or underscore)', () => {
            assert.deepEqual(parseEnvVars('{"1FOO":"bad","FOO-BAR":"bad","_OK":"ok","GOOD2":"ok"}'), {
                _OK: 'ok',
                GOOD2: 'ok',
            });
        });

        it('returns {} for malformed JSON', () => {
            assert.deepEqual(parseEnvVars('{not json}'), {});
        });

        it('returns {} for JSON arrays at the top level', () => {
            assert.deepEqual(parseEnvVars('[1,2,3]'), {});
        });

        it('tolerates leading whitespace before the opening brace', () => {
            assert.deepEqual(parseEnvVars('   \n{"FOO":"bar"}'), { FOO: 'bar' });
        });
    });

    describe('dotenv input', () => {
        it('parses simple KEY=VALUE lines', () => {
            assert.deepEqual(parseEnvVars('FOO=bar\nBAZ=qux'), { FOO: 'bar', BAZ: 'qux' });
        });

        it('handles the optional `export ` prefix', () => {
            assert.deepEqual(parseEnvVars('export FOO=bar'), { FOO: 'bar' });
        });

        it('strips matching surrounding quotes (double and single)', () => {
            assert.deepEqual(parseEnvVars('FOO="bar baz"\nBAZ=\'qux\''), { FOO: 'bar baz', BAZ: 'qux' });
        });

        it('does not strip mismatched quotes', () => {
            assert.deepEqual(parseEnvVars(`FOO="bar'`), { FOO: `"bar'` });
        });

        it('preserves `=` characters in the value', () => {
            assert.deepEqual(parseEnvVars('TOKEN=abc=def=ghi'), { TOKEN: 'abc=def=ghi' });
        });

        it('skips comment lines and blank lines', () => {
            const input = ['# comment', '', 'FOO=bar', '   ', '# another', 'BAZ=qux'].join('\n');
            assert.deepEqual(parseEnvVars(input), { FOO: 'bar', BAZ: 'qux' });
        });

        it('skips malformed lines (no `=`) but keeps valid ones', () => {
            assert.deepEqual(parseEnvVars('FOO=bar\nNO_EQUALS_HERE\nBAZ=qux'), { FOO: 'bar', BAZ: 'qux' });
        });

        it('skips lines with invalid keys', () => {
            assert.deepEqual(parseEnvVars('1FOO=bad\nFOO-BAR=bad\n_OK=ok'), { _OK: 'ok' });
        });

        it('handles CRLF line endings', () => {
            assert.deepEqual(parseEnvVars('FOO=bar\r\nBAZ=qux\r\n'), { FOO: 'bar', BAZ: 'qux' });
        });

        it('allows empty values', () => {
            assert.deepEqual(parseEnvVars('EMPTY='), { EMPTY: '' });
        });
    });

    describe('format detection', () => {
        it('treats input starting with `{` as JSON', () => {
            assert.deepEqual(parseEnvVars('{"FOO":"bar"}'), { FOO: 'bar' });
        });

        it('treats input not starting with `{` as dotenv', () => {
            assert.deepEqual(parseEnvVars('FOO=bar'), { FOO: 'bar' });
        });
    });
});
