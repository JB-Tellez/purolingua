// Real wording of interpolated messages: the due badge (v1.1's "{count} carte" /
// "Completato", with plurals) and the speak-choice label.
import { describe, it, expect } from 'vitest';
import { createTranslator } from 'next-intl';
import itMessages from '../../../messages/it.json';
import esMessages from '../../../messages/es.json';

describe.each([
  ['it', itMessages, '1 carta', '12 carte', 'Completato'],
  ['es', esMessages, '1 tarjeta', '12 tarjetas', 'Completado'],
] as const)('badge messages (%s)', (locale, messages, one, many, done) => {
  const t = createTranslator({ locale, messages, namespace: 'badge' });

  it('counts due cards with the right plural', () => {
    expect(t('due', { count: 1 })).toBe(one);
    expect(t('due', { count: 12 })).toBe(many);
  });

  it('says a deck with nothing due is done', () => {
    expect(t('done')).toBe(done);
  });
});

describe.each([
  ['it', itMessages, 'Ascolta: Un caffè'],
  ['es', esMessages, 'Escuchar: Un caffè'],
] as const)('speak-choice label (%s)', (locale, messages, expected) => {
  it('names the answer it plays', () => {
    const t = createTranslator({ locale, messages, namespace: 'study' });
    expect(t('audioChoice', { text: 'Un caffè' })).toBe(expected);
  });
});
