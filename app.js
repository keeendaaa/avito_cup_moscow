import { people, listings, listingById, personById, isFriend, amount, seed, rankItems, setVote, createTopic, postMessage, restoreAvailability, splitBill, listingSnapshot, listingGallery, listingDescription } from './model.mjs';
import * as motion from './motion.js';

const KEY = 'avito-vmeste-v1';
let state = seed();
let storageError = '';
try {
  const stored = localStorage.getItem(KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.version !== 1 || !Array.isArray(parsed.circles)) throw new Error('Неверный формат');
    state = parsed;
  }
} catch { storageError = 'Не удалось прочитать сохранённые данные. Показана демоверсия; изменения не будут записаны поверх ваших данных.'; }
const ui = { page: 'together', mobileHome: true, circle: 'weekend', topic: 'house', circleTab: 'topics', boardTab: 'saved', query: '', peopleQuery: '', category: 'all', reply: null, sort: 'added' };
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
let modalTrigger;
let toastTimer;
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const counted = (n, forms) => `${n} ${forms[n % 100 >= 11 && n % 100 <= 14 ? 2 : n % 10 === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 ? 1 : 2]}`;
const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2A8.5 8.5 0 0 1 21 11.5Z"/><path d="M7 10h9M7 14h6"/>',
  people: '<circle cx="9" cy="7" r="3.5"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3.5 3.5 0 0 1 0 7M19 14a6 6 0 0 1 3 5v2"/>',
  together: '<circle cx="8" cy="8" r="5"/><circle cx="16" cy="16" r="5"/><path d="m12 9 3 3M9 12l3 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  pin: '<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  vote: '<path d="M5 20V10h4v10M10 20V4h4v16M15 20V7h4v13M3 20h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  send: '<path d="m3 3 19 9-19 9 4-9-4-9ZM7 12h15"/>',
  tune: '<path d="M3 7h18M3 17h18"/><circle cx="8" cy="7" r="3" fill="white"/><circle cx="16" cy="17" r="3" fill="white"/>',
  archive: '<path d="M4 8h16v13H4zM3 3h18v5H3zM9 12h6"/>',
  shield: '<path d="m12 2 8 3v6c0 6-8 11-8 11S4 17 4 11V5l8-3Z"/><path d="m8 11 3 3 5-5"/>',
  link: '<path d="m9 15 6-6M8 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 7l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"/>',
  edit: '<path d="m16 3 5 5L9 20l-6 1 1-6L16 3ZM13 6l5 5"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  wallet: '<path d="M21 8H4a2 2 0 0 1 0-4h14v4M3 6v14h18V8M21 12h-6v5h6"/>',
  home: '<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3V10Z"/>',
  gift: '<path d="M3 8h18v5H3zM5 13v8h14v-8M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3ZM12 8h4a3 3 0 1 0-3-3l-1 3Z"/>',
  tree: '<path d="m12 2 5 6h-3l5 6h-4l5 5H4l5-5H5l5-6H7l5-6ZM12 19v3"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
const avatar = (id, cls = '') => `<img class="avatar ${cls}" src="assets/${id === 'me' ? 'me' : personById(id)?.photo || 'me'}.jpg" alt="${e(id === 'me' ? state.profile.name : personById(id)?.name)}">`;
const name = id => id === 'me' ? 'Вы' : personById(id)?.name || 'Участник';
const circle = () => state.circles.find(c => c.id === ui.circle) || state.circles[0];
const topic = () => circle().topics.find(t => t.id === ui.topic);
const available = item => state.availability[item.id] ?? item.available;
const stack = members => `<span class="avatar-stack">${members.slice(0, 4).map(id => avatar(id)).join('')}</span>`;
const circleIcon = c => icon(({ weekend: 'tree', home: 'home', birthday: 'gift' })[c.id] || 'chat');
const selected = (a, b) => a === b ? 'active' : '';
const btn = (action, text, cls = 'btn', extra = '') => `<button class="${cls}" data-action="${action}" ${extra}>${text}</button>`;

