const assert = require('assert')
const mw = require('../src/middleware')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

before(
    () => {
        mw.start()
    }
)

describe(
    'Meta Rest Tests',
    () => {
        it('Test Pull series', async () => {
            let series = await axios.get("http://localhost:3030/series")
            assert(series.data.find((value) => value.name === 'Sword & Shield'), "Cound not find series")
        });
        it('Test Pull Expansions', async () => {
            let exps = await axios.get("http://localhost:3030/expansions")
            assert(exps.data.find((value) => value.name === 'Brilliant Stars'), "Could not find expansion")
        });
    }
)

describe(
    'Card Rest Search Tests',
    () => {
        it('Search all cards', async () => {
            let cards = await axios.get("http://localhost:3030/cards/0")
            assert(cards.data.total != 0, `No results found ${cards.data}`)
        });
        it('Search for 1 card', async () => {
            let cards = await axios.get("http://localhost:3030/cards/0?name=Brilliant-Stars-Ultra-Ball-150")
            assert(cards.data.total === 1, `number of results not right ${JSON.stringify(cards.data)}`)
            assert(cards.data.cards[0].cardId === 'Brilliant-Stars-Ultra-Ball-150', `Name is not right ${JSON.stringify(cards.data)}`)
        });
    }
)

describe(
    'Collection Rest Tests',
    () => {
        it('Add Collection', async () => {
            let res =  await axios.put("http://localhost:3030/collections", {'name': 'My collection'})
            assert(res.status === 201)
        })
        it('Get Collections', async () => {
            let collections = await axios.get("http://localhost:3030/collections")
            assert(collections.data.find((value) => value.name === 'My collection'), `Did not find collection ${collections.data}`)
        })
    }
)

after(
    () => {
        mw.stop()
        fs.rmSync(path.join(mw.pwd(), "./sql/collections.sqlite3"))
    }
)