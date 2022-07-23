const mw = require("../src/server/middleware");
const fs = require("fs");
const fetch = require("node-fetch");
const assert = require("assert");
const { pwd } = require("../src/server/utils");

before(() => mw.start());

describe("Test Image retreival", () => {
    it("Test pull card img", async () => {
        const res = await fetch(
            `http://localhost:3030/cardImg/${encodeURIComponent(
                `SWSH09-Brilliant-Stars-Ultra-Ball-150`
            )}`
        );
        assert.equal(res.status, 200);
    });
    it("Test pull series img", async () => {
        const res = await fetch(
            `http://localhost:3030/seriesImg/Sword%20&%20Shield`
        );
        assert.equal(res.status, 200);
    });
    it("Test pull expLogo img", async () => {
        const res = await fetch(
            `http://localhost:3030/expLogo/Brilliant%20Stars`
        );
        assert.equal(res.status, 200);
    });
    it("Test pull expSymbol img", async () => {
        const res = await fetch(
            `http://localhost:3030/expSymbol/Brilliant%20Stars`
        );
        assert.equal(res.status, 200);
    });
});

describe("Meta Rest Tests", () => {
    it("Test Pull series", async () => {
        const series = await fetch("http://localhost:3030/series").then((res) =>
            res.json()
        );
        assert.ok(
            series.find((value) => value.name === "Sword & Shield"),
            "Cound not find series"
        );
    });
    it("Test Pull Expansions", async () => {
        const exps = await fetch("http://localhost:3030/expansions").then(
            (res) => res.json()
        );
        assert.ok(
            exps.find((value) => value.name === "Brilliant Stars"),
            "Could not find expansion"
        );
    });
});

describe("Card Rest Search Tests", () => {
    it("Search all cards", async () => {
        const cards = await fetch("http://localhost:3030/cards/0").then((res) =>
            res.json()
        );
        assert.notEqual(cards.total, 0);
    });
    it("Search for 1 card", async () => {
        const cards = await fetch(
            `http://localhost:3030/cards/0?name=${encodeURIComponent(
                "Brilliant Stars Ultra Ball 150"
            )}`
        ).then((res) => res.json());
        assert.equal(
            cards.total,
            1,
            `number of results not right ${JSON.stringify(cards)}`
        );
        assert.equal(
            cards.cards[0].cardId,
            "SWSH09-Brilliant-Stars-Ultra-Ball-150",
            `Name is not right ${JSON.stringify(cards)}`
        );
    });
});

