import { renderAbout } from '../src/sections/about.js';
import { renderProjects } from '../src/sections/projects.js';
import { showNote, hideNotes } from '../src/sections/note.js';
import { getContent, findSkill } from '../src/core/content.js';
import { t } from '../src/core/i18n.js';

const ctx = lang => ({ data: getContent(), lang });
const host = () => { const h = document.createElement('div'); document.body.append(h); return h; };

test('about shows name, contacts and education', () => {
  const h = host(); renderAbout(h, ctx('en'));
  expect(h.textContent).toContain(getContent().profile.name);
  expect(h.querySelectorAll('.contact a').length).toBe(getContent().profile.contacts.length);
  expect(h.querySelector('.card .clip')).not.toBeNull();
  expect(h.textContent).toContain(getContent().profile.education[0].en);
});

test('contacts sit in the right column under the card, with a phone number', () => {
  const h = host(); renderAbout(h, ctx('en'));
  expect(h.querySelector('.main .contact')).toBeNull();
  expect(h.querySelector('.side .card + .contact')).not.toBeNull();
  const phone = getContent().profile.contacts.find(c => c.kind === 'phone');
  const tel = h.querySelector('.contact a[href^="tel:"]');
  expect(tel.getAttribute('href')).toBe(phone.href);
  expect(tel.textContent).toBe(phone.value);
  const local = getContent().profile.contacts.filter(c => c.kind === 'email' || c.kind === 'phone').length;
  expect(h.querySelectorAll('.contact [data-copy]').length).toBe(local);   // email and phone get a copy button
});

test('about follows language', () => {
  const h = host(); renderAbout(h, ctx('zh'));
  expect(h.textContent).toContain(getContent().profile.education[0].zh);
});

test('about without a role or photo leaves no empty role tag or photo slot', () => {
  const data = structuredClone(getContent()); delete data.profile.role; data.profile.photo = null;
  const h = host(); renderAbout(h, { data, lang: 'en' });
  expect(h.querySelector('.name .role')).toBeNull();
  expect(h.querySelector('.card .ph')).toBeNull();
  data.profile.role = { en: 'Engineer' };
  renderAbout(h, { data, lang: 'en' });
  expect(h.querySelector('.name .role').textContent).toBe('Engineer');
});

test('email copy button writes to clipboard and shows copied label', async () => {
  const write = vi.fn().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: write }, configurable: true });
  const h = host(); renderAbout(h, ctx('en'));
  h.querySelector('[data-copy]').click();
  await Promise.resolve(); await Promise.resolve();
  expect(write).toHaveBeenCalledWith(getContent().profile.contacts.find(c => c.kind === 'email').value);
  expect(h.querySelector('[data-copy]').textContent).toBe(t('ui.copied', 'en'));
});

/** Click through categories -> category -> project; returns nothing, leaves the detail page open. */
function openProject(h, data, p) {
  const cats = data.projectCategories;
  h.querySelectorAll('.pf')[cats.findIndex(c => c.id === p.category)].click();
  h.querySelectorAll('.pf')[data.projects.filter(q => q.category === p.category).indexOf(p)].click();
}

test('projects open on the three categories, three projects each', () => {
  const h = host(); renderProjects(h, ctx('en'));
  expect([...h.querySelectorAll('.pf .nm')].map(n => n.textContent)).toEqual(['AI', 'Engineering', 'IT Operations']);
  const counts = getContent().projectCategories.map(c => getContent().projects.filter(p => p.category === c.id).length);
  for (const n of counts) { expect(n).toBeGreaterThan(0); expect(n).toBeLessThanOrEqual(3); }
  expect(h.querySelector('.pf .lbl').textContent).toBe('3 PROJECTS');
  expect(h.querySelector('.linkback')).toBeNull();
  h.querySelectorAll('.pf')[2].click();
  expect(h.querySelectorAll('.pf').length).toBe(counts[2]);
});

