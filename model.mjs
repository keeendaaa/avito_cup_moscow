export const people = [
  { id: 'sasha', name: 'Саша', full: 'Александр Волков', username: 'sasha.volkov', color: 'blue', photo: 'sasha', followsMe: true },
  { id: 'masha', name: 'Маша', full: 'Мария Соколова', username: 'masha.s', color: 'pink', photo: 'masha', followsMe: true },
  { id: 'dima', name: 'Дима', full: 'Дмитрий Морозов', username: 'dimam', color: 'green', photo: 'dima', followsMe: true },
  { id: 'ira', name: 'Ира', full: 'Ирина Белова', username: 'ira.belova', color: 'purple', photo: 'ira', followsMe: true },
  { id: 'artem', name: 'Артём', full: 'Артём Кузнецов', username: 'artem.k', color: 'sand', photo: 'artem', followsMe: false },
];
// Реальные публичные объявления Авито. Цена, название и адрес — снимок страницы
// на 2026-11-01; доступность и цена на стороне Авито могли измениться.
export const listingSnapshot = '1 ноября 2026';
import { gallery } from './assets/listings/manifest.mjs';
import { descriptions } from './assets/listings/content.mjs';

export const listings = [
  { id: 'a', title: '5-к. коттедж, 225 м²', price: 10000, from: true, image: 'avito-house-1', location: 'Истра, д. Рычково · Волоколамское шоссе, 32 км', details: 'Баня · Всесезонный бассейн · Мангал', type: 'travel', available: true, url: 'https://www.avito.ru/istra/doma_dachi_kottedzhi/5-k._kottedzh_225_m_1240360045', badge: 'Добавила Маша', badgeType: 'purple', friend: 'masha' },
  { id: 'b', title: '3-к. коттедж, 72 м²', price: 11900, from: true, image: 'avito-house-2', location: 'Одинцово, с. Ромашково · Рублёво-Успенское шоссе, 3 км', details: 'Баня · Мгновенная бронь · Мангал', type: 'travel', available: true, url: 'https://www.avito.ru/odintsovo/doma_dachi_kottedzhi/3-k._kottedzh_72_m_4660140519', badge: 'Смотрел Саша', badgeType: 'blue' },
  { id: 'c', title: '10-к. и более коттедж, 422 м²', price: 27000, from: true, image: 'avito-house-3', location: 'Истра, д. Алёхново, 174 · берег Истринского водохранилища', details: 'Мгновенная бронь · Лес рядом', type: 'travel', available: false, url: 'https://www.avito.ru/istra/doma_dachi_kottedzhi/10-k._i_bolee_kottedzh_422_m_8407661686', badge: 'Добавил Дима', badgeType: 'green' },
  { id: 'd', title: '6-к. коттедж, 286 м²', price: 16000, from: true, image: 'avito-house-4', location: 'Кубинка, д. Сивково · КП «Зелёная Роща-1»', details: 'Суперхозяин · Лес рядом · Мангал', type: 'travel', available: true, url: 'https://www.avito.ru/kubinka/doma_dachi_kottedzhi/6-k._kottedzh_286_m_1843762738', badge: 'Смотрела Маша', badgeType: 'purple' },
  { id: 'e', title: '7-к. коттедж, 360 м²', price: 19000, from: true, image: 'avito-house-5', location: 'Истра, КП Марусино, 8 · 40 км от МКАД', details: 'Кондиционер · Лес рядом · Мгновенная бронь', type: 'travel', available: true, url: 'https://www.avito.ru/istra/doma_dachi_kottedzhi/7-k._kottedzh_360_m_4633119970', badge: 'Отклонили', badgeType: 'gray', rejected: true },
  { id: 'f', title: '8-к. коттедж, 360 м²', price: 16000, from: true, image: 'avito-house-6', location: 'Лобня, д. Мышецкое · Телевизионная ул., 14к2', details: 'Суперхозяин · Кондиционер · Лес рядом', type: 'travel', available: true, url: 'https://www.avito.ru/lobnya/doma_dachi_kottedzhi/8-k._kottedzh_360_m_2659140270' },
  { id: 'g', title: 'Диван прямой СПИН, 150 см', price: 81000, image: null, location: 'Москва · SKDESIGN', details: '150 см · рогожка Saga Jasper · витринный образец', type: 'goods', available: true, url: 'https://www.avito.ru/moskva/mebel_i_interer/divan_pryamoy_spin_8336878154', friend: 'sasha', note: 'Саша сохранил этот диван в свою подборку' },
  { id: 'i', title: 'Бутик-отель Веллион Смоленский', price: 6360, from: true, image: 'avito-hotel-1', location: 'Москва, пер. Сивцев Вражек, 45с1 · Смоленская', details: 'Отель · центр Москвы · за сутки', type: 'travel', available: true, url: 'https://www.avito.ru/moskva/realty_rent/butik-otel_vellion_smolenskiy_4169344518', badge: 'Добавила Ира', badgeType: 'purple', friend: 'ira' },
  { id: 'j', title: 'Гостиница Кадашевская', price: 8100, from: true, image: 'avito-hotel-2', location: 'Москва, Кадашёвская наб., 26 · Третьяковская', details: 'Отель · центр Москвы · за сутки', type: 'travel', available: true, url: 'https://www.avito.ru/moskva/realty_rent/gostinitsa_kadashevskaya_8008765096', badge: 'Смотрел Дима', badgeType: 'green' },
  { id: 'k', title: '2-к. квартира, 46 м², 10/21 эт.', price: 20410200, image: null, location: 'Москва, УНО «Соколиная Гора» · м. Соколиная Гора', details: '2 комнаты · 46 м² · 10/21 этаж', type: 'realty', available: true, url: 'https://www.avito.ru/moskva/kvartiry/2-k._kvartira_46_m_1021_et._7901980626', friend: 'sasha', note: 'Саша добавил квартиру в семейную подборку' },
  { id: 'n', title: 'Hyundai Solaris 1.6 AT, 2015, 114 000 км', price: 1115000, image: null, location: 'Москва, Новая Рига', details: '114 000 км · 1.6 AT · один владелец', type: 'auto', available: true, url: 'https://www.avito.ru/moskva/avtomobili/hyundai_solaris_1.6_at_2015_114_000_km_8349978558', badge: 'Добавил Саша', badgeType: 'blue' },
  { id: 'o', title: 'Changan Eado Plus 1.4 AMT, 2023, 22 085 км', price: 1530000, image: null, location: 'Москва, Major Expert', details: '22 085 км · 1.4 AMT · проверен дилером', type: 'auto', available: true, url: 'https://www.avito.ru/moskva/avtomobili/changan_eado_plus_1.4_amt_2023_22_085_km_8300440259' },
  { id: 'm', title: 'Набор Moschino Toy Boy', price: 2399, image: null, location: 'Москва · доставка Авито', details: 'Парфюмерный набор · Новый', type: 'goods', available: true, url: 'https://www.avito.ru/moskva/krasota_i_zdorove/nabor_moschino_toy_boy_3230868848', friend: 'ira', note: 'Ира предложила этот набор в подарок' },
  { id: 'p', title: 'Действующее кафе', price: 3100000, image: null, location: 'Москва, Нагатинский затон · 6–10 мин. пешком', details: 'Готовый бизнес · кафе-кондитерская', type: 'business', available: true, url: 'https://www.avito.ru/moskva/gotoviy_biznes/deystvuyuschee_kafe_8437923895' },
  { id: 'h', title: 'Свадебный фотограф Москва', price: 6000, from: true, image: 'avito-photo', location: 'Москва, пр-т Мира, 119 · м. ВДНХ', details: 'Съёмка за час · автор — Алина', type: 'service', available: true, url: 'https://www.avito.ru/moskva/predlozheniya_uslug/svadebnyy_fotograf_moskva_7598301888', friend: 'dima', note: 'Дима добавил фотографа в подборку ко дню рождения' },
];
export const listingGallery = item => (gallery[item.id]?.length ? gallery[item.id] : [item.image].filter(Boolean));
export const listingDescription = item => descriptions[item.id] || item.description || '';
export const listingById = id => listings.find(item => item.id === id);
export const personById = id => people.find(person => person.id === id);
export const isFriend = (state, id) => state.following.includes(id) && Boolean(personById(id)?.followsMe);
export const amount = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
export function seed() {
  return {
    version: 1,
    profile: { name: 'Анастасия', username: 'nastya.ivanova' },
    following: ['sasha', 'masha', 'dima'],
    circles: [
      { id: 'weekend', name: 'На выходные', emoji: '🌲', color: 'mint', members: ['me', 'sasha', 'masha', 'dima'], topics: [
        { id: 'house', name: 'Дом на выходные', description: 'Ищем уютное место, чтобы выдохнуть из города', items: ['a', 'b', 'c', 'd'], wait: [], archived: false, search: { query: '', max: 20000, type: 'travel', location: 'Московская область' }, votes: { sasha: ['a', 'b', 'd'], masha: ['a', 'd', 'b'], dima: ['b', 'a', 'c'] }, voting: false, chosen: null, nights: 2, paid: [] },
        { id: 'hotel', name: 'Отель на двоих', description: 'Если хочется в город и без готовки', items: ['i', 'j'], wait: [], archived: false, search: { query: '', max: 10000, type: 'travel', location: 'Москва' }, votes: {}, voting: false, chosen: null, nights: 2, paid: [] },
        { id: 'activities', name: 'Чем займёмся', items: [], wait: [], archived: false, search: { query: '', max: 20000, type: 'service', location: 'Московская область' }, votes: {}, voting: false, chosen: null, nights: 1, paid: [] },
        { id: 'summer', name: 'Летняя поездка', items: ['b'], wait: [], archived: true, search: { query: '', max: 20000, type: 'travel', location: 'Московская область' }, votes: {}, voting: false, chosen: 'b', nights: 2, paid: [] },
      ], messages: [
        { id: 'm1', author: 'masha', text: 'Как вам этот? Баня, бассейн и всего 32 км от МКАД', item: 'a', topic: 'house', time: '11:02' },
        { id: 'm2', author: 'sasha', text: 'Мне нравится. И от Москвы недалеко', item: 'a', topic: 'house', time: '11:05' },
        { id: 'm3', author: 'dima', text: 'Я ещё пару вариантов добавил. Давайте вечером выберем?', topic: 'house', time: '11:08' },
        { id: 'm4', author: 'me', text: 'Смотрите, у этого дома в Ромашково баня и парк Малевича в ста метрах', item: 'b', topic: 'house', time: '11:20' },
        { id: 'm5', author: 'masha', text: 'Парк — это плюс. Но выходные сдаются сразу на двое суток, надо считать бюджет', item: 'b', topic: 'house', time: '11:23' },
        { id: 'm6', author: 'sasha', text: 'Если брать на двоих суток и делить на четверых, выходит вполне ок', topic: 'house', time: '11:26' },
        { id: 'm7', author: 'dima', text: 'У Алёхново бассейн с выходом из дома на улицу. Правда, 27 000 и он сейчас занят', item: 'c', topic: 'house', time: '11:34' },
        { id: 'm8', author: 'me', text: 'Поставила его в лист ожидания — вдруг освободится', item: 'c', topic: 'house', time: '11:36' },
        { id: 'm9', author: 'masha', text: 'А в Сивково шале в хвойном лесу, и всего 33 км от МКАД. Мне нравится больше всех', item: 'd', topic: 'house', time: '11:44' },
        { id: 'm10', author: 'sasha', text: 'Тогда предлагаю топ-3: Сивково, Рычково и Ромашково', topic: 'house', time: '11:47' },
        { id: 'm11', author: 'dima', text: 'Согласен. Ещё бы кто-нибудь проверил, есть ли мангал и дрова', topic: 'house', time: '11:49' },
        { id: 'm12', author: 'me', text: 'В описании у Рычково: беседка, мангал, шампуры. Уголь и розжиг привозим свои', topic: 'house', time: '11:52' },
        { id: 'm13', author: 'masha', text: 'Тогда я за Рычково: баня, бассейн и до дома всего час', item: 'a', topic: 'house', time: '11:55' },
        { id: 'm14', author: 'sasha', text: 'Ок, вечером голосуем. Я скинул в подборку отель на двоих — вдруг захотим в город', item: 'i', topic: 'hotel', time: '12:01' },
        { id: 'm15', author: 'masha', text: 'Отель красивый, но с собаками нельзя, а мы хотели с Джесси', topic: 'hotel', time: '12:04' },
        { id: 'm16', author: 'dima', text: 'Тогда оставляем загородный вариант, а отель — на годовщину', topic: 'hotel', time: '12:06' },
      ] },
      { id: 'home', name: 'Наш дом', emoji: '🏡', color: 'peach', members: ['me', 'sasha'], topics: [{ id: 'living', name: 'Обустраиваем гостиную', items: ['g'], wait: [], archived: false, search: { query: '', max: 50000, type: 'goods', location: 'Москва' }, votes: {}, voting: false, chosen: null, nights: 1, paid: [] }], messages: [
        { id: 'h1', author: 'sasha', text: 'Нашёл диван СПИН, 150 см — как раз встанет вдоль стены', item: 'g', topic: 'living', time: '09:12' },
        { id: 'h2', author: 'me', text: 'Красивый. Смущает, что это витринный образец', item: 'g', topic: 'living', time: '09:20' },
        { id: 'h3', author: 'sasha', text: 'Зато скидка с 121 300 до 90 000. И ткань рогожка, не маркая', topic: 'living', time: '09:22' },
        { id: 'h4', author: 'me', text: 'Тогда надо померить, сколько останется до прохода', topic: 'living', time: '09:25' },
        { id: 'h5', author: 'sasha', text: 'Вечером пришлю фото рулеткой', topic: 'living', time: '09:26' },
      ] },
      { id: 'birthday', name: 'День рождения Маши', emoji: '🎂', color: 'lilac', members: ['me', 'dima', 'ira'], topics: [{ id: 'party', name: 'Готовим праздник', items: ['h', 'm'], wait: [], archived: false, search: { query: '', max: 20000, type: 'service', location: 'Москва' }, votes: {}, voting: false, chosen: null, nights: 1, paid: [] }], messages: [
        { id: 'b1', author: 'dima', text: 'Фотографа нашёл: Алина, свадебный, но снимает и дни рождения', item: 'h', topic: 'party', time: '10:01' },
        { id: 'b2', author: 'ira', text: 'Портфолио посмотрела — живые кадры, без постановки. Берём', item: 'h', topic: 'party', time: '10:09' },
        { id: 'b3', author: 'me', text: 'Тогда ей надо сказать про торт и свечи, чтобы поймала момент', topic: 'party', time: '10:11' },
        { id: 'b4', author: 'ira', text: 'И подарок: набор Moschino, четыре предмета в коробке', item: 'm', topic: 'party', time: '10:16' },
        { id: 'b5', author: 'dima', text: 'Пахнет хорошо? Если нет — лучше сертификат', topic: 'party', time: '10:18' },
        { id: 'b6', author: 'ira', text: 'Пахнет, я нюхала в магазине. Заказываем', topic: 'party', time: '10:19' },
      ] },
      { id: 'flat', name: 'Своя квартира', emoji: '🔑', color: 'mint', members: ['me', 'sasha'], topics: [{ id: 'buy', name: 'Выбираем квартиру', items: ['k'], wait: [], archived: false, search: { query: '', max: 25000000, type: 'realty', location: 'Москва' }, votes: {}, voting: false, chosen: null, nights: 1, paid: [] }], messages: [
        { id: 'f1', author: 'sasha', text: 'Смотри 46 метров в Соколиной Горе, 10 этаж из 21', item: 'k', topic: 'buy', time: '08:40' },
        { id: 'f2', author: 'me', text: 'Рядом Измайловский парк, это большой плюс', topic: 'buy', time: '08:47' },
        { id: 'f3', author: 'sasha', text: 'И метро с МЦК в шаговой доступности. Но 20,4 млн — надо считать ипотеку', topic: 'buy', time: '08:49' },
        { id: 'f4', author: 'me', text: 'Давай в выходные съездим на просмотр, посмотрим двор', topic: 'buy', time: '08:55' },
        { id: 'f5', author: 'sasha', text: 'Записал. Ещё возьму с собой рулетку и уровень', topic: 'buy', time: '08:57' },
      ] },
      { id: 'auto', name: 'Новая машина', emoji: '🚗', color: 'peach', members: ['me', 'sasha', 'dima'], topics: [{ id: 'choose', name: 'Что берём вместо старой', items: ['n', 'o'], wait: [], archived: false, search: { query: '', max: 2500000, type: 'auto', location: 'Москва' }, votes: {}, voting: false, chosen: null, nights: 1, paid: [] }], messages: [
        { id: 'c1', author: 'sasha', text: 'Solaris 2015, один владелец, 114 тысяч пробега. Просят 1,1 млн', item: 'n', topic: 'choose', time: '19:02' },
        { id: 'c2', author: 'dima', text: 'За эти деньги нормально. Главное — проверить историю по VIN', topic: 'choose', time: '19:05' },
        { id: 'c3', author: 'me', text: 'А Changan 2023 почти новый, но дороже на 400 тысяч', item: 'o', topic: 'choose', time: '19:11' },
        { id: 'c4', author: 'sasha', text: 'У дилера хотя бы гарантия и диагностика перед продажей', topic: 'choose', time: '19:13' },
        { id: 'c5', author: 'dima', text: 'Предлагаю прокатиться на обоих в субботу и решить', topic: 'choose', time: '19:16' },
        { id: 'c6', author: 'me', text: 'Записываю: суббота, сначала Solaris, потом Changan', topic: 'choose', time: '19:18' },
      ] },
      { id: 'cafe', name: 'Кофейня', emoji: '☕', color: 'lilac', members: ['me', 'ira'], topics: [{ id: 'launch', name: 'Запускаем своё дело', items: ['p'], wait: [], archived: false, search: { query: '', max: 4000000, type: 'business', location: 'Москва' }, votes: {}, voting: false, chosen: null, nights: 1, paid: [] }], messages: [
        { id: 'k1', author: 'ira', text: 'Нашла кафе-кондитерскую на набережной, 41 м², 3,1 млн', item: 'p', topic: 'launch', time: '13:14' },
        { id: 'k2', author: 'me', text: 'Аренда 142 тысячи в месяц — это 1,7 млн в год только за стены', topic: 'launch', time: '13:20' },
        { id: 'k3', author: 'ira', text: 'Зато всё оборудование и база клиентов уже есть', topic: 'launch', time: '13:22' },
        { id: 'k4', author: 'me', text: 'Нужно посмотреть выручку за последние месяцы, иначе это покупка мебели', topic: 'launch', time: '13:27' },
        { id: 'k5', author: 'ira', text: 'Запрошу документы и запишусь на встречу с собственником', topic: 'launch', time: '13:29' },
      ] },
    ],
    availability: {}, notifications: [], saved: [],
  };
}
export function rankItems(topic) {
  const scores = Object.fromEntries(topic.items.map(id => [id, 0]));
  const counts = Object.fromEntries(topic.items.map(id => [id, 0]));
  for (const ballot of Object.values(topic.votes)) {
    ballot.forEach((id, index) => {
      if (Object.hasOwn(scores, id) && index < 3) { scores[id] += 3 - index; counts[id]++; }
    });
  }
  return topic.items.map(id => ({ id, score: scores[id], count: counts[id] })).sort((a, b) => b.score - a.score);
}
export function setVote(topic, member, ballot, members) {
  if (topic.archived) throw new Error('Подборка в архиве');
  if (!members.includes(member)) throw new Error('Голосовать могут только участники');
  if (ballot.length !== 3 || new Set(ballot).size !== 3 || ballot.some(id => !topic.items.includes(id))) throw new Error('Выберите три разных объявления');
  topic.votes[member] = ballot;
}
export function createTopic(state, { circleId, name, members = [], type = 'travel' }) {
  if (!name.trim()) throw new Error('Укажите название подборки');
  const id = crypto.randomUUID();
  let circle = state.circles.find(c => c.id === circleId);
  if (!circle) {
    circle = { id: crypto.randomUUID(), name: name.trim(), emoji: '💬', color: 'lilac', members: [...new Set(['me', ...members])], topics: [], messages: [] };
    state.circles.push(circle);
  }
  const topic = { id, name: name.trim(), items: [], wait: [], archived: false, search: { query: '', max: 20000, type, location: 'Москва и область' }, votes: {}, voting: false, chosen: null, nights: type === 'travel' ? 2 : 1, paid: [] };
  circle.topics.push(topic);
  return { circle, topic };
}
export function postMessage(circle, { text, item, topic, author = 'me' }) {
  if (!text.trim()) throw new Error('Напишите сообщение');
  const msg = { id: crypto.randomUUID(), text: text.trim(), author, item: item || null, topic: topic || null, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) };
  circle.messages.push(msg);
  return msg;
}
export function restoreAvailability(state, itemId) {
  state.availability[itemId] = true;
  for (const circle of state.circles) {
    for (const topic of circle.topics) {
      if (!topic.archived && topic.wait.includes(itemId)) {
        state.notifications.unshift({ id: crypto.randomUUID(), title: 'Снова доступно', text: `${listingById(itemId).title} · ${circle.name}`, circleId: circle.id, topicId: topic.id, recipients: [...circle.members], read: false });
      }
    }
  }
}
export function splitBill(total, members) {
  const kopecks = Math.round(total * 100);
  return members.map((id, index) => ({ id, amount: (Math.floor(kopecks / members.length) + (index < kopecks % members.length ? 1 : 0)) / 100 }));
}