function toast(text) {
  const el = document.querySelector('#toast');
  el.textContent = text;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 4200);
}
function persist() {
  if (storageError) { toast(storageError); return; }
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { storageError = 'Хранилище недоступно. Изменения останутся только до закрытия страницы.'; toast(storageError); }
}
function navigate(page) {
  ui.page = page;
  ui.reply = null;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function header() {
  return `<header class="app-header"><div class="container product-header"><div class="header-brand"><button class="logo" data-action="together" aria-label="Авито Вместе — главная"><img src="assets/avito-logo.svg" width="109" height="30" alt="Avito"></button><button class="nav-together" data-action="together">Вместе</button></div><form id="global-search" class="header-search"><span>${icon('search')}</span><input name="query" aria-label="Поиск по объявлениям" placeholder="Найти объявление на Авито" value="${e(ui.query)}"><button aria-label="Найти">${icon('chevron')}</button></form><div class="header-actions">${btn('friends', icon('people'), 'icon-btn header-friends', 'aria-label="Найти друзей"')}${btn('notifications', `${icon('bell')}${state.notifications.some(n => !n.read) ? '<i class="notification-dot"></i>' : ''}`, 'icon-btn', 'aria-label="Уведомления"')}${btn('profile', avatar('me'), 'profile-link', 'aria-label="Мой профиль"')}</div></div></header>`;
}
function sidebar() {
  return `<aside class="sidebar"><div class="rail-heading"><h2>Мои круги</h2>${btn('new-circle', icon('plus'), 'icon-btn', 'aria-label="Создать круг"')}</div><nav class="rail-circles" aria-label="Круги">${state.circles.map(c => `<button class="circle-choice ${ui.page === 'together' ? selected(c.id, ui.circle) : ''}" data-action="circle" data-id="${c.id}" aria-pressed="${ui.page === 'together' && c.id === ui.circle}"><span class="circle-symbol">${circleIcon(c)}</span><span><strong>${e(c.name)}</strong><small>${counted(c.topics.filter(t => !t.archived).length, ['подборка', 'подборки', 'подборок'])}</small></span></button>`).join('')}</nav><div class="rail-divider"></div><nav class="rail-personal" aria-label="Личный кабинет">
    ${btn('chats', `${icon('chat')}<span>Чаты</span><span class="side-count">${state.circles.filter(c => c.messages.length).length}</span>`, `side-link ${selected(ui.page, 'chats')}`)}
    ${btn('friends', `${icon('people')}<span>Друзья</span><span class="side-count">${people.filter(p => isFriend(state, p.id)).length}</span>`, `side-link ${selected(ui.page, 'friends')}`)}
    ${btn('favorites', `${icon('heart')}<span>Избранное</span>`, `side-link ${selected(ui.page, 'favorites')}`)}
    ${btn('catalog', `${icon('search')}<span>Найти объявления</span>`, `side-link ${selected(ui.page, 'catalog')}`)}
    </nav><div class="rail-bottom"><div class="sidebar-tip">${icon('shield')}<p>Только для своих<br><span>Круги и переписки видны лишь участникам</span></p></div><button class="rail-profile" data-action="profile">${avatar('me')}<span>${e(state.profile.name)}<small>@${e(state.profile.username)}</small></span>${icon('chevron')}</button></div></aside>`;
}
function mobileCircleHome() {
  return `<section class="mobile-circle-home"><div class="mobile-home-heading"><h1>Ваши круги</h1><p>У каждого плана — свои люди</p></div><div class="mobile-circle-list">${state.circles.map(c => {
    const image = ({ weekend: 'travel', home: 'home', birthday: 'services' })[c.id];
    const last = c.messages.at(-1);
    return `<button class="mobile-circle-card" data-action="circle" data-id="${c.id}"><span class="mobile-circle-info"><strong>${e(c.name)}</strong><span>${counted(c.topics.filter(t => !t.archived).length, ['подборка', 'подборки', 'подборок'])}<span class="context-separator">·</span>${counted(c.members.length, ['участник', 'участника', 'участников'])}</span>${stack(c.members)}<small>${last ? `${e(name(last.author))}: ${e(last.text)}` : 'Можно начинать ваше общее дело'}</small></span>${image ? `<img src="assets/avito-${image}.png" class="circle-object" alt="">` : `<span class="circle-object-placeholder">${icon('together')}</span>`}${icon('chevron', 'circle-card-arrow')}</button>`;
  }).join('')}</div>${btn('new-circle', icon('plus') + ' Создать круг', 'btn btn-blue create-circle-mobile')}${btn('new-topic-outside', 'Начать с совместной подборки', 'text-button standalone-collection')}${btn('catalog', icon('search') + ' Найти объявления', 'text-button mobile-search-link')}</section>`;
}
function mobileNavigation() {
  return `<nav class="mobile-nav" aria-label="Главная навигация">${[['together', 'together', 'Круги'], ['chats', 'chat', 'Чаты'], ['friends', 'people', 'Друзья'], ['profile', 'user', 'Профиль']].map(([action, symbol, label]) => `<button data-action="${action}" class="${ui.page === action ? 'active' : ''}" ${ui.page === action ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span></button>`).join('')}</nav>`;
}
function together() {
  const c = circle();
  const t = topic();
  return `${mobileCircleHome()}<section class="topic-content"><div class="circle-context">${btn('circles-home', icon('chevron') + e(c.name), 'back-to-circles')}<span>Только участники круга</span></div>
    ${ui.circleTab !== 'topics' ? `<div class="section-back">${btn('back-topics', '← К подборке', 'text-button')}<h1>${ui.circleTab === 'archive' ? 'Архив круга' : ui.circleTab === 'chat' ? 'Чат круга' : 'Участники'}</h1></div>` : ''}
    ${ui.circleTab === 'chat' ? `<div class="full-chat">${chat(c, true)}</div>` : ui.circleTab === 'members' ? membersView(c) : ui.circleTab === 'archive' ? archiveView(c) : t && !t.archived ? board(c, t) : `<div class="page-title"><h1>${e(c.name)}</h1>${btn('members', icon('people'), 'icon-btn', 'aria-label="Участники круга"')}</div><div class="empty-circle-actions">${btn('open-chat', icon('chat') + ' Чат круга', 'text-button')}${c.topics.some(x => x.archived) ? btn('circle-tab', icon('archive') + ' Архив', 'text-button', 'data-id="archive"') : ''}</div>${empty('Какие у вас планы?', 'Начните с одной задачи: соберите варианты, обсудите и выберите вместе.', 'Создать подборку', 'new-topic')}`}
  </section>`;
}
function board(c, t) {
  const waiting = t.wait.length;
  let items = t.items.map(listingById).filter(Boolean);
  if (ui.boardTab === 'recommend') items = listings.filter(item => item.type === t.search.type && item.price <= t.search.max && !t.items.includes(item.id) && matches(item, t.search.query));
  if (ui.boardTab === 'waiting') items = t.wait.map(listingById);
  if (t.voting || ui.sort === 'rating') {
    const ranks = rankItems(t);
    items.sort((a, b) => ranks.findIndex(r => r.id === a.id) - ranks.findIndex(r => r.id === b.id));
  } else if (ui.sort === 'price') items.sort((a, b) => a.price - b.price);
  return `<div class="board-main"><div class="board-title"><div class="topic-title-group"><details class="topic-dropdown"><summary><h1>${e(t.name)}</h1>${icon('down')}</summary><div class="topic-dropdown-menu">${c.topics.filter(x => !x.archived).map(x => btn('topic', `${icon(x.id === t.id ? 'check' : 'grid')}<span>${e(x.name)}</span>`, 'topic-option', `data-id="${x.id}"`)).join('')}${btn('new-topic', icon('plus') + ' Новая подборка', 'topic-option')}${btn('circle-tab', icon('archive') + ' Архив круга', 'topic-option', 'data-id="archive"')}</div></details><div class="topic-meta"><span>${e(c.name)}</span><span class="meta-dot"></span><span>${t.search.type === 'travel' ? '14–16 ноября' : typeLabel(t.search.type)}</span>${btn('search-settings', icon('tune'), 'icon-btn', 'aria-label="Настроить поиск подборки"')}</div></div><div class="board-title-actions">${btn('members', stack(c.members), 'members-button', 'aria-label="Участники круга"')}${btn('topic-menu', icon('more'), 'icon-btn', 'aria-label="Настройки подборки и круга"')}</div></div>${t.chosen ? `<div class="chosen-banner">${icon('check')}<div><strong>Вы выбрали: ${e(listingById(t.chosen).title)}</strong><span>Разделите счёт и договоритесь с продавцом</span></div>${btn('payment', 'Разделить счёт', 'btn btn-dark')}</div>` : ''}
    <div class="board-toolbar"><div class="segmented" role="tablist" aria-label="Объявления в подборке">${[['saved', 'Подборка', t.items.length], ['recommend', 'Найти ещё', null], ...(waiting || ui.boardTab === 'waiting' ? [['waiting', 'Ждём', waiting]] : [])].map(([key, label, count]) => `<button role="tab" aria-selected="${ui.boardTab === key}" class="${selected(ui.boardTab, key)}" data-action="board-tab" data-id="${key}">${key === 'waiting' ? icon('clock') : ''}${label}${count ? ` <span>${count}</span>` : ''}</button>`).join('')}</div><div class="board-tools">${btn('topic-chat', icon('chat') + '<span>Обсудить</span>', 'btn btn-soft open-discussion', 'aria-label="Обсуждение подборки"')}${t.items.length >= 3 ? btn('vote', icon('vote') + (t.voting ? ' Мой топ-3' : ' Выбрать топ-3'), 'btn btn-dark vote-button') : ''}</div></div>
    ${ui.boardTab === 'recommend' ? `<div class="saved-search">${icon('bell')}<div><strong>Сохранённый поиск</strong><span>${e(t.search.query || typeLabel(t.search.type))} · до ${amount(t.search.max)} · ${e(t.search.location)}</span></div>${btn('search-settings', icon('tune'), 'icon-btn', 'aria-label="Настроить сохранённый поиск"')}</div>` : ui.boardTab === 'waiting' ? `<p class="board-context">Когда вариант появится снова — уведомим весь круг</p>` : ''}
    ${t.voting ? `<div class="vote-summary">${icon('vote')}<span><strong>Выбираем вместе</strong> · ${Object.keys(t.votes).length} из ${c.members.length} проголосовали</span>${btn('vote-results', 'Результаты ' + icon('chevron'), 'text-button')}</div>` : ''}
    <div class="results-heading"><span class="muted">${counted(items.length, ['вариант', 'варианта', 'вариантов'])}</span><select id="sort" aria-label="Сортировать объявления"><option value="added" ${ui.sort === 'added' ? 'selected' : ''}>По добавлению</option><option value="price" ${ui.sort === 'price' ? 'selected' : ''}>Сначала дешевле</option><option value="rating" ${ui.sort === 'rating' ? 'selected' : ''}>По общему рейтингу</option></select></div>
    ${items.length ? `<div class="listing-grid">${items.map(item => listingCard(item, t, ui.boardTab === 'recommend')).join('')}</div>` : empty(ui.boardTab === 'waiting' ? 'Пока ничего не ждёте' : ui.boardTab === 'recommend' ? 'Все подходящие варианты уже здесь' : 'Сначала найдём что-нибудь хорошее', ui.boardTab === 'waiting' ? 'У недоступного объявления нажмите «Хочу такое же».' : 'Откройте поиск и добавьте объявления в подборку.', ui.boardTab === 'recommend' ? 'Изменить поиск' : 'Найти объявления', ui.boardTab === 'recommend' ? 'search-settings' : 'find-more')}
    <div class="board-bottom">${btn('new-topic-outside', icon('plus') + ' Новая совместная подборка', 'text-button')}${btn('archive-topic', 'Завершить подборку ' + icon('check'), 'text-button')}</div></div>`;
}
function typeLabel(type) { return { travel: 'Жильё и поездки', goods: 'Товары', service: 'Услуги', auto: 'Автомобили', realty: 'Недвижимость', business: 'Готовый бизнес' }[type] || 'Все категории'; }
function photoPlaceholder(item) {
  return `<div class="photo-placeholder" role="img" aria-label="Фотографии объявления на Авито">${icon('grid')}<span>Фото в объявлении</span></div>`;
}
function galleryMarkup(item) {
  const images = listingGallery(item).filter(Boolean);
  if (!images.length) return photoPlaceholder(item);
  if (images.length < 2) return `<img class="detail-image" src="assets/${images[0]}.jpg" alt="${e(item.title)}">`;
  return `<div class="gallery" data-gallery-index="0"><div class="gallery-stage"><div class="gallery-track">${images.map((src, i) => `<img class="gallery-slide${i === 0 ? ' active' : ''}" src="assets/${src}.jpg" alt="${e(item.title)} — фото ${i + 1}" ${i ? 'loading="lazy"' : ''} draggable="false">`).join('')}</div><span class="gallery-counter"><span data-gallery-current>1</span> / ${images.length}</span><button class="gallery-arrow prev" data-action="gallery-step" data-step="-1" aria-label="Предыдущее фото">${icon('chevron')}</button><button class="gallery-arrow next" data-action="gallery-step" data-step="1" aria-label="Следующее фото">${icon('chevron')}</button></div><div class="gallery-thumbs" role="tablist" aria-label="Фотографии объявления">${images.map((src, i) => `<button class="gallery-thumb${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" data-action="gallery-dot" data-index="${i}" aria-label="Фото ${i + 1}"><img src="assets/${src}.jpg" alt="" loading="lazy"></button>`).join('')}</div></div>`;
}
function setGallery(box, index) {
  const slides = [...box.querySelectorAll('.gallery-slide')];
  if (!slides.length) return;
  const i = Math.max(0, Math.min(index, slides.length - 1));
  box.dataset.galleryIndex = String(i);
  box.querySelector('.gallery-track').style.transform = `translateX(${-i * 100}%)`;
  slides.forEach((slide, n) => slide.classList.toggle('active', n === i));
  box.querySelectorAll('.gallery-thumb').forEach((thumb, n) => { thumb.classList.toggle('active', n === i); thumb.setAttribute('aria-selected', String(n === i)); });
  const counter = box.querySelector('[data-gallery-current]');
  if (counter) counter.textContent = String(i + 1);
}
function galleryStep(delta) {
  const box = modal.querySelector('[data-gallery-index]');
  if (!box) return;
  const count = box.querySelectorAll('.gallery-slide').length;
  if (!count) return;
  setGallery(box, (Number(box.dataset.galleryIndex) + delta + count) % count);
}
function matches(item, query) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  return !words.length || words.some(w => `${item.title} ${item.location} ${item.details}`.toLowerCase().includes(w));
}
function listingCard(item, t, recommend = false, catalog = false) {
  const isAvailable = available(item);
  const rank = t ? rankItems(t).find(r => r.id === item.id) : null;
  const mine = t?.votes.me?.indexOf(item.id);
  const comments = t ? circle().messages.filter(m => m.item === item.id && m.topic === t.id).length : 0;
  const friend = item.friend && isFriend(state, item.friend);
  return `<article class="listing-card ${!isAvailable ? 'unavailable' : ''}" data-listing="${item.id}"><div class="listing-image"><button class="image-open" data-action="item" data-id="${item.id}" aria-label="${e(item.title)}">${listingGallery(item).filter(Boolean).length ? `<img src="assets/${listingGallery(item)[0]}.jpg" alt="${e(item.title)}" loading="lazy">` : photoPlaceholder(item)}</button>${listingGallery(item).filter(Boolean).length > 1 ? `<span class="photo-count">${icon('grid')}${listingGallery(item).filter(Boolean).length}</span>` : ''}${item.badge && !catalog ? `<span class="activity-badge">${item.badgeType === 'gray' ? icon('close') : avatar(({ purple: 'masha', blue: 'sasha', green: 'dima' })[item.badgeType])}${item.badge}</span>` : ''}${btn('save-item', icon('heart'), `save-item ${state.saved.includes(item.id) ? 'saved' : ''}`, `data-id="${item.id}" aria-label="${state.saved.includes(item.id) ? 'Убрать из избранного' : 'В избранное'}" aria-pressed="${state.saved.includes(item.id)}"`)}${!isAvailable ? '<span class="unavailable-badge">Недоступно в демо</span>' : ''}${t?.voting && mine >= 0 ? `<span class="my-rank">Мой № ${mine + 1}</span>` : ''}</div><button class="listing-title" data-action="item" data-id="${item.id}">${e(item.title)}</button><div class="price">${item.from ? 'от ' : ''}${amount(item.price)}${item.type === 'travel' ? '<span> / сутки</span>' : item.type === 'service' ? '<span> / час</span>' : ''}</div><p class="listing-details">${e(item.details)}</p><p class="listing-location">${e(item.location)}</p><p class="listing-description">${e(listingDescription(item))}</p><div class="seller-line">Источник: Авито<span class="muted"> · снимок ${listingSnapshot}</span></div>
    ${friend && catalog && item.note ? `<p class="friend-review-text">${e(item.note)}</p>` : ''}
    ${t?.voting && rank?.count >= 2 ? `<div class="match-label">${icon('people')}${rank.count === 2 ? 'Оба в топе' : `У ${rank.count} в топе`} <span>${rank.score} баллов</span></div>` : ''}
    <div class="card-actions">${catalog || recommend ? btn('add-to-topic', icon('plus') + ' В подборку', 'add-button', `data-id="${item.id}"`) : !isAvailable ? btn('wait-item', icon('bell') + (t.wait.includes(item.id) ? ' Ждём вместе' : ' Хочу такое же'), `wait-button ${t.wait.includes(item.id) ? 'waiting' : ''}`, `data-id="${item.id}" aria-pressed="${t.wait.includes(item.id)}"`) : btn('comment-item', icon('chat') + (comments ? ` ${comments} · Обсудить` : ' Обсудить'), 'comment-button', `data-id="${item.id}"`)}${t?.voting && isAvailable && !t.chosen ? btn('choose-item', icon('check'), 'icon-btn choose-item', `data-id="${item.id}" aria-label="Выбрать этот вариант"`) : ''}</div></article>`;
}
function chat(c, full = false, scoped = false) {
  const messages = full && !scoped ? c.messages : c.messages.filter(m => !m.topic || m.topic === ui.topic);
  return `<div class="chat-heading"><div><h3>${full ? 'Общий чат' : 'Обсуждение'}</h3><span class="muted">${full ? e(c.name) : 'Всё о вашей подборке'}</span></div>${full ? stack(c.members) : btn('open-chat', icon('chevron'), 'icon-btn', 'aria-label="Открыть общий чат"')}</div><div class="chat-messages" id="chat-messages"><span class="chat-day">Сегодня</span>${messages.length ? messages.map(m => `<div class="message ${m.author === 'me' ? 'own' : ''}" data-message="${e(m.id)}">${avatar(m.author)}<div class="message-content"><div class="message-author">${e(name(m.author))}<time>${m.time}</time></div>${m.item ? `<button class="message-quote" data-action="item" data-id="${m.item}"><img src="assets/${listingById(m.item).image}.jpg" alt=""><span>${e(listingById(m.item).title)}<b>${amount(listingById(m.item).price)}</b></span></button>` : ''}<p>${e(m.text)}</p></div></div>`).join('') : '<p class="chat-empty">В этом круге пока тихо<br>Напишите первое сообщение</p>'}</div><div class="chat-composer">${ui.reply ? `<div class="reply-preview">${icon('chat')}<span>К объявлению: ${e(listingById(ui.reply).title)}</span>${btn('cancel-reply', icon('close'), 'icon-btn', 'aria-label="Отменить ответ"')}</div>` : ''}<form id="message-form" class="message-form"><input name="message" id="message-input" placeholder="${ui.reply ? 'Ваш комментарий' : 'Сообщение'}" aria-label="Сообщение в круг" required maxlength="2000" autocomplete="off"><button aria-label="Отправить сообщение">${icon('send')}</button></form><div class="chat-footer">${icon('shield')} Только участники круга</div></div>`;
}
function empty(title, description, label, action) {
  const illustration = ui.page === 'together' && topic() ? ({ travel: 'travel', goods: 'home', service: 'services' })[topic().search.type] : null;
  return `<div class="empty-state">${illustration ? `<img class="empty-illustration" src="assets/avito-${illustration}.png" width="164" height="104" alt="">` : '<span class="empty-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'}<h3>${title}</h3><p>${description}</p>${label ? btn(action, label, 'btn btn-blue') : ''}</div>`;
}
function membersView(c) {
  return `<div class="member-list">${c.members.map(id => `<div class="member-row">${avatar(id)}<div><strong>${e(id === 'me' ? state.profile.name : personById(id)?.full)}</strong><span class="muted">@${e(id === 'me' ? state.profile.username : personById(id)?.username)}</span></div><span class="member-role">${id === 'me' ? 'Создатель круга' : isFriend(state, id) ? 'Ваш друг' : 'Участник'}</span></div>`).join('')}${btn('members', icon('plus') + ' Пригласить участников', 'btn btn-blue')}</div>`;
}
function archiveView(c) {
  const archived = c.topics.filter(t => t.archived);
  return archived.length ? `<div class="archive-list"><p class="muted">Задачи решены. Объявления и обсуждения остались здесь, а не в профиле.</p>${archived.map(t => `<div class="archive-row"><span class="archive-icon">${icon('check')}</span><div><h3>${e(t.name)}</h3><span class="muted">${t.items.length} объявлений · обсуждение сохранено</span></div>${btn('view-archive', 'Посмотреть', 'btn btn-soft', `data-id="${t.id}"`)}${btn('restore-topic', 'Вернуть', 'text-button', `data-id="${t.id}"`)}</div>`).join('')}</div>` : empty('Пока нет завершённых задач', 'Когда выберете вариант, закройте подборку — она останется здесь.');
}
function friends() {
  const results = people.filter(p => `${p.name} ${p.full} ${p.username}`.toLowerCase().includes(ui.peopleQuery.toLowerCase().replace(/^@/, '')));
  return `<div class="page-title"><div><h1>Друзья</h1><p class="muted">Своим рекомендациям доверяешь больше</p></div>${btn('edit-profile', icon('edit') + ' Мой юзернейм', 'btn btn-soft')}</div><div class="friends-intro">${icon('people')}<div><h2>Находите друг друга по @юзернейму</h2><p>Подпишитесь на человека. Когда подписка взаимная — вы друзья.<br>Друзья сохраняют находки в свои подборки — они появятся здесь.</p></div></div><form id="people-search" class="people-search"><label class="search-field">${icon('search')}<input name="people" placeholder="Имя или @юзернейм" aria-label="Найти человека" value="${e(ui.peopleQuery)}"></label><button class="btn btn-blue">Найти</button></form><div class="section-heading"><h2>${ui.peopleQuery ? 'Результаты поиска' : 'Ваши люди'}</h2><span class="muted">${people.filter(p => isFriend(state, p.id)).length} друзей · ${state.following.length} подписок</span></div><div class="people-grid">${results.map(p => `<article class="person-card">${avatar(p.id, 'large')}<h3>${e(p.full)}</h3><p class="muted">@${p.username}</p><span class="relationship">${isFriend(state, p.id) ? `${icon('check')} Вы друзья` : p.followsMe ? 'Подписан(а) на вас' : 'Пользователь Авито'}</span>${btn('follow', state.following.includes(p.id) ? 'Вы подписаны' : 'Подписаться', `btn ${state.following.includes(p.id) ? 'btn-soft' : 'btn-blue'}`, `data-id="${p.id}" aria-pressed="${state.following.includes(p.id)}"`)}</article>`).join('') || '<p class="empty-text">Никого не нашли. Попробуйте @ira.belova или другое имя из демоверсии.</p>'}</div><div class="section-heading"><h2>Друзья рекомендуют</h2>${btn('friend-catalog', 'Все рекомендации ' + icon('chevron'), 'text-button')}</div><div class="listing-grid friends-listings">${listings.filter(item => item.friend && isFriend(state, item.friend)).map(item => listingCard(item, null, false, true)).join('') || '<p class="muted">У ваших друзей пока нет сохранённых находок.</p>'}</div>`;
}
function catalog(favorites = false) {
  let items = listings.filter(item => matches(item, ui.query) && (ui.category === 'all' || item.type === ui.category));
  if (favorites) items = listings.filter(item => state.saved.includes(item.id));
  if (ui.page === 'friend-catalog') items = items.filter(item => item.friend && isFriend(state, item.friend));
  return `<div class="page-title"><div><h1>${favorites ? 'Избранное' : ui.page === 'friend-catalog' ? 'Рекомендации друзей' : ui.query ? `Поиск: ${e(ui.query)}` : 'Находки для ваших планов'}</h1><p class="muted">${favorites ? 'Ваше личное избранное' : `Реальные объявления Авито · снимок ${listingSnapshot}`}</p></div>${btn('new-topic-outside', icon('plus') + ' Совместная подборка', 'btn btn-blue')}</div>${!favorites ? `<div class="catalog-search-row"><form id="catalog-search" class="catalog-search"><span>${icon('search')}</span><input name="query" aria-label="Поиск объявлений" placeholder="Что ищем?" value="${e(ui.query)}"><button class="btn btn-blue">Найти</button></form>${btn('categories', icon('grid'), 'btn btn-soft', 'aria-label="Выбрать категорию"')}</div><div class="catalog-categories">${[['all', 'Все'], ['travel', 'Жильё'], ['realty', 'Недвижимость'], ['auto', 'Авто'], ['goods', 'Товары'], ['service', 'Услуги'], ['business', 'Бизнес']].map(([id, label]) => btn('catalog-filter', label, `btn ${ui.category === id ? 'btn-dark' : 'btn-soft'}`, `data-id="${id}"`)).join('')}</div>` : ''}<div class="listing-grid catalog-grid">${items.map(item => listingCard(item, null, false, true)).join('')}</div>${!items.length ? empty(favorites ? 'Здесь будут ваши находки' : 'Ничего не нашли', 'Попробуйте другой запрос или сохраните понравившееся объявление.', 'Смотреть объявления', 'catalog') : ''}`;
}
function profile() {
  return `<div class="page-title"><div><h1>Мой профиль</h1><p class="muted">На Авито проще находить не только вещи, но и своих</p></div></div><section class="profile-page">${avatar('me', 'profile-big')}<div><h2>${e(state.profile.name)}</h2><p class="muted">@${e(state.profile.username)}</p><div class="my-rating"><b>5,0</b> <span class="stars">★★★★★</span> 12 отзывов</div>${btn('edit-profile', icon('edit') + ' Редактировать профиль', 'btn btn-blue')}</div></section><div class="profile-stats"><div><b>${people.filter(p => isFriend(state, p.id)).length}</b><span>друзей</span></div><div><b>${state.following.length}</b><span>подписок</span></div><div><b>${people.filter(p => p.followsMe).length}</b><span>подписчика</span></div></div><div class="profile-private">${icon('shield')}<div><h3>Профиль — про вас. Круги — для своих</h3><p>Совместные подборки, покупки и переписки не видны посетителям профиля. Всё остаётся внутри круга.</p></div></div><nav class="profile-links" aria-label="Личные разделы">${btn('favorites', icon('heart') + '<span>Избранное</span>' + icon('chevron'), 'profile-section-link')}${btn('friends', icon('people') + '<span>Найти друзей</span>' + icon('chevron'), 'profile-section-link')}</nav>`;
}
function chatPreview(c) {
  const last = c.messages.at(-1);
  return last ? `${name(last.author)}: ${last.text}` : 'Пока нет сообщений';
}
function chats() {
  const order = [...state.circles].sort((a, b) => (b.messages.at(-1)?.time || '').localeCompare(a.messages.at(-1)?.time || ''));
  return `<div class="page-title"><div><h1>Чаты</h1><p class="muted">Переписка ваших кругов — без подборок и объявлений</p></div></div><div class="chat-directory">${order.map(c => {
    const last = c.messages.at(-1);
    return `<button class="chat-row" data-action="open-circle-chat" data-id="${c.id}"><span class="chat-row-icon">${icon('chat')}</span><span class="chat-row-body"><span class="chat-row-top"><strong>${e(c.name)}</strong><time>${last ? last.time : ''}</time></span><span class="chat-row-text">${e(chatPreview(c))}</span><span class="chat-row-meta">${counted(c.members.length, ['участник', 'участника', 'участников'])} · ${counted(c.messages.length, ['сообщение', 'сообщения', 'сообщений'])}</span></span>${icon('chevron')}</button>`;
  }).join('')}</div>${btn('friends', icon('people') + ' Найти друзей', 'btn btn-soft chats-friends')}`;
}
function notifications() {
  return `<div class="page-title"><div><h1>Уведомления</h1><p class="muted">Важное для вас и вашего круга</p></div>${btn('read-notifications', 'Прочитать все', 'text-button')}</div>${state.notifications.length ? `<div class="notification-list">${state.notifications.map(n => `<button class="notification-row ${n.read ? '' : 'unread'}" data-action="open-notification" data-id="${n.id}"><span class="notification-symbol">${icon('bell')}</span><span><strong>${e(n.title)}</strong><span>${e(n.text)}</span><small>Уведомление для ${n.recipients.length} участников круга · деморежим</small></span>${icon('chevron')}</button>`).join('')}</div>` : empty('Всё спокойно', 'Здесь появятся сообщения о вариантах из листа ожидания.', 'Вернуться в круг', 'together')}`;
}
function render() {
  const before = motion.beforeView(app);
  const pages = { together, friends, profile, chats, catalog: () => catalog(), favorites: () => catalog(true), 'friend-catalog': () => catalog(), notifications };
  document.title = `${{ together: 'Вместе', friends: 'Друзья', profile: 'Мой профиль', chats: 'Чаты', favorites: 'Избранное', notifications: 'Уведомления' }[ui.page] || 'Объявления'} — Авито`;
  app.innerHTML = `${header()}<div class="container app-layout">${sidebar()}<main id="main" class="${ui.mobileHome ? 'mobile-home-visible' : ''}" tabindex="-1">${storageError ? `<div class="error-banner">${e(storageError)}</div>` : ''}${(pages[ui.page] || together)()}</main></div>${ui.circleTab === 'chat' ? '' : `<footer class="container footer"><span>Авито Вместе · учебный прототип</span><span>Демо. Не является официальным сервисом Авито</span>${btn('about', 'О прототипе', 'text-button')}</footer>`}${mobileNavigation()}`;
  motion.enterView(app, JSON.stringify([ui.page, ui.circle, ui.topic, ui.circleTab, ui.boardTab, ui.mobileHome, ui.query, ui.peopleQuery, ui.category]), before);
  if (ui.circleTab === 'chat') { const box = document.querySelector('#chat-messages'); if (box) box.scrollTop = box.scrollHeight; }
}
function openModal(title, content, cls = '') {
  const before = motion.beforeModal(modal);
  if (!modal.open) modalTrigger = document.activeElement;
  modal.className = cls;
  modal.innerHTML = `<div class="modal-heading"><h2 id="modal-title">${title}</h2>${btn('close-modal', icon('close'), 'icon-btn', 'aria-label="Закрыть окно"')}</div>${content}`;
  if (!modal.open) modal.showModal();
  const contentKind = modal.querySelector('form')?.id || (modal.querySelector('.ranking-list') ? 'ranking' : modal.querySelector('.bill-shares') ? 'payment' : 'detail');
  motion.enterModal(modal, `${title}|${cls}|${contentKind}`, before);
}
function closeModal() { motion.resetModal(); modal.close(); }
function openTopicChat() {
  openModal(e(topic().name), `<div class="modal-chat">${chat(circle(), true, true)}</div>${btn('open-chat', 'Весь чат круга ' + icon('chevron'), 'text-button chat-all-link')}`, 'wide-modal');
  document.querySelector('#message-input')?.focus();
  const messages = document.querySelector('#chat-messages');
  messages.scrollTop = messages.scrollHeight;
}
let gallerySwipe = null;
modal.addEventListener('pointerdown', event => { gallerySwipe = event.target.closest('.gallery-stage') ? event.clientX : null; });
modal.addEventListener('pointerup', event => { if (gallerySwipe === null) return; const dx = event.clientX - gallerySwipe; gallerySwipe = null; if (Math.abs(dx) > 40) galleryStep(dx < 0 ? 1 : -1); });
modal.addEventListener('close', () => { if (modal.open) return; motion.resetModal(); if (modalTrigger?.isConnected) modalTrigger.focus(); });
modal.addEventListener('cancel', event => { event.preventDefault(); motion.closeDialog(modal); });
modal.addEventListener('click', event => { if (event.target === modal) { const r = modal.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) motion.closeDialog(modal); } });
const input = (label, name, value = '', attributes = '') => `<label class="form-label">${label}<input name="${name}" value="${e(value)}" ${attributes}></label>`;
const typeSelect = value => `<label class="form-label">Что будем выбирать<select name="type">${[['travel', 'Жильё для поездки'], ['goods', 'Товары'], ['service', 'Услуги']].map(([id, label]) => `<option value="${id}" ${id === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`;
function memberPicker(members = []) {
  return `<div class="member-picker">${people.map(p => `<label>${avatar(p.id)}<span><strong>${e(p.name)}</strong><small>@${p.username}</small></span><input type="checkbox" name="members" value="${p.id}" ${members.includes(p.id) ? 'checked' : ''}></label>`).join('')}</div>`;
}
function topicModal(outside = false) {
  openModal('Новая совместная подборка', `<p class="modal-intro">Одна задача, все варианты и общее обсуждение.</p><form id="topic-form">${input('Название подборки', 'name', '', 'required maxlength="80" placeholder="Например, едем в горы"')}<label class="form-label">Где создать<select name="circle"><option value="new" ${outside ? 'selected' : ''}>Новый круг — создастся автоматически</option>${state.circles.map(c => `<option value="${c.id}" ${!outside && c.id === ui.circle ? 'selected' : ''}>${e(c.name)}</option>`).join('')}</select></label>${typeSelect('travel')}<details ${outside ? 'open' : ''}><summary>Участники нового круга</summary>${memberPicker()}</details><p class="form-help">При выборе существующего круга подборку увидят его участники.</p><button class="btn btn-blue form-submit">Создать подборку</button></form>`);
}
function itemModal(id) {
  const item = listingById(id);
  openModal(e(item.title), `${galleryMarkup(item)}<div class="detail-price">${item.from ? 'от ' : ''}${amount(item.price)} <span class="muted">${item.type === 'travel' ? 'за сутки' : item.type === 'service' ? 'за час' : ''}</span></div><p>${e(item.details)}</p><p class="muted">${icon('pin')}${e(item.location)}</p><p class="detail-description">${e(listingDescription(item))}</p><div class="detail-seller">${icon('shield')}<span>Публичное объявление Авито · снимок ${listingSnapshot}</span></div>${item.friend && isFriend(state, item.friend) && item.note ? `<div class="review-expanded">${avatar(item.friend)}<div><strong>${name(item.friend)} сохранил(а) это объявление</strong><p>${e(item.note)}</p><span class="muted">Социальная активность в прототипе демонстрационная</span></div></div>` : ''}<div class="detail-actions">${btn('add-to-topic', icon('plus') + ' Добавить в подборку', 'btn btn-blue', `data-id="${id}"`)}${topic()?.items.includes(id) && !topic().archived ? btn(available(item) ? 'comment-item' : 'wait-item', available(item) ? 'Обсудить' : 'Хочу такое же', 'btn btn-soft', `data-id="${id}"`) : ''}<a class="btn btn-soft" href="${e(item.url)}" target="_blank" rel="noopener noreferrer">Открыть на Авито</a></div><p class="form-help">Название, цена, адрес и фото — с публичной страницы объявления. Снимок ${listingSnapshot}: цена и доступность на Авито могли измениться. Бронирование, оплата и связь с продавцом в прототипе не подключены.</p>`, 'wide-modal');
}
function voteModal() {
  const t = topic();
  if (!t || t.archived) { toast('Сначала откройте активную подборку'); return; }
  if (t.items.length < 3) { toast('Для топ-3 добавьте хотя бы три объявления'); return; }
  openModal('Ваши три фаворита', `<p class="modal-intro">Расставьте варианты: 1-е место — 3 балла, 2-е — 2, 3-е — 1. Общий рейтинг посчитаем сами.</p><form id="vote-form"><label class="form-label demo-actor">Участник · деморежим<select name="actor" id="vote-actor">${circle().members.map(id => `<option value="${id}">${e(name(id))}</option>`).join('')}</select></label><div id="vote-selects">${voteSelects('me')}</div><p id="vote-error" class="form-error" role="alert"></p><button class="btn btn-blue form-submit">Сохранить топ-3</button></form><p class="form-help">В настоящем продукте каждый голосует только за себя. Здесь можно переключить участника, чтобы проверить механику.</p>`);
}
function voteSelects(actor) {
  return [0, 1, 2].map(i => `<label class="rank-select"><span class="rank-number rank-${i}">${i + 1}</span><select name="rank${i}" required aria-label="${i + 1}-е место"><option value="">Выберите вариант</option>${topic().items.map(id => `<option value="${id}" ${topic().votes[actor]?.[i] === id ? 'selected' : ''}>${e(listingById(id).title)}</option>`).join('')}</select></label>`).join('');
}
function resultsModal() {
  const t = topic();
  openModal('Где ваши желания совпали', `<p class="modal-intro">${Object.keys(t.votes).length} из ${circle().members.length} участников проголосовали. 3, 2 и 1 балл за места в личном топе.</p><div class="ranking-list">${rankItems(t).map((r, i) => `<div class="ranking-row"><b class="rank-position">${i + 1}</b><img src="assets/${listingById(r.id).image}.jpg" alt=""><div><strong>${e(listingById(r.id).title)}</strong><span class="muted">${r.count >= 2 ? `${r.count === 2 ? 'Оба в топе' : `У ${r.count} в топе`} · ` : ''}${r.score} баллов</span></div>${available(listingById(r.id)) ? btn('choose-item', 'Выбрать', 'btn btn-soft', `data-id="${r.id}"`) : '<small class="muted">Забронировано</small>'}</div>`).join('')}</div>`,'wide-modal');
}
function paymentModal() {
  const t = topic();
  const item = listingById(t?.chosen);
  if (!item) return;
  const total = item.price * t.nights;
  const shares = splitBill(total, circle().members);
  openModal('Разделить счёт', `<div class="payment-item"><img src="assets/${item.image}.jpg" alt=""><div><strong>${e(item.title)}</strong><span class="muted">${item.type === 'travel' ? `${t.nights} ночи · ` : ''}${circle().members.length} участника</span></div></div><div class="bill-total"><span>Всего</span><strong>${amount(total)}</strong></div><div class="bill-shares">${shares.map(s => `<div>${avatar(s.id)}<span>${e(name(s.id))}${s.id === 'me' ? ' · ваша доля' : ''}</span><b>${amount(s.amount)}</b><span class="${t.paid.includes(s.id) ? 'paid-label' : 'muted'}">${t.paid.includes(s.id) ? 'Оплачено · демо' : 'Ожидает'}</span></div>`).join('')}</div><div class="demo-warning">${icon('shield')}<span><strong>Демонстрация совместной оплаты</strong><br>Деньги не списываются. Платёжный партнёр не подключён.</span></div>${btn('pay-demo', t.paid.includes('me') ? 'Ваша доля оплачена · демо' : `Оплатить свою долю ${amount(shares.find(s => s.id === 'me').amount)} · демо`, 'btn btn-blue form-submit', t.paid.includes('me') ? 'disabled' : '')}<p class="form-help">Каждый платит только за себя. В прототипе статусы остальных участников не изменяются автоматически.</p>${btn('archive-topic', 'Задача решена — в архив', 'text-button form-submit')}`, 'wide-modal');
}

const actions = {
  together: () => { ui.mobileHome = true; navigate('together'); }, friends: () => navigate('friends'), profile: () => navigate('profile'), favorites: () => navigate('favorites'), notifications: () => navigate('notifications'),
  'circles-home': () => { ui.mobileHome = true; navigate('together'); },
  'back-topics': () => { ui.circleTab = 'topics'; render(); },
  chats: () => navigate('chats'),
  'open-circle-chat': el => { ui.circle = el.dataset.id; ui.topic = circle().topics.find(t => !t.archived)?.id; ui.circleTab = 'chat'; ui.mobileHome = false; ui.reply = null; navigate('together'); },
  catalog: el => { ui.category = el.dataset.category || 'all'; ui.query = ''; navigate('catalog'); },
  'friend-catalog': () => { ui.category = 'all'; ui.query = ''; navigate('friend-catalog'); },
  'catalog-filter': el => { ui.category = el.dataset.id; render(); },
  'close-modal': () => motion.closeDialog(modal),
  'gallery-step': el => galleryStep(Number(el.dataset.step)),
  'gallery-dot': el => setGallery(el.closest('[data-gallery-index]'), Number(el.dataset.index)),
  circle: el => { ui.mobileHome = false; ui.circle = el.dataset.id; ui.topic = circle().topics.find(t => !t.archived)?.id; ui.circleTab = 'topics'; ui.boardTab = 'saved'; ui.reply = null; navigate('together'); },
  topic: el => { ui.topic = el.dataset.id; ui.circleTab = 'topics'; ui.boardTab = 'saved'; ui.reply = null; render(); },
  'circle-tab': el => { closeModal(); ui.circleTab = el.dataset.id; ui.reply = null; render(); },
  'board-tab': el => { ui.boardTab = el.dataset.id; render(); },
  'find-more': () => { ui.boardTab = 'recommend'; render(); },
  'open-chat': () => { closeModal(); ui.mobileHome = false; ui.circleTab = 'chat'; navigate('together'); },
  'topic-chat': () => { ui.reply = null; openTopicChat(); },
  'new-circle': () => openModal('Новый круг', `<p class="modal-intro">Для семьи, пары, друзей — всех, с кем делаете что-то вместе.</p><form id="circle-form">${input('Как назовём круг?', 'name', '', 'required maxlength="60" placeholder="Например, наши путешествия"')}<fieldset><legend>Кого пригласим?</legend>${memberPicker()}</fieldset><button class="btn btn-blue form-submit">Создать круг</button></form>`),
  'new-topic': () => topicModal(),
  'new-topic-outside': () => topicModal(true),
  members: () => openModal('Участники круга', `<p class="modal-intro">${e(circle().name)} · только приглашённые участники видят чат и подборки.</p><form id="members-form">${memberPicker(circle().members)}<p class="form-help">Вы останетесь в круге как его создатель.</p><button class="btn btn-blue form-submit">Сохранить участников</button></form>`),
  'edit-profile': () => openModal('Ваш профиль', `<p class="modal-intro">Придумайте юзернейм — друзья смогут найти вас на Авито.</p><form id="profile-form">${input('Как вас зовут', 'name', state.profile.name, 'required maxlength="60"')}${input('Юзернейм', 'username', state.profile.username, 'required pattern="[a-zA-Z0-9_.]{3,30}" minlength="3" maxlength="30"')}<p class="form-help">3–30 символов: латинские буквы, цифры, точка и подчёркивание. Без @.</p><p id="profile-error" class="form-error" role="alert"></p><button class="btn btn-blue form-submit">Сохранить профиль</button></form>`),
  follow: el => {
    const id = el.dataset.id;
    state.following = state.following.includes(id) ? state.following.filter(x => x !== id) : [...state.following, id];
    persist(); render(); toast(isFriend(state, id) ? `Теперь вы и ${name(id)} — друзья` : state.following.includes(id) ? `Вы подписались на ${name(id)}` : 'Подписка отменена');
    motion.feedback(document.querySelector(`.person-card:has([data-action="follow"][data-id="${id}"]) > .avatar`));
  },
  item: el => itemModal(el.dataset.id),
  'save-item': el => {
    const id = el.dataset.id;
    state.saved = state.saved.includes(id) ? state.saved.filter(x => x !== id) : [...state.saved, id];
    persist(); render(); toast(state.saved.includes(id) ? 'Объявление в вашем избранном' : 'Удалено из избранного');
    motion.feedback(document.querySelector(`[data-action="save-item"][data-id="${id}"] .icon`));
  },
  'add-to-topic': el => {
    const id = el.dataset.id;
    if (ui.page === 'together' && topic() && !topic().archived) {
      if (!topic().items.includes(id)) topic().items.push(id);
      persist(); closeModal(); ui.boardTab = 'saved'; render(); toast('Добавлено в общую подборку'); return;
    }
    const options = state.circles.flatMap(c => c.topics.filter(t => !t.archived).map(t => `<option value="${c.id}/${t.id}">${e(c.name)} → ${e(t.name)}</option>`));
    openModal('Добавить в общую подборку', `<form id="add-form" data-id="${id}"><label class="form-label">Подборка<select name="destination" required>${options.join('')}</select></label><button class="btn btn-blue form-submit">Добавить</button></form>${btn('new-topic-outside', 'Создать новую подборку', 'text-button form-submit')}`);
  },
  'comment-item': el => {
    if (!topic() || topic().archived) return;
    ui.reply = el.dataset.id; openTopicChat();
  },
  'cancel-reply': () => { ui.reply = null; if (modal.open) openTopicChat(); else render(); },
  'wait-item': el => {
    const t = topic();
    if (!t || t.archived) return;
    const id = el.dataset.id;
    t.wait = t.wait.includes(id) ? t.wait.filter(x => x !== id) : [...t.wait, id];
    persist(); closeModal(); render();
    if (t.wait.includes(id)) openModal('Ждём вместе', `<div class="waiting-success">${icon('bell')}<h3>Сообщим всему кругу</h3><p>Если этот вариант или похожий появится, уведомление получат все ${circle().members.length} участника.</p></div><div class="demo-warning">Ниже — проверка механики. Это не реальное изменение статуса объявления.</div>${btn('simulate-available', 'Демо: вариант снова доступен', 'btn btn-blue form-submit', `data-id="${id}"`)}`);
    else toast('Убрали из листа ожидания');
  },
  'simulate-available': el => { restoreAvailability(state, el.dataset.id); persist(); closeModal(); render(); toast('Вариант появился — уведомление создано для всех участников круга'); },
  'search-settings': () => {
    const t = topic();
    if (!t) return;
    openModal('Сохранённый поиск', `<p class="modal-intro">Находки под вашу задачу. Действия участников видны прямо в выдаче.</p><form id="saved-search-form">${input('Что ищем', 'query', t.search.query, 'maxlength="120" placeholder="Например, дом"')}${typeSelect(t.search.type)}${input('Цена до, ₽', 'max', t.search.max, 'type="number" min="1" max="10000000" required')}${input('Где ищем', 'location', t.search.location, 'required maxlength="80"')}<p class="form-help">В демоверсии доступны Москва и Московская область. Регион сохраняется, но внешняя выдача не подключена.</p><button class="btn btn-blue form-submit">Сохранить и найти</button></form>`);
  },
  vote: voteModal,
  'vote-results': resultsModal,
  'choose-item': el => {
    if (!available(listingById(el.dataset.id))) { toast('Этот вариант пока недоступен'); return; }
    topic().chosen = el.dataset.id; persist(); closeModal(); render(); paymentModal();
  },
  payment: paymentModal,
  'pay-demo': () => { if (!topic().paid.includes('me')) topic().paid.push('me'); persist(); paymentModal(); toast('Демонстрация: ваша доля оплачена. Реального списания нет.'); },
  'archive-topic': () => {
    if (!topic()) return;
    openModal('Задача решена?', `<p class="modal-intro">Подборка «${e(topic().name)}» отправится в архив. Объявления, голоса и обсуждение останутся в этом круге.</p>${btn('confirm-archive', 'Да, перенести в архив', 'btn btn-blue form-submit')}${btn('close-modal', 'Пока выбираем', 'btn btn-soft form-submit')}`);
  },
  'confirm-archive': () => { topic().archived = true; persist(); closeModal(); ui.circleTab = 'archive'; ui.reply = null; render(); toast('Подборка в архиве. Можно вернуться к ней в любое время.'); },
  'restore-topic': el => { circle().topics.find(t => t.id === el.dataset.id).archived = false; ui.topic = el.dataset.id; ui.circleTab = 'topics'; persist(); render(); },
  'view-archive': el => {
    const t = circle().topics.find(t => t.id === el.dataset.id);
    openModal(e(t.name) + ' · архив', `<p class="modal-intro">Задача завершена. Подборку можно вернуть из архива.</p><div class="archived-items">${t.items.map(id => `<button data-action="item" data-id="${id}"><img src="assets/${listingById(id).image}.jpg" alt=""><span>${e(listingById(id).title)}<b>${amount(listingById(id).price)}</b></span></button>`).join('')}</div><h3>Обсуждение подборки</h3><div class="archive-messages">${circle().messages.filter(m => m.topic === t.id).map(m => `<p><strong>${e(name(m.author))}:</strong> ${e(m.text)}</p>`).join('') || '<p class="muted">Пока нет сообщений.</p>'}</div>`, 'wide-modal');
  },
  'topic-menu': () => openModal('Подборка и круг', `<form id="rename-topic-form">${input('Название подборки', 'name', topic().name, 'required maxlength="80"')}<button class="btn btn-blue form-submit">Сохранить название</button></form><div class="topic-menu-actions">${btn('members', icon('people') + ' Участники круга', 'topic-option')}${btn('open-chat', icon('chat') + ' Общий чат круга', 'topic-option')}${btn('circle-tab', icon('archive') + ' Архив круга', 'topic-option', 'data-id="archive"')}${btn('archive-topic', icon('check') + ' Завершить подборку', 'topic-option')}</div>`),
  'read-notifications': () => { state.notifications.forEach(n => { n.read = true; }); persist(); render(); },
  'open-notification': el => {
    const n = state.notifications.find(n => n.id === el.dataset.id);
    n.read = true; ui.mobileHome = false; ui.circle = n.circleId; ui.topic = n.topicId; ui.circleTab = topic()?.archived ? 'archive' : 'topics'; ui.boardTab = 'waiting'; persist(); navigate('together');
  },
  categories: () => openModal('Что выберем вместе?', `<div class="category-modal">${[['travel', 'Путешествия', 'Дом на выходные, квартира для поездки', 'travel'], ['goods', 'Товары для дома', 'Диван, стол или что-то для уюта', 'home'], ['service', 'Услуги', 'Мастер, фотограф, помощь с праздником', 'services']].map(([id, label, description, image]) => btn('modal-category', `<span><strong>${label}</strong><small>${description}</small></span><img class="category-visual" src="assets/avito-${image}.png" width="100" height="72" alt="">${icon('chevron')}`, 'category-option', `data-id="${id}"`)).join('')}</div><p class="form-help">Три направления для совместного выбора в демоверсии</p>`),
  'modal-category': el => { ui.category = el.dataset.id; ui.query = ''; closeModal(); navigate('catalog'); },
  location: () => openModal('Москва и Московская область', `<p class="modal-intro">Демообъявления расположены в Москве и области. Для подборки можно сохранить свой регион в настройках поиска.</p>${btn('close-modal', 'Понятно', 'btn btn-blue form-submit')}`),
  about: () => openModal('Авито Вместе · прототип', `<p class="modal-intro">Учебная концепция для кейса «Между сделками». Не является официальным продуктом Авито.</p><ul class="about-list"><li>Профиль, @юзернейм и взаимные подписки</li><li>Круги, общие чаты и совместные подборки</li><li>Комментарии к объявлениям, сохранённый поиск</li><li>Лист ожидания и демонстрация уведомлений</li><li>Личный топ-3, общий рейтинг и совпадения</li><li>Демонстрация разделения счёта и архив</li><li>Отзывы друзей о продавцах и исполнителях</li></ul><p>Данные сохраняются только в этом браузере. Сервер, реальные пользователи, платёжная система и push-уведомления не подключены.</p><p class="form-help">Avito Sans — публичные файлы сайта Авито. Фотографии — Unsplash. Все профили, объявления и отзывы вымышлены.</p>`),
};
document.addEventListener('click', event => {
  document.querySelectorAll('.topic-dropdown[open]').forEach(details => { if (!details.contains(event.target)) details.open = false; });
  const el = event.target.closest('[data-action]');
  if (!el || el.disabled) return;
  actions[el.dataset.action]?.(el);
});
document.addEventListener('keydown', event => {
  if (modal.open && modal.querySelector('[data-gallery-index]') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); galleryStep(event.key === 'ArrowRight' ? 1 : -1); return; }
  if (event.key === 'Escape') document.querySelectorAll('.topic-dropdown[open]').forEach(details => { details.open = false; details.querySelector('summary').focus(); });
});
document.addEventListener('change', event => {
  if (event.target.id === 'sort') { ui.sort = event.target.value; render(); }
  if (event.target.id === 'vote-actor') document.querySelector('#vote-selects').innerHTML = voteSelects(event.target.value);
});
document.addEventListener('submit', event => {
  const form = event.target;
  if (!form.id) return;
  event.preventDefault();
  const data = new FormData(form);
  switch (form.id) {
    case 'global-search':
    case 'catalog-search': ui.query = data.get('query').trim(); ui.category = 'all'; navigate('catalog'); return;
    case 'people-search': ui.peopleQuery = data.get('people').trim(); render(); return;
    case 'circle-form': {
      const members = data.getAll('members');
      if (!data.get('name').trim()) { toast('Введите название круга'); return; }
      if (!members.length) { toast('Пригласите хотя бы одного участника'); return; }
      const c = { id: crypto.randomUUID(), name: data.get('name').trim(), emoji: '💬', color: 'lilac', members: ['me', ...members], topics: [], messages: [] };
      state.circles.push(c); ui.mobileHome = false; ui.circle = c.id; ui.topic = null; ui.circleTab = 'topics'; ui.page = 'together'; break;
    }
    case 'topic-form': {
      try {
        const { circle: c, topic: t } = createTopic(state, { circleId: data.get('circle'), name: data.get('name'), members: data.getAll('members'), type: data.get('type') });
        ui.mobileHome = false; ui.circle = c.id; ui.topic = t.id; ui.circleTab = 'topics'; ui.boardTab = 'recommend'; ui.page = 'together';
      } catch (error) { toast(error.message); return; }
      break;
    }
    case 'members-form': circle().members = ['me', ...data.getAll('members')];
      for (const t of circle().topics) for (const id of Object.keys(t.votes)) if (!circle().members.includes(id)) delete t.votes[id];
      break;
    case 'profile-form': {
      const username = data.get('username').trim().toLowerCase();
      const error = document.querySelector('#profile-error');
      if (!data.get('name').trim()) { error.textContent = 'Введите имя'; return; }
      if (people.some(p => p.username.toLowerCase() === username)) { error.textContent = 'Этот юзернейм уже занят. Попробуйте другой.'; return; }
      state.profile = { name: data.get('name').trim(), username }; break;
    }
    case 'message-form': {
      try { postMessage(circle(), { text: data.get('message'), item: ui.reply, topic: ui.circleTab === 'chat' && !ui.reply ? null : ui.topic }); }
      catch (error) { toast(error.message); return; }
      ui.reply = null; persist();
      if (modal.open) openTopicChat(); else render();
      document.querySelector('#message-input')?.focus();
      const messages = document.querySelector('#chat-messages'); messages.scrollTop = messages.scrollHeight; return;
    }
    case 'add-form': {
      const [cid, tid] = data.get('destination').split('/');
      const c = state.circles.find(c => c.id === cid); const t = c.topics.find(t => t.id === tid);
      if (!t.items.includes(form.dataset.id)) t.items.push(form.dataset.id);
      ui.mobileHome = false; ui.circle = cid; ui.topic = tid; ui.page = 'together'; ui.circleTab = 'topics'; ui.boardTab = 'saved'; break;
    }
    case 'saved-search-form': topic().search = { query: data.get('query').trim(), type: data.get('type'), max: Number(data.get('max')), location: data.get('location').trim() }; ui.boardTab = 'recommend'; break;
    case 'vote-form': {
      try { setVote(topic(), data.get('actor'), [0, 1, 2].map(i => data.get(`rank${i}`)), circle().members); }
      catch (error) { document.querySelector('#vote-error').textContent = error.message; return; }
      topic().voting = true; persist(); closeModal(); render(); resultsModal(); return;
    }
    case 'rename-topic-form': if (!data.get('name').trim()) { toast('Введите название'); return; } topic().name = data.get('name').trim(); break;
    default: return;
  }
  persist(); closeModal(); render(); toast('Сохранено');
});

render();
