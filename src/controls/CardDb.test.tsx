import React from 'react';
import { CardDB } from "./CardDB"
import { firstValueFrom } from 'rxjs'


test(`Test generalize`, () => {
  let tcgsets = `diamond-and-pearl-promo`
  let names = `DP Black Star Promos`
  let db = new CardDB('test/data', true)
  let normtcg = db.normalize(tcgsets)
  let normSet = db.normalize(names)
  console.log(`tcg: ${normtcg}\nset: ${normSet}`)
})

test('Test pull sets', () => {
  let db = new CardDB('test/data', true)
  db.checkForSets()
  return firstValueFrom(db.progress)
}, 60000);
 