test('categories follow language', () => {
  const h = host(); renderProjects(h, ctx('zh'));
  expect(h.textContent).toContain('IT 运维');
});

test('category -> detail -> back to category -> back to categories', () => {
  const h = host(); renderProjects(h, ctx('en'));
  h.querySelectorAll('.pf')[1].click();
  expect(h.querySelector('h2').textContent).toContain('Engineering');
  expect(h.querySelectorAll('.pf').length).toBe(3);
  h.querySelectorAll('.pf')[1].click();
  const rpg = getContent().projects.find(p => p.code === 'ENG-02');
  expect(h.querySelector('h2').textContent).toContain('ENG-02');
  expect(h.querySelectorAll('.tk').length).toBe(rpg.stack.length);
  h.querySelector('.linkback').click();
  expect(h.querySelector('h2').textContent).toContain('Engineering');
  h.querySelector('.linkback').click();
  expect(h.querySelector('h2:not(.shead)')).toBeNull();
  expect([...h.querySelectorAll('.pf .nm')].map(n => n.textContent)).toEqual(['AI', 'Engineering', 'IT Operations']);
});

test('without categories the page falls back to one strip of all projects', () => {
  const data = structuredClone(getContent()); delete data.projectCategories;
  const h = host(); renderProjects(h, { data, lang: 'en' });
  expect(h.querySelectorAll('.pf').length).toBe(data.projects.length);
});

test('project without links or image omits them, never prints undefined', () => {
  const h = host(); renderProjects(h, ctx('zh'));
  openProject(h, getContent(), getContent().projects.find(p => !p.links.github && !p.image));
  expect(h.querySelector('a[data-link="github"]')).toBeNull();
  expect(h.querySelector('.detail img')).toBeNull();
  expect(h.innerHTML).not.toContain('undefined');
  expect(h.innerHTML).not.toContain('null');
});

test('stack token opens the skill note', () => {
  const h = host(); renderProjects(h, ctx('en'));
  const p = getContent().projects[0], skill = findSkill(getContent(), p.stack[0]);
  openProject(h, getContent(), p);
  h.querySelector(`.tk[data-skill="${skill.id}"]`).click();
  expect(h.querySelector('.note')).not.toBeNull();
  expect(h.querySelector('.note').textContent).toContain(skill.note.en);
});

test('skill note without years has no leading separator', () => {
  const data = structuredClone(getContent());
  const p = data.projects[0], skill = findSkill(data, p.stack[0]);
  const h = host(); delete skill.years;
  renderProjects(h, { data, lang: 'en' });
  openProject(h, data, p);
  h.querySelector(`.tk[data-skill="${skill.id}"]`).click();
  expect(h.querySelector('.note .nb').textContent).toBe(skill.note.en);
  skill.years = { en: '2 yrs' };
  renderProjects(h, { data, lang: 'en' });
  openProject(h, data, p);
  h.querySelector(`.tk[data-skill="${skill.id}"]`).click();
  expect(h.querySelector('.note .nb').textContent).toBe(`2 yrs · ${skill.note.en}`);
});

test('data text is not interpreted as markup', () => {
  const data = structuredClone(getContent());
  data.profile.bio[0] = { en: '<img src=x onerror=alert(1)>' };
  const h = host(); renderAbout(h, { data, lang: 'en' });
  expect(h.querySelector('img[src="x"]')).toBeNull();
  expect(h.textContent).toContain('<img src=x');
});

test('showNote replaces previous note; hideNotes clears', () => {
  const h = host(); const a = document.createElement('span'); h.append(a);
  showNote(h, a, { title: 'A', body: 'one' }); showNote(h, a, { title: 'B', meta: '■■□□□', body: 'two' });
  expect(h.querySelectorAll('.note').length).toBe(1);
  expect(h.querySelector('.note').textContent).toContain('■■□□□');
  hideNotes(h); expect(h.querySelector('.note')).toBeNull();
});
