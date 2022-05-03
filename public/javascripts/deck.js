/**
 *
 * // shuffle a new deck for every game
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
        tempDeck.push(new Card('black', wilds[0]));
        tempDeck.push(new Card('black', wilds[1]));
    }
    return tempDeck;
}
 *
 *
Number cards, a breakdown:
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

// Pull the data for the numbered cards for the following colors; red, blue, yellow, green
//  make copies of those cards per color following the instructions above.
// Pull the black cards and make their copies based on instruction above.
// Shuffle the new deck and insert them in the Card Table and Card.

/**
 * TODO: Make the Deck first and shulffe them.
 */
