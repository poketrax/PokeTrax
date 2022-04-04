import React from 'react';
import { init, checkForSets } from "./CardDB"

test('Test pull', () => {
  init("test/data/meta.json", "test/data/cards.json", true)
  checkForSets()
});
