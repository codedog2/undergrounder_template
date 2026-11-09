import { detectLang, initLang, getLang, setLang, onLangChange, t, pick, LANGS } from '../src/core/i18n.js';
import { readPref, writePref } from '../src/core/prefs.js';
import strings from '../src/content/strings.json';

afterEach(() => { localStorage.clear(); });

test('LANGS', () => { expect(LANGS).toEqual(['en', 'zh']); });

test('detectLang', () => {
  expect(detectLang(['zh-CN'])).toBe('zh');
  expect(detectLang(['zh-TW'])).toBe('zh');
  expect(detectLang(['ja-JP', 'zh'])).toBe('zh');
  expect(detectLang(['fr-FR', 'en'])).toBe('en');
  expect(detectLang(['fr-FR'])).toBe('en');
  expect(detectLang([])).toBe('en');
});

test('saved language wins over browser language', () => {
  writePref('lang', 'zh');
  expect(initLang()).toBe('zh');
  expect(getLang()).toBe('zh');
});

test('invalid saved language is ignored', () => {
  writePref('lang', 'ja');   // e.g. left over from a build that had Japanese
  expect(LANGS).toContain(initLang());
});

test('pick falls back to english, never undefined', () => {
  expect(pick({ en: 'Hi', zh: '你好' }, 'zh')).toBe('你好');
  expect(pick({ en: 'Hi' }, 'zh')).toBe('Hi');
  expect(pick('plain', 'zh')).toBe('plain');
  expect(pick(undefined, 'zh')).toBe('');
  expect(pick(null, 'zh')).toBe('');
});

test('t falls back to english, then to empty string', () => {
  expect(t('nav.about', 'zh')).toBeTruthy();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  expect(t('no.such.key', 'zh')).toBe('');
});

test('setLang notifies and persists', () => {
  const fn = vi.fn();
  const off = onLangChange(fn);
  setLang('zh');
  expect(fn).toHaveBeenCalledWith('zh');
  expect(readPref('lang')).toBe('zh');
  off();
  setLang('en');
  expect(fn).toHaveBeenCalledTimes(1);
});

test('every string has an english value', () => {
  for (const [k, v] of Object.entries(strings)) expect(v.en, k).toBeTruthy();
});
