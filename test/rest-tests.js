const mw = require('../src/server/middleware')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const assert = require('assert');
const DB = require('../src/server/database')

before(
    async () => {
        await mw.start()
    }
)

describe(
    'Test Image retreival',
    () => {
        it('Test pull card img', async () => {
            await axios.get(`http://localhost:3030/cardImg/${encodeURIComponent(`SWSH09-Brilliant-Stars-Ultra-Ball-150`)}`).then(
                (res) => {
                    assert.ok(res.status === 200)
                }
            ).catch(
                (err) => {
                    // console.log(err.response)
                    fail(err.response)
                }
            )
        })
        it('Test pull series img', async () => {
            await axios.get(`http://localhost:3030/seriesImg/Sword%20&%20Shield`).then(
                (res) => {
                    assert.ok(res.status === 200)
                }
            ).catch(
                (err) => {
                    fail(err)
                }
            )
        })
        it('Test pull expLogo img', async () => {
            await axios.get(`http://localhost:3030/expLogo/Brilliant%20Stars`).then(
                (res) => {
                    assert.ok(res.status === 200)
                }
            ).catch(
                (err) => {
                    fail(err)
                }
            )
        })
        it('Test pull expSymbol img', async () => {
            await axios.get(`http://localhost:3030/expSymbol/Brilliant%20Stars`).then(
                (res) => {
                    assert.ok(res.status === 200)
                }
            ).catch(
                (err) => {
                    throw new Error(err)
                }
            )
        })
    }
)

describe(
    'Meta Rest Tests',
    () => {
        it('Test Pull series', async () => {
            let series = await axios.get("http://localhost:3030/series")
            assert.ok(series.data.find((value) => value.name === 'Sword & Shield'), "Cound not find series")
        });
        it('Test Pull Expansions', async () => {
            let exps = await axios.get("http://localhost:3030/expansions")
            assert.ok(exps.data.find((value) => value.name === 'Brilliant Stars'), "Could not find expansion")
        });
    }
)

describe(
    'Card Rest Search Tests',
    () => {
        it('Search all cards', async () => {
            let cards = await axios.get("http://localhost:3030/cards/0")
            assert.ok(cards.data.total != 0, `No results found ${cards.data}`)
        });
        it('Search for 1 card', async () => {
            let cards = await axios.get(`http://localhost:3030/cards/0?name=${encodeURIComponent(`Brilliant Stars Ultra Ball 150`)}`)
            assert.equal(cards.data.total, 1, `number of results not right ${JSON.stringify(cards.data)}`)
            assert.equal(cards.data.cards[0].cardId, 'SWSH09-Brilliant-Stars-Ultra-Ball-150', `Name is not right ${JSON.stringify(cards.data)}`)
        });
    }
)

