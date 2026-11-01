import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, rankItems, setVote, createTopic, postMessage, restoreAvailability, isFriend, splitBill } from '../model.mjs';

test('взаимная подписка создаёт дружбу, односторонняя — нет', () => {
  const state = seed();
  assert.equal(isFriend(state, 'sasha'), true);
  assert.equal(isFriend(state, 'ira'), false);
  state.following.push('ira', 'artem');
  assert.equal(isFriend(state, 'ira'), true);
  assert.equal(isFriend(state, 'artem'), false);
});
test('новая совместная подборка создаёт круг с уникальными участниками', () => {
  const state = seed();
  const initial = state.circles.length;
  const { circle, topic } = createTopic(state, { name: 'Поездка', members: ['me', 'masha', 'masha'] });
  assert.deepEqual(circle.members, ['me', 'masha']);
  assert.equal(circle.topics[0], topic);
  assert.equal(state.circles.length, initial + 1);
});
test('подборка в существующем круге не создаёт новый чат', () => {
  const state = seed();
  const initial = state.circles.length;
  const weekendTopics = state.circles[0].topics.length;
  createTopic(state, { name: 'Отпуск', circleId: 'weekend' });
  assert.equal(state.circles.length, initial);
  assert.equal(state.circles[0].topics.length, weekendTopics + 1);
});
test('рейтинг: 3, 2, 1 балл; совпадения; повторный голос заменяет предыдущий', () => {
  const topic = seed().circles[0].topics[0];
  assert.deepEqual(rankItems(topic)[0], { id: 'a', score: 8, count: 3 });
  setVote(topic, 'me', ['c', 'd', 'b'], ['me']);
  setVote(topic, 'me', ['a', 'b', 'd'], ['me']);
  assert.equal(rankItems(topic)[0].score, 11);
  assert.throws(() => setVote(topic, 'me', ['a', 'a', 'b'], ['me']));
  assert.throws(() => setVote(topic, 'stranger', ['a', 'b', 'd'], ['me']));
  topic.archived = true;
  assert.throws(() => setVote(topic, 'me', ['a', 'b', 'd'], ['me']));
});
test('комментарий хранит связь с объявлением и подборкой в общем чате', () => {
  const circle = seed().circles[0];
  const message = postMessage(circle, { text: '  Берём!  ', item: 'a', topic: 'house' });
  assert.equal(message.text, 'Берём!');
  assert.equal(circle.messages.at(-1).item, 'a');
  assert.equal(circle.messages.at(-1).topic, 'house');
  assert.throws(() => postMessage(circle, { text: '  ' }));
});
test('возврат в наличие уведомляет всех участников подписанного круга', () => {
  const state = seed();
  state.circles[0].topics[0].wait.push('c');
  restoreAvailability(state, 'c');
  assert.equal(state.availability.c, true);
  assert.equal(state.notifications.length, 1);
  assert.deepEqual(state.notifications[0].recipients, ['me', 'sasha', 'masha', 'dima']);
});
test('деление счёта не теряет копейки', () => {
  const shares = splitBill(100, ['me', 'sasha', 'masha']);
  assert.equal(shares.reduce((sum, s) => sum + Math.round(s.amount * 100), 0), 10000);
  assert.deepEqual(shares.map(s => s.amount), [33.34, 33.33, 33.33]);
});
