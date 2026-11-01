// Dependency-free integration checks against an isolated Chrome CDP session.
// Start Chrome with --headless=new --remote-debugging-port=9237 and a separate profile.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.APP_URL || 'http://127.0.0.1:4173';
const endpoint = process.env.CDP_URL || 'http://127.0.0.1:9237';
const tabs = await (await fetch(`${endpoint}/json/list`)).json();
const target = tabs.find(tab => tab.type === 'page');
if (!target) throw new Error('No isolated browser page available');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let sequence = 0;
const pending = new Map();
const errors = [];
const failedRequests = [];
const loadResolvers = [];
let checks = 0;
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const promise = pending.get(message.id);
    if (!promise) return;
    clearTimeout(promise.timeout);
    pending.delete(message.id);
    if (message.error) promise.reject(new Error(JSON.stringify(message.error)));
    else promise.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (message.method === 'Network.loadingFailed') failedRequests.push(message.params.errorText);
  if (message.method === 'Page.loadEventFired') loadResolvers.splice(0).forEach(resolve => resolve());
});
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timeout });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function js(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.result?.description);
  return result.result.value;
}
const click = selector => js(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing '+${JSON.stringify(selector)});el.click()})()`);
const fill = (selector, value) => js(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing input');el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))})()`);
const submit = selector => js(`document.querySelector(${JSON.stringify(selector)}).requestSubmit()`);
const check = async (expression, label) => { assert.ok(await js(expression), label); checks++; console.log(`PASS ${label}`); };
const data = expression => `(()=>{const state=JSON.parse(localStorage.getItem('avito-vmeste-v1'));return ${expression}})()`;
async function waitFor(expression) {
  await js(`new Promise((resolve,reject)=>{const deadline=performance.now()+3000;function tick(){if(${expression})resolve();else if(performance.now()>deadline)reject(new Error('UI condition timed out'));else requestAnimationFrame(tick)}tick()})`);
}
async function settleMotion() {
  await waitFor(`!window.gsap||!gsap.globalTimeline.getChildren(true,true,false).some(t=>t.isActive())`);
}
async function ready() {
  await js(`new Promise((resolve,reject)=>{const end=Date.now()+10000;function test(){if(document.querySelector('#main'))resolve();else if(Date.now()>end)reject(new Error('App did not render'));else requestAnimationFrame(test)}test()})`);
  await js(`document.fonts.ready.then(()=>Promise.all([...document.images].filter(i=>i.loading!=='lazy'||(i.getClientRects().length&&i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0)).map(i=>i.decode().catch(()=>null))))`);
  await js(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
}
async function loadPage(reload = false) {
  const loaded = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Page load timed out')), 15000);
    loadResolvers.push(() => { clearTimeout(timer); resolve(); });
  });
  await cdp(reload ? 'Page.reload' : 'Page.navigate', reload ? {} : { url: origin });
  await loaded;
  await ready();
}
async function screenshot(name, width, height, settle = true) {
  await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await js('window.scrollTo(0,0)');
  await ready();
  if (settle) await settleMotion();
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(new URL(`../artifacts/${name}.png`, import.meta.url), Buffer.from(shot.data, 'base64'));
}
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
try {
  await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await loadPage();
  // Runtime.enable can replay errors from the document left by a previous run.
  errors.length = 0;
  failedRequests.length = 0;
  await js(`localStorage.removeItem('avito-vmeste-v1')`); await loadPage(true);
  await check(`window.gsap?.version==='3.15.0'`, 'local GSAP 3.15.0 loads without a CDN dependency');
  await check(`document.querySelector('.logo img').getAttribute('src')==='assets/avito-logo.svg'&&document.querySelector('.logo img').naturalWidth===109&&document.querySelector('.logo img').naturalHeight===30`, 'user-supplied SVG logo keeps its original proportions');
  await check(`document.querySelector('.topic-dropdown h1').textContent.includes('Дом на выходные')`, 'desktop opens directly into selected task');
  await check(`document.documentElement.scrollWidth<=innerWidth`, 'desktop has no horizontal overflow');
  await check(`[...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).every(i=>i.complete&&i.naturalWidth>0)`, 'visible local images load');
  await screenshot('desktop-1440', 1440, 900);
  await click('.circle-choice[data-id="birthday"]');
  await click('[data-action="item"][data-id="h"]');
  await waitFor(`document.querySelector('#modal').open`);
  await check(`(()=>{const g=document.querySelector('[data-gallery-index]');return Boolean(g)&&g.querySelectorAll('.gallery-slide').length>=2})()`, 'listing opens with a multi-photo gallery');
  await check(`document.querySelector('.gallery-slide.active').naturalWidth>=900`, 'gallery photos are served at full size');
  await click('.gallery-arrow.next');
  await check(`document.querySelector('[data-gallery-current]').textContent==='2'`, 'gallery arrow moves to the next photo');
  await click('.gallery-thumb[data-index="0"]');
  await check(`document.querySelector('[data-gallery-current]').textContent==='1'`, 'thumbnail returns to the first photo');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await check(`document.querySelector('[data-gallery-current]').textContent==='2'`, 'arrow keys switch photos');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor(`!document.querySelector('#modal').open`);
  await click('.nav-together');
  await screenshot('mobile-390', 390, 844);
  await check(`document.documentElement.scrollWidth<=innerWidth`, '390px has no horizontal overflow');
  await check(`getComputedStyle(document.querySelector('.mobile-circle-home')).display!=='none'&&getComputedStyle(document.querySelector('.topic-content')).display==='none'`, 'mobile starts with circles, not a compressed desktop board');
  await click('.mobile-circle-card[data-id="weekend"]');
  await check(`getComputedStyle(document.querySelector('.topic-content')).display!=='none'`, 'mobile circle opens its task');
  await screenshot('mobile-topic-390', 390, 844);
  await click('.back-to-circles');
  await check(`getComputedStyle(document.querySelector('.mobile-circle-home')).display!=='none'`, 'mobile back returns to circle overview');
  await click('.mobile-nav [data-action="chats"]');
  await check(`document.querySelectorAll('.chat-row').length>=3`, 'chats section lists every circle conversation');
  await screenshot('mobile-chats-390', 390, 844);
  await click('.chat-row');
  await check(`Boolean(document.querySelector('.full-chat'))&&Boolean(document.querySelector('#message-input'))`, 'chat opens straight from the chats list');
  await click('.mobile-nav [data-action="together"]');
  await check(`getComputedStyle(document.querySelector('.mobile-circle-home')).display!=='none'`, 'bottom navigation returns to circles');
  await click('.mobile-circle-card[data-id="weekend"]');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await click('[data-action="comment-item"][data-id="a"]');
  await fill('#message-input', 'Проверка: выбираем этот дом!'); await submit('#message-form');
  await check(data(`state.circles[0].messages.at(-1).item==='a'&&state.circles[0].messages.at(-1).topic==='house'`), 'comment linked to listing and topic');
  await click('.chat-all-link');
  await check(`document.querySelector('.full-chat').textContent.includes('Проверка: выбираем этот дом!')`, 'comment visible in shared chat');
  await loadPage(true);
  await check(data(`state.circles[0].messages.at(-1).text.includes('Проверка')`), 'data survives reload');
  await click('.header-actions [data-action="friends"]');
  await fill('#people-search input', '@ira.belova'); await submit('#people-search');
  await check(`document.querySelectorAll('.person-card').length===1`, 'username search');
  await click('[data-action="follow"][data-id="ira"]');
  await check(`document.querySelector('.relationship').textContent.includes('Вы друзья')`, 'mutual subscription becomes friendship');
  await click('[data-action="edit-profile"]');
  await fill('#profile-form [name="username"]', 'sasha.volkov'); await submit('#profile-form');
  await check(`document.querySelector('#profile-error').textContent.includes('занят')`, 'duplicate username rejected');
  await fill('#profile-form [name="username"]', 'nastya.demo'); await submit('#profile-form');
  await check(data(`state.profile.username==='nastya.demo'`), 'profile username saved');
  await click('.nav-together');
  await click('[data-action="new-circle"]');
  await fill('#circle-form [name="name"]', 'Тестовый круг'); await click('#circle-form [value="masha"]'); await submit('#circle-form');
  await check(data(`state.circles.at(-1).name==='Тестовый круг'&&state.circles.at(-1).members.includes('masha')`), 'circle created with invited participant');
  await click('[data-action="new-topic"]');
  await fill('#topic-form [name="name"]', 'Общая поездка'); await submit('#topic-form');
  await check(data(`state.circles.at(-1).topics[0].name==='Общая поездка'&&state.circles.length===7`), 'topic created inside existing circle');
  await click('[data-action="add-to-topic"][data-id="a"]');
  await check(data(`state.circles.at(-1).topics[0].items.includes('a')`), 'recommendation added to collection');
  await click('.rail-personal [data-action="catalog"]');
  await click('.page-title [data-action="new-topic-outside"]');
  await fill('#topic-form [name="name"]', 'Автоматический круг'); await click('#topic-form [value="sasha"]'); await submit('#topic-form');
  await check(data(`state.circles.length===8&&state.circles.at(-1).topics[0].name==='Автоматический круг'&&state.circles.at(-1).members.includes('sasha')`), 'standalone collection automatically creates circle and chat');
  await click('.circle-choice[data-id="weekend"]');
  await click('[data-action="find-more"]').catch(() => click('[data-action="board-tab"][data-id="recommend"]'));
  await check(`document.querySelectorAll('.listing-card').length===4`, 'saved search offers additional listings');
  await click('[data-action="search-settings"]');
  await fill('#saved-search-form [name="max"]', '17000'); await submit('#saved-search-form');
  await check(`document.querySelectorAll('.listing-card').length===3`, 'saved-search budget filters results');
  await click('[data-action="board-tab"][data-id="saved"]');
  await click('[data-action="vote"]');
  await fill('[name="rank0"]', 'a'); await fill('[name="rank1"]', 'a'); await fill('[name="rank2"]', 'b'); await submit('#vote-form');
  await check(`document.querySelector('#vote-error').textContent.includes('разных')`, 'duplicate top-three choices rejected');
  await fill('[name="rank1"]', 'b'); await fill('[name="rank2"]', 'd'); await submit('#vote-form');
  await check(`document.querySelector('.ranking-row').textContent.includes('11 баллов')`, 'top-three aggregate rating correct');
  await screenshot('voting-1440', 1440, 900);
  await click('#modal [data-action="choose-item"][data-id="a"]');
  await check(`document.querySelector('.bill-total').textContent.replaceAll(' ',' ').includes('20 000')`, 'bill totals two nights');
  await click('[data-action="pay-demo"]');
  await check(data(`state.circles[0].topics[0].paid.length===1&&state.circles[0].topics[0].paid[0]==='me'`), 'demo payment changes only own share');
  await screenshot('payment-1440', 1440, 900);
  await click('[data-action="close-modal"]');
  await waitFor(`!document.querySelector('#modal').open`);
  await click('[data-action="wait-item"][data-id="c"]');
  await click('[data-action="simulate-available"]');
  await click('.header-actions [data-action="notifications"]');
  await check(`document.querySelector('.notification-row').textContent.includes('Снова доступно')`, 'waitlist generates circle notification');
  await click('[data-action="open-notification"]');
  await check(`document.querySelector('.listing-card[data-listing="c"] .unavailable-badge')===null`, 'notification opens newly available listing');
  await click('[data-action="archive-topic"]'); await click('[data-action="confirm-archive"]');
  await check(`document.querySelector('.archive-list').textContent.includes('Дом на выходные')`, 'completed collection archived');
  await click('[data-action="view-archive"][data-id="house"]');
  await check(`document.querySelector('.archive-messages').textContent.includes('Проверка')`, 'archive retains listing discussion');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor(`!document.querySelector('#modal').open`);
  await check(`!document.querySelector('#modal').open`, 'dialog closes with Escape');
  await click('[data-action="restore-topic"][data-id="house"]');
  await check(`document.querySelector('.board-title').textContent.includes('Дом на выходные')`, 'archived collection restored');
  await screenshot('tablet-768', 768, 1024);
  await check(`document.documentElement.scrollWidth<=innerWidth`, '768px has no horizontal overflow');
  await screenshot('mobile-state-390', 390, 844);
  await check(`document.documentElement.scrollWidth<=innerWidth`, 'mobile post-interaction state has no horizontal overflow');
  await click('.mobile-nav [data-action="together"]');
  await click('.mobile-search-link');
  await click('[data-action="categories"]');
  await js(`Promise.all([...document.querySelectorAll('#modal img')].map(i=>i.decode()))`);
  await check(`[...document.querySelectorAll('#modal img')].length===3&&[...document.querySelectorAll('#modal img')].every(i=>i.naturalWidth>0)`, 'original Avito category illustrations load');
  await check(`document.querySelector('#modal').scrollWidth<=document.querySelector('#modal').clientWidth`, 'category dialog fits mobile viewport');
  await screenshot('categories-390', 390, 844);
  await click('[data-action="modal-category"][data-id="goods"]');
  await check(`document.querySelector('.friend-review-text').textContent.includes('Саша')`, 'friend saved listing note visible directly in search results');
  await click('.nav-together');
  await click('.mobile-circle-card[data-id="weekend"]');
  await click('.topic-dropdown > summary');
  await click('.topic-option[data-id="activities"]');
  await check(`document.querySelector('.empty-state img').getAttribute('src')==='assets/avito-services.png'`, 'collection switcher opens original illustrated empty state');
  await screenshot('empty-state-390', 390, 844);
  await click('.topic-dropdown > summary');
  await click('.topic-option[data-id="house"]');
  await check(`document.querySelector('.board-title').textContent.includes('Дом на выходные')`, 'collection selection returns to chosen task');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await settleMotion();
  await click('.circle-choice[data-id="home"]');
  await waitFor(`gsap.globalTimeline.getChildren(true,true,false).some(t=>t.isActive()&&Object.hasOwn(t.vars,'y'))`);
  await check(`gsap.globalTimeline.getChildren(true,true,false).some(t=>t.isActive()&&Object.hasOwn(t.vars,'y'))`, 'circle change creates a short GSAP entrance');
  await js(`window.__qaPaused=gsap.globalTimeline.getChildren(false,false,true).filter(t=>t.isActive());window.__qaPaused.forEach(t=>t.pause().progress(.2))`);
  await screenshot('motion-normal-1440', 1440, 900, false);
  await js(`window.__qaPaused.forEach(t=>t.play());delete window.__qaPaused`);
  await settleMotion();
  await click('.save-item');
  await check(`gsap.getTweensOf(document.querySelector('.save-item .icon')).length>0`, 'favorite action animates only the heart feedback');
  await settleMotion();
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await waitFor(`document.querySelector('#app').dataset.motion==='reduced'`);
  await click('.circle-choice[data-id="weekend"]');
  await waitFor(`gsap.globalTimeline.getChildren(true,true,false).some(t=>t.isActive())`);
  await check(`(()=>{const tweens=gsap.globalTimeline.getChildren(true,true,false).filter(t=>t.isActive());return tweens.length>0&&tweens.every(t=>!['x','y','scale','rotation'].some(key=>Object.hasOwn(t.vars,key)))})()`, 'live reduced-motion preference keeps fades and removes displacement');
  await js(`window.__qaPaused=gsap.globalTimeline.getChildren(false,false,true).filter(t=>t.isActive());window.__qaPaused.forEach(t=>t.pause().progress(.2))`);
  await screenshot('motion-reduced-1440', 1440, 900, false);
  await js(`window.__qaPaused.forEach(t=>t.play());delete window.__qaPaused`);
  await settleMotion();
  await check(`[...document.querySelectorAll('.listing-card')].every(el=>getComputedStyle(el).transform==='none')`, 'reduced-motion cards have no leftover transforms');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await waitFor(`document.querySelector('#app').dataset.motion==='full'`);
  await settleMotion();
  const pressPoint = await js(`(()=>{const r=document.querySelector('[data-action="topic-menu"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...pressPoint });
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...pressPoint });
  await check(`gsap.getTweensOf(document.querySelector('[data-action="topic-menu"]')).length>0`, 'real pointer press has immediate GSAP feedback');
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...pressPoint });
  await waitFor(`document.querySelector('#modal').open`);
  await settleMotion();
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor(`!document.querySelector('#modal').open`);
  await check(`document.activeElement.dataset.action==='topic-menu'`, 'animated modal close restores focus to its trigger');
  // An active vote intentionally locks the collection to its shared ranking.
  // Exercise manual sorting on a fresh collection before voting has started.
  await js(`localStorage.removeItem('avito-vmeste-v1')`);
  await loadPage(true);
  await settleMotion();
  await fill('#sort', 'price');
  await waitFor(`gsap.globalTimeline.getChildren(true,true,false).some(t=>t.isActive()&&t.targets().some(el=>el.matches?.('.listing-card')))`);
  await check(`gsap.globalTimeline.getChildren(true,true,false).some(t=>t.isActive()&&t.targets().some(el=>el.matches?.('.listing-card')))`, 'sorting uses FLIP-style GSAP movement');
  await settleMotion();
  await check(`gsap.globalTimeline.getChildren(true,true,false).every(t=>t.targets().every(target=>!(target instanceof Element)||target.isConnected))`, 'rerenders do not retain animated detached elements');
  assert.deepEqual(errors, [], 'No page runtime exceptions');
  assert.deepEqual(failedRequests, [], 'No failed network requests');
  console.log('PASS no runtime exceptions or failed requests');
  await writeFile(new URL('../artifacts/browser-results.json', import.meta.url), JSON.stringify({ date: new Date().toISOString(), viewports: [[1440,900],[390,844],[768,1024]], runtimeErrors: errors, failedRequests, result: 'passed', checks }, null, 2));
  // Keep initial screenshots and leave the isolated browser in its original demo state.
  await js(`localStorage.removeItem('avito-vmeste-v1')`); await loadPage(true);
} finally { ws.close(); }
