import { describe, expect, it } from 'vitest';
import { buildCodeIn } from './build-address';

const PAGE = 'https://nyiriattila88.github.io/witcher3-build-planner/';

describe('buildCodeIn', () => {
  it('takes the build parameter of a shared link', () => {
    const code = buildCodeIn(`${PAGE}?build=2.OB66AAAcCDjM`);

    expect(code).toBe('2.OB66AAAcCDjM');
  });

  it('takes the hash of a 1.x link', () => {
    const code = buildCodeIn(`${PAGE}#W3R1.AAAA`);

    expect(code).toBe('W3R1.AAAA');
  });

  it('finds no code in a plain page address', () => {
    const code = buildCodeIn(PAGE);

    expect(code).toBe('');
  });

  it('keeps pasted text that is not a link, without the surrounding spaces', () => {
    const code = buildCodeIn('  2.OB66AAAcCDjM \n');

    expect(code).toBe('2.OB66AAAcCDjM');
  });
});
