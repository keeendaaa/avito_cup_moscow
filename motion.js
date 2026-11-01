const { gsap } = window;
const conditions = {
  full: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  mobile: '(max-width: 767px)',
};
const ease = 'power3.out';
let viewMedia;
let modalMedia;
let viewContext;
let modalContext;
let lastViewKey;
let lastModalKey;
let dialogExit;
let pressed;

function visible(element) {
  return element.getClientRects().length > 0;
}
function inViewport(element) {
  if (!visible(element)) return false;
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < innerHeight;
}
function snapshot(root) {
  return {
    cards: new Map([...root.querySelectorAll('[data-listing]')].filter(visible).map(el => [el.dataset.listing, el.getBoundingClientRect()])),
    messages: new Set([...root.querySelectorAll('[data-message]')].map(el => el.dataset.message)),
    markers: new Set(['.chosen-banner', '.vote-summary', '.paid-label', '.empty-state'].filter(selector => root.querySelector(selector))),
  };
}
function reveal(timeline, targets, reduced, position = 0, extra = {}) {
  if (!targets.length) return;
  timeline.fromTo(targets,
    reduced ? { opacity: .65 } : { opacity: .4, y: 12 },
    { opacity: 1, ...(reduced ? {} : { y: 0 }), duration: reduced ? .12 : .32, ease,
      stagger: reduced ? 0 : .035, clearProps: 'opacity,transform', ...extra }, position);
}
function addMessages(timeline, root, before, reduced) {
  const incoming = [...root.querySelectorAll('[data-message]')].filter(el => !before.messages.has(el.dataset.message));
  reveal(timeline, incoming.slice(-1), reduced, 0, { duration: reduced ? .12 : .24 });
}
function scopeFor(element) {
  return element.closest('#modal') ? modalContext : viewContext;
}
function run(element, callback) {
  if (!element?.isConnected) return;
  const context = scopeFor(element);
  if (!context) return;
  context.add(() => callback(context.conditions.reduced));
}

export function beforeView(root) {
  viewMedia?.revert();
  viewContext = null;
  return snapshot(root);
}

export function enterView(root, key, before) {
  const changed = key !== lastViewKey;
  lastViewKey = key;
  viewMedia = gsap.matchMedia();
  viewMedia.add(conditions, context => {
    viewContext = context;
    const { reduced } = context.conditions;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    const timeline = gsap.timeline({ defaults: { ease } });
    const main = root.querySelector('#main');
    if (changed) {
      const headings = [...main.querySelectorAll('.topic-title-group, .page-title, .mobile-home-heading, .section-back')].filter(visible);
      const rows = [...main.querySelectorAll('.listing-card, .person-card, .mobile-circle-card, .archive-row, .notification-row')].filter(inViewport).slice(0, 6);
      reveal(timeline, headings, reduced, 0);
      reveal(timeline, rows, reduced, reduced ? 0 : .045);
      if (!reduced) {
        const objects = [...main.querySelectorAll('.circle-object')].filter(inViewport).slice(0, 3);
        if (objects.length) timeline.fromTo(objects, { x: 8 }, { x: 0, duration: .42, stagger: .035, clearProps: 'transform' }, .06);
      }
    } else {
      // FLIP: keep sort/add/remove changes in place instead of replaying the whole page.
      for (const card of main.querySelectorAll('[data-listing]')) {
        if (!inViewport(card)) continue;
        const old = before.cards.get(card.dataset.listing);
        if (!old) { reveal(timeline, [card], reduced); continue; }
        const next = card.getBoundingClientRect();
        const x = old.left - next.left;
        const y = old.top - next.top;
        if (Math.abs(x) + Math.abs(y) > 2) {
          if (reduced) reveal(timeline, [card], true);
          else timeline.fromTo(card, { x, y }, { x: 0, y: 0, duration: .3, clearProps: 'transform' }, 0);
        }
      }
      addMessages(timeline, main, before, reduced);
    }
    for (const selector of ['.chosen-banner', '.vote-summary', '.empty-state']) {
      const element = main.querySelector(selector);
      if (element && visible(element) && !before.markers.has(selector)) reveal(timeline, [element], reduced, .04);
    }
    return () => { if (pressed && root.contains(pressed)) pressed = null; };
  }, root);
}

export function beforeModal(modal) {
  dialogExit?.kill();
  dialogExit = null;
  modalMedia?.revert();
  modalContext = null;
  return { ...snapshot(modal), open: modal.open, key: lastModalKey };
}

