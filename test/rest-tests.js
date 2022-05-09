const mw = require('../src/middleware')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const assert = require('assert');
const DB = require('../src/database')

before(
    async () => {
        mw.start()
        DB.init()
    }
)

describe(
    'Test Image retreival',
    () => {
        it('Test pull card img', async () => {
            await axios.get("http://localhost:3030/cardImg/Brilliant-Stars-Ultra-Ball-150").then(
                (res) => {
                    assert.ok(res.status === 200)
                }
            ).catch(
                (err) => {
                    fail(err)
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
            let cards = await axios.get("http://localhost:3030/cards/0?name=Brilliant-Stars-Ultra-Ball-150")
            assert.ok(cards.data.total === 1, `number of results not right ${JSON.stringify(cards.data)}`)
            assert.ok(cards.data.cards[0].cardId === 'Brilliant-Stars-Ultra-Ball-150', `Name is not right ${JSON.stringify(cards.data)}`)
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
            let cards = JSON.parse(fs.readFileSync('./test/data/testCollection.json'))
            for (let card of cards) {
                try {
                    await axios.put("http://localhost:3030/collections/card", card)
                } catch (err) {
                    return new Error(err)
                }

            }
        })
        it('Test Get Cards', async () => {
            let resCol1 = await axios.get("http://localhost:3030/collections/collection1/cards/0")
            let resCol2 = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(resCol1.data.count, 3, `Number of cards in Collection 1 not right ${JSON.stringify(resCol1.data)}`)
            assert.equal(resCol2.data.count, 1, `Number of cards in Collection 2 not right ${JSON.stringify(resCol2.data)}`)
        })
        it('Update cards', async () => {
            await axios.put("http://localhost:3030/collections/card",
                {
                    "cardId": "Brilliant-Stars-Choice-Belt-135",
                    "collection": "collection2",
                    "variant": "Normal",
                    "paid": 1.0,
                    "count": 2,
                    "grade": "CGC 10"
                })
            let res = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(res.data.count, 1)
            let cards = res.data.cards
            assert.equal(cards[0].variant, "Normal", `variant not set ${JSON.stringify(cards[0], null, 1)}`)
            assert.equal(cards[0].paid, 1.0, `Paid not set ${cards}`)
            assert.equal(cards[0].count, 2, `Count not set ${cards}`)
            await axios.put("http://localhost:3030/collections/card",
                {
                    "cardId": "Brilliant-Stars-Choice-Belt-135",
                    "collection": "collection2",
                    "variant": "Reverse Holo",
                    "paid": 1.0,
                    "count": 1,
                    "grade": "CGC 10"
                })
            let res2 = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(res2.data.count, 2)
        })

        it('Delete card', async () => {
            await axios.delete("http://localhost:3030/collections/card",
                {
                    "data":
                    {
                        "cardId": "Brilliant-Stars-Choice-Belt-135",
                        "collection": "collection2",
                        "variant": "Normal",
                        "paid": 1.0,
                        "count": 2,
                        "grade": "CGC 10"
                    }
                })
            let res = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(res.data.count, 1)
        })

        it("Delete collection", async () => {
            await axios.delete("http://localhost:3030/collections",
                { 'data': { 'name': 'collection2' } }
            )
            let colls = await axios.get("http://localhost:3030/collections/")
            let res = await axios.get("http://localhost:3030/collections/collection2/cards/0")
            assert.equal(colls.data.length, 1, "collection not deleted")
            assert.equal(res.data.count, 0, "cards not deleted")
        })
    }
)

after(
    () => {
        mw.stop()
        fs.rmSync(path.join(DB.pwd(), "./sql/collections.sqlite3"))
    }
)