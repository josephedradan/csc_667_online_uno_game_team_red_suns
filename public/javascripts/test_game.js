// const { array } = require("joi");
// const { createCardStateRowsAndCardsRows } = require("../../controller/db_engine_game_uno");
// TODO: FIX DISABLE ON not TURN
class Draggable {
    constructor(element, containers, boundary) {
        this.containers = containers;
        this.parent = element.parentElement;
        this.element = element;
        this.callback = null;
        this.boundary = boundary;
        this.element.onmousedown = this.dragMouseDown.bind(this);
    }

    moveToPosition(x, y) {
        const computedStyle = window.getComputedStyle(this.element);
        const offsetX = -parseInt(computedStyle.width, 10) / 2 - parseInt(computedStyle.marginLeft, 10);
        const offsetY = -parseInt(computedStyle.height, 10) / 2 - parseInt(computedStyle.marginTop, 10);

        let posX = (x + offsetX);
        let posY = (y + offsetY);

        if (this.boundary) {
            const boundaryRect = this.boundary.getBoundingClientRect();
            if (posX < boundaryRect.left) {
                posX = boundaryRect.left;
            } else if (posX > boundaryRect.right + 2 * offsetX) {
                posX = boundaryRect.right + 2 * offsetX;
            }
            if (posY < boundaryRect.top) {
                posY = boundaryRect.top;
            } else if (posY > boundaryRect.bottom + 2 * offsetY) {
                posY = boundaryRect.bottom + 2 * offsetY;
            }
        }

        this.element.style.left = `${posX}px`;
        this.element.style.top = `${posY}px`;
    }

    dragMouseDown(event) {
        if (this.element.getAttribute('disabled') !== null) {
            console.log('It was disabled!');
            return;
        }
        console.log('It was not disabled');

        event.preventDefault();

        document.onmouseup = this.dragMouseUp.bind(this);
        document.onmousemove = this.dragMouseMove.bind(this);

        this.parent = this.element.parentElement;
        this.element.style.position = 'absolute';
        this.element.style.transform = 'none';
        this.element.style.width = 'auto';
        this.element.style.height = 'auto';
        document.body.appendChild(this.element);

        this.moveToPosition(event.clientX, event.clientY);
    }

    dragMouseMove(event) {
        event.preventDefault();

        this.moveToPosition(event.clientX, event.clientY);
    }

    dragMouseUp(event) {
        event.preventDefault();

        document.onmouseup = null;
        document.onmousemove = null;
        this.element.style.top = null;
        this.element.style.left = null;
        this.element.style.position = null;
        this.element.style.transform = null;
        this.element.style.width = null;
        this.element.style.height = null;

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let parented = false;

        for (const container of this.containers) {
            const rect = container.getBoundingClientRect();
            if (mouseX > parseInt(rect.left, 10)
                    && mouseX < parseInt(rect.right, 10)
                    && mouseY > parseInt(rect.top, 10)
                    && mouseY < parseInt(rect.bottom, 10)) {
                container.appendChild(this.element);
                this.parent = this.element.parentElement;
                parented = true;
                if (this.callback) {
                    this.callback(this.parent);
                }
                break;
            }
        }
        if (!parented) {
            this.parent.appendChild(this.element);
        }
    }

    setCallback(func) {
        this.callback = func;
    }

    destroy() {
        this.element.onmousedown = null;
    }
}

function createCard() {
    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('cardWrapper', 'dragCard');

    const card = document.createElement('div');
    card.classList.add('unoCard', 'num-4', 'green');

    const inner = document.createElement('span');
    inner.classList.add('inner');

    const mark = document.createElement('span');
    mark.classList.add('mark');

    inner.appendChild(mark);
    card.appendChild(inner);
    cardWrapper.appendChild(card);

    return cardWrapper;
}

const hand = document.getElementById('playerHand');
const discard = document.getElementById('discard');
const drawCard = document.getElementById('drawCard');
const table = document.getElementById('gameTable');

const myCards = [];
for (let i = 0; i < hand.children.length; i++) {
    myCards.push(hand.children[i]);
}

const containers = [
    hand,
    discard,
];

for (const card of myCards) {
    const draggable = new Draggable(card, containers, table);
    draggable.setCallback((parentContainer) => {
        if (parentContainer === discard) {
            // card.remove();
            discard.innerHTML = '';
            discard.appendChild(card);
            draggable.destroy();
        }
    });
}

const drawCardParent = drawCard.parentElement;
const draggable = new Draggable(drawCard, [hand], table);
draggable.setCallback((parentContainer) => {
    if (parentContainer === hand) {
        console.log('Drew a card!');
        drawCardParent.appendChild(drawCard);
        const newCard = createCard();
        hand.appendChild(newCard);
        /*
        myCards.push(newCard);

        for (let card of myCards) {

        } */

        const draggable = new Draggable(newCard, containers, table);
        draggable.setCallback((parentContainer) => {
            if (parentContainer === discard) {
                draggable.destroy();
            }
        });
    }
});
