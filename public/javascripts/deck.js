/**
Number cards, a breakdown: (excluding black)
0 – 1 card for each color, so 4 in total 
1 – 2 cards for each color, so 8 in total
2 – 2 cards for each color, so 8 in total
3 – 2 cards for each color, so 8 in total
4 – 2 cards for each color, so 8 in total
5 – 2 cards for each color, so 8 in total
6 – 2 cards for each color, so 8 in total
7 – 2 cards for each color, so 8 in total
8 – 2 cards for each color, so 8 in total
9 – 2 cards for each color, so 8 in total

8 Skip cards – two cards of each color
8 Reverse cards – two cards of each color
8 Draw cards – two cards of each color
8 Black cards – 4 wild cards and 4 Wild Draw 4 cards
13 * 8 + 4 = 108 total cards
*/
const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const colors = ["blue", "red", "green", "yellow"];
const specials = ["skip", "reverse", "drawTwo"];
const wilds = ["wild", "wildFour"]; // blacks
export default class Deck {
    constructor(cards = newDeck()) {
        this.cards = cards;
    }

    // Apply Fisher - Yates Shuffle
    shuffle() {
        const copy = [];
        let currentLength = this.cards.length,
            i;
        while (currentLength) {
            i = Math.floor(Math.random() * currentLength--);
            copy.push(this.cards.splice(i, 1)[0]);
        }
        this.cards = copy;
    }
}

class Card {
    constructor(color, value) {
        (this.color = color), (this.value = value);
    }
}

// shuffle a new deck for every game
function newDeck() {
    const tempDeck = [];
    // generate 0 - 1 card with 2 of each color
    for (const value of values) {
        if (value === 0) {
            for (const color of colors) {
                tempDeck.push(new Card(color, 0));
            }
        }
        // generate 1 - 9 with 2 cards for each color
        for (const color of colors) {
            // tempDeck.push(new Card(color, value), new Card(color, value));
            tempDeck.push(new Card(color, value));
            tempDeck.push(new Card(color, value));
        }
    }
    // generate skip, reverse, drawTwo
    for (const color of colors) {
        for (const specialCard of specials) {
            // tempDeck.push(
            //     new Card(color, specialCard),
            //     new Card(color, specialCard)
            // );
            tempDeck.push(new Card(color, specialCard));
            tempDeck.push(new Card(color, specialCard));
        }
    }
    // generate wild cards 4 each.
    for (let i = 0; i < 4; i++) {
        // tempDeck.push(new Card("black", wilds[0]), new Card("black", wilds[1]));
        tempDeck.push(new Card("black", wilds[0]));
        tempDeck.push(new Card("black", wilds[1]));
    }
    return tempDeck;
}