describe(
    'Collection Rest Tests',
    () => {
        it('Add Collection', async () => {
            let res = await axios.put("http://localhost:3030/collections", { 'name': 'collection1' })
            await axios.put("http://localhost:3030/collections", { 'name': 'collection2' })
            assert.ok(res.status === 201)
        })
        it('Get Collections', async () => {
            return axios.get("http://localhost:3030/collections").then(
                (res) => {
                    assert.ok(res.data.find((value) => value.name === 'collection1'), `Did not find collection ${res.data}`)
                }
            ).catch(
                (err) => {
                    console.log(err)
                }
            )
        })
        it('Add Cards', async () => {
            let cards = JSON.parse(fs.readFileSync('./test/testCollection.json'))
            for (let card of cards) {
                try {
                    let res = await axios.put("http://localhost:3030/collections/card", card)
                    assert.equal(res.status, 201, `Status not right ${res.status}`)
                } catch (err) {
                    return new Error(err)
                }
            }
        })

        it('Test Get Cards', async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            let resCol1 = await axios.get("http://localhost:3030/collections/collection1/cards/0")
            let resCol2 = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(resCol1.data.total, 3, `Number of cards in Collection 1 not right ${JSON.stringify(resCol1.data)}`)
            assert.equal(resCol2.data.total, 1, `Number of cards in Collection 2 not right ${JSON.stringify(resCol2.data)}`)
        })

        it('Update cards', async () => {
            await axios.put("http://localhost:3030/collections/card",
                {
                    "cardId": "SWSH09-Brilliant-Stars-Choice-Belt-135",
                    "collection": "collection2",
                    "variant": "Normal",
                    "paid": 1.0,
                    "count": 2,
                    "grade": "",
                    "idTCGP": 263857,
                    "name": "Choice Belt",
                    "expIdTCGP": "SWSH09 Brilliant Stars",
                    "expName": "Brilliant Stars",
                    "expCardNumber": "135",
                    "expCodeTCGP": "SWSH09",
                    "rarity": "Uncommon",
                    "img": "https://product-images.tcgplayer.com/fit-in/437x437/263857.jpg",
                    "price": 0.17,
                    "description": "The attacks of the Pokemon this card is attached to do 30 more damage to your opponent's Active Pokemon V <em>(before applying Weakness and Resistance)</em>.",
                    "releaseDate": "2022-02-25T00:00:00Z",
                    "energyType": "",
                    "cardType": "Item",
                    "pokedex": 100000,
                    "variants": "[\"Normal\",\"Reverse Holofoil\"]"
                })
            let res = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(res.data.total, 1)
            let cards = res.data.cards
            assert.equal(cards[0].variant, "Normal", `variant not set ${JSON.stringify(cards[0], null, 1)}`)
            assert.equal(cards[0].paid, 1.0, `Paid not set ${JSON.stringify(cards[0])}`)
            assert.equal(cards[0].count, 2, `Count not set ${cards[0]}`)
            await axios.put("http://localhost:3030/collections/card",
                {
                    "cardId": "SWSH09-Brilliant-Stars-Choice-Belt-135",
                    "collection": "collection2",
                    "variant": "Reverse Holofoil",
                    "paid": 1.0,
                    "count": 1,
                    "grade": "",
                    "idTCGP": 263857,
                    "name": "Choice Belt",
                    "expIdTCGP": "SWSH09 Brilliant Stars",
                    "expName": "Brilliant Stars",
                    "expCardNumber": "135",
                    "expCodeTCGP": "SWSH09",
                    "rarity": "Uncommon",
                    "img": "https://product-images.tcgplayer.com/fit-in/437x437/263857.jpg",
                    "price": 0.17,
                    "description": "The attacks of the Pokemon this card is attached to do 30 more damage to your opponent's Active Pokemon V <em>(before applying Weakness and Resistance)</em>.",
                    "releaseDate": "2022-02-25T00:00:00Z",
                    "energyType": "",
                    "cardType": "Item",
                    "pokedex": 100000,
                    "variants": "[\"Normal\",\"Reverse Holofoil\"]"
                })
            let res2 = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(res2.data.total, 2)
        })

        it('Delete card', async () => {
            await axios.delete("http://localhost:3030/collections/card",
                {
                    "data":
                    {
                        "cardId": "SWSH09-Brilliant-Stars-Choice-Belt-135",
                        "collection": "collection2",
                        "variant": "Normal",
                        "paid": 1.0,
                        "count": 2,
                        "grade": "",
                        "idTCGP": 263857,
                        "name": "Choice Belt",
                        "expIdTCGP": "SWSH09 Brilliant Stars",
                        "expName": "Brilliant Stars",
                        "expCardNumber": "135",
                        "expCodeTCGP": "SWSH09",
                        "rarity": "Uncommon",
                        "img": "https://product-images.tcgplayer.com/fit-in/437x437/263857.jpg",
                        "price": 0.17,
                        "description": "The attacks of the Pokemon this card is attached to do 30 more damage to your opponent's Active Pokemon V <em>(before applying Weakness and Resistance)</em>.",
                        "releaseDate": "2022-02-25T00:00:00Z",
                        "energyType": "",
                        "cardType": "Item",
                        "pokedex": 100000,
                        "variants": "[\"Normal\",\"Reverse Holofoil\"]"
                    }
                })
            let res = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(res.data.total, 1)
        })

        it("Delete collection", async () => {
            await axios.delete("http://localhost:3030/collections",
                { 'data': { 'name': 'collection2' } }
            )
            let colls = await axios.get("http://localhost:3030/collections/")
            let res = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(colls.data.length, 1, "collection not deleted")
            assert.equal(res.data.total, 0, "cards not deleted")
        })
    }
)

after(
    () => {
        mw.stop()
        fs.rmSync(DB.pwd(), { recursive: true, force: true })
    }
)