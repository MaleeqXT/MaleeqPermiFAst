import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeMessages, messageView, conversationView } from './chatData.js';

test('socket echo, API response and reconnect catch-up never duplicate messages', () => {
  const a = { id: 2, message: 'Bonjour', read_at: '2026-09-21T10:00:00Z' };
  const result = mergeMessages([a], [{ ...a, read_at: null }, { id: 1, message: 'older' }]);
  assert.deepEqual(result.map((m) => m.id), [1, 2]);
  assert.equal(result[1].read_at, a.read_at);
});
test('real sender identity and persisted read watermark determine display', () => {
  const view = messageView({ id: 5, sender_id: 12, message: 'same\nsame', created_at: '2026-09-21T10:00:00Z' }, '12', 5);
  assert.equal(view.direction, 'outgoing');
  assert.equal(view.read, true);
  assert.deepEqual(view.lines, ['same', 'same']);
});
test('conversation display uses the peer, not mock profile data', () => {
  const view = conversationView({ id: 'thread', participants: [{ user_id: 1, user: { name: 'Me' } }, { user_id: 2, user: { name: 'Test Monitor', role: 'Moniteur' } }], unread_count: 3 }, 1);
  assert.equal(view.name, 'Test Monitor');
  assert.equal(view.unreadCount, 3);
  assert.equal(view.initials, 'TM');
});