export function enterModal(modal, key, before) {
  const changed = !before.open || key !== before.key;
  lastModalKey = key;
  modalMedia = gsap.matchMedia();
  modalMedia.add(conditions, context => {
    modalContext = context;
    const { reduced, mobile } = context.conditions;
    modal.dataset.motion = reduced ? 'reduced' : 'full';
    const timeline = gsap.timeline({ defaults: { ease } });
    if (!before.open) {
      timeline.fromTo(modal,
        reduced ? { opacity: .65 } : { opacity: .5, y: mobile ? 24 : 10, scale: mobile ? 1 : .985 },
        { opacity: 1, ...(reduced ? {} : { y: 0, scale: 1 }), duration: reduced ? .12 : .26, clearProps: 'transform,opacity' });
    }
    if (changed) {
      const rows = [...modal.querySelectorAll('.ranking-row, .bill-shares > div, .category-option')];
      reveal(timeline, rows.slice(0, 6), reduced, reduced ? 0 : .055, { duration: reduced ? .12 : .24 });
      if (before.open && !rows.length) reveal(timeline, [...modal.children].filter(visible), reduced, 0, { duration: reduced ? .12 : .18 });
    } else {
      addMessages(timeline, modal, before, reduced);
      if (!before.markers.has('.paid-label')) reveal(timeline, [...modal.querySelectorAll('.paid-label')], reduced);
    }
    return () => { if (pressed && modal.contains(pressed)) pressed = null; };
  }, modal);
}

export function closeDialog(modal) {
  if (!modal.open || dialogExit) return;
  run(modal, reduced => {
    dialogExit = gsap.to(modal, {
      opacity: 0, ...(reduced ? {} : { y: innerWidth < 768 ? 16 : 6 }),
      duration: reduced ? .1 : .14, ease: 'power2.in', overwrite: 'auto',
      onComplete: () => { dialogExit = null; modal.close(); },
    });
  });
}

export function resetModal() {
  dialogExit?.kill();
  dialogExit = null;
  modalMedia?.revert();
  modalContext = null;
  lastModalKey = null;
}

export function feedback(element) {
  run(element, reduced => {
    gsap.killTweensOf(element);
    const timeline = gsap.timeline();
    if (reduced) timeline.fromTo(element, { opacity: .55 }, { opacity: 1, duration: .12, clearProps: 'opacity' });
    else timeline.to(element, { scale: 1.15, duration: .12, ease: 'power2.out', transformOrigin: '50% 50%' })
      .to(element, { scale: 1, duration: .2, ease, clearProps: 'transform' });
  });
}

// Delegation survives DOM replacement without accumulating per-button listeners.
function press(element) {
  if (!element || element.disabled || element.matches('.logo') || element.closest('[inert]')) return;
  pressed = element;
  run(element, reduced => gsap.to(element, {
    ...(reduced ? { opacity: .8 } : { scale: element.matches('.mobile-circle-card') ? .99 : .975 }),
    duration: .08, ease: 'power2.out', overwrite: 'auto',
  }));
}
function release() {
  const element = pressed;
  pressed = null;
  run(element, reduced => gsap.to(element, {
    ...(reduced ? { opacity: 1, clearProps: 'opacity' } : { scale: 1, clearProps: 'transform' }),
    duration: .16, ease, overwrite: 'auto',
  }));
}
document.addEventListener('pointerdown', event => {
  if (event.button === 0) press(event.target.closest('button'));
});
document.addEventListener('pointerup', release);
document.addEventListener('pointercancel', release);
window.addEventListener('blur', release);
document.addEventListener('keydown', event => {
  if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) press(event.target.closest('button'));
});
document.addEventListener('keyup', event => { if (event.key === 'Enter' || event.key === ' ') release(); });

function hover(event, entering) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const owner = event.target.closest('.image-open, .category-option, .mobile-circle-card');
  if (!owner || (event.relatedTarget instanceof Node && owner.contains(event.relatedTarget))) return;
  const image = owner.querySelector('img.circle-object, img.category-visual, img');
  if (!image) return;
  run(image, reduced => {
    if (reduced) return;
    gsap.to(image, owner.matches('.image-open')
      ? { scale: entering ? 1.025 : 1, duration: .28, ease, overwrite: 'auto', ...(entering ? {} : { clearProps: 'transform' }) }
      : { x: entering ? -3 : 0, duration: .2, ease, overwrite: 'auto', ...(entering ? {} : { clearProps: 'transform' }) });
  });
}
document.addEventListener('pointerover', event => hover(event, true));
document.addEventListener('pointerout', event => hover(event, false));
document.addEventListener('toggle', event => {
  if (!event.target.matches('.topic-dropdown[open]')) return;
  const menu = event.target.querySelector('.topic-dropdown-menu');
  run(menu, reduced => reveal(gsap.timeline(), [menu], reduced, 0, { duration: reduced ? .12 : .18 }));
}, true);