describe("Collection Rest Tests", () => {
    it("Add Collection", async () => {
        const c1 = fetch("http://localhost:3030/collections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "collection1" }),
        });
        const c2 = fetch("http://localhost:3030/collections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "collection2" }),
        });
        const res = await Promise.all([c1, c2]);
        res.forEach((r) => assert.ok(r.status, 200));
    });
    it("Get Collections", async () => {
        const res = await fetch("http://localhost:3030/collections").then(
            (res) => res.json()
        );
        assert.ok(
            res.find((value) => value.name === "collection1"),
            `Did not find collection ${JSON.stringify(res)}`
        );
    });

    it("Add Cards", async () => {
        const cards = JSON.parse(fs.readFileSync("./test/testCollection.json"));
        const reqs = cards.map((card) =>
            fetch("http://localhost:3030/collections/card", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(card),
            })
        );
        const res = await Promise.all(reqs);
        res.forEach(({ status }) =>
            assert.equal(status, 201, `Status not right ${status}`)
        );
    });

    it("Test Get Cards", async () => {
        const [col1, col2] = [
            fetch("http://localhost:3030/collections/collection1/cards/0"),
            fetch("http://localhost:3030/collections/collection2/cards/0"),
        ].map((res) => res.then((r) => r.json()));
        const [res1, res2] = await Promise.all([col1, col2]);
        assert.equal(
            res1.total,
            3,
            `Number of cards in Collection 1 not right ${JSON.stringify(
                res1.total
            )}`
        );
        assert.equal(
            res2.total,
            1,
            `Number of cards in Collection 2 not right ${JSON.stringify(
                res2.total
            )}`
        );
    });

    it("Update cards", async () => {
        await fetch("http://localhost:3030/collections/card", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cardId: "SWSH09-Brilliant-Stars-Choice-Belt-135",
                collection: "collection2",
                variant: "Normal",
                paid: 1.0,
                count: 2,
                grade: "",
                idTCGP: 263857,
                name: "Choice Belt",
                expIdTCGP: "SWSH09 Brilliant Stars",
                expName: "Brilliant Stars",
                expCardNumber: "135",
                expCodeTCGP: "SWSH09",
                rarity: "Uncommon",
                img: "https://product-images.tcgplayer.com/fit-in/437x437/263857.jpg",
                price: 0.17,
                description:
                    "The attacks of the Pokemon this card is attached to do 30 more damage to your opponent's Active Pokemon V <em>(before applying Weakness and Resistance)</em>.",
                releaseDate: "2022-02-25T00:00:00Z",
                energyType: "",
                cardType: "Item",
                pokedex: 100000,
                variants: '["Normal","Reverse Holofoil"]',
            }),
        });
        const res = await fetch(
            "http://localhost:3030/collections/collection2/cards/0"
        ).then((res) => res.json());
        assert.equal(res.total, 1);
        const { cards } = res;
        assert.equal(
            cards[0].variant,
            "Normal",
            `variant not set ${JSON.stringify(cards[0], null, 1)}`
        );
        assert.equal(
            cards[0].paid,
            1.0,
            `Paid not set ${JSON.stringify(cards[0])}`
        );
        assert.equal(cards[0].count, 2, `Count not set ${cards[0]}`);
        await fetch("http://localhost:3030/collections/card", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cardId: "SWSH09-Brilliant-Stars-Choice-Belt-135",
                collection: "collection2",
                variant: "Reverse Holofoil",
                paid: 1.0,
                count: 1,
                grade: "",
                idTCGP: 263857,
                name: "Choice Belt",
                expIdTCGP: "SWSH09 Brilliant Stars",
                expName: "Brilliant Stars",
                expCardNumber: "135",
                expCodeTCGP: "SWSH09",
                rarity: "Uncommon",
                img: "https://product-images.tcgplayer.com/fit-in/437x437/263857.jpg",
                price: 0.17,
                description:
                    "The attacks of the Pokemon this card is attached to do 30 more damage to your opponent's Active Pokemon V <em>(before applying Weakness and Resistance)</em>.",
                releaseDate: "2022-02-25T00:00:00Z",
                energyType: "",
                cardType: "Item",
                pokedex: 100000,
                variants: '["Normal","Reverse Holofoil"]',
            }),
        });
        const res2 = await fetch(
            "http://localhost:3030/collections/collection2/cards/0"
        ).then((res) => res.json());
        assert.equal(res2.total, 2);
    });

    it("Delete card", async () => {
        await fetch("http://localhost:3030/collections/card", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cardId: "SWSH09-Brilliant-Stars-Choice-Belt-135",
                collection: "collection2",
                variant: "Normal",
                paid: 1.0,
                count: 2,
                grade: "",
                idTCGP: 263857,
                name: "Choice Belt",
                expIdTCGP: "SWSH09 Brilliant Stars",
                expName: "Brilliant Stars",
                expCardNumber: "135",
                expCodeTCGP: "SWSH09",
                rarity: "Uncommon",
                img: "https://product-images.tcgplayer.com/fit-in/437x437/263857.jpg",
                price: 0.17,
                description:
                    "The attacks of the Pokemon this card is attached to do 30 more damage to your opponent's Active Pokemon V <em>(before applying Weakness and Resistance)</em>.",
                releaseDate: "2022-02-25T00:00:00Z",
                energyType: "",
                cardType: "Item",
                pokedex: 100000,
                variants: '["Normal","Reverse Holofoil"]',
            }),
        });
        const res = await fetch(
            "http://localhost:3030/collections/collection2/cards/0"
        ).then((r) => r.json());
        assert.equal(res.total, 1);
    });

    it("Delete collection", async () => {
        await fetch("http://localhost:3030/collections", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "collection2" }),
        });
        let colls = await fetch("http://localhost:3030/collections/").then(
            (r) => r.json()
        );
        let res = await fetch(
            "http://localhost:3030/collections/collection2/cards/0"
        ).then((r) => r.json());
        assert.equal(colls.length, 1, "collection not deleted");
        assert.equal(res.total, 0, "cards not deleted");
    });
});

after(() => {
    mw.stop();
    fs.rmSync(pwd(), { recursive: true, force: true });
});
