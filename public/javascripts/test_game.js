// const { array } = require("joi");
// const { createCardStateRowsAndCardsRows } = require("../../controller/db_engine_game_uno");

const { socketIDRoomIndex } = require("../../server/constants");

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
        let computedStyle = window.getComputedStyle(this.element);
        let offsetX = -parseInt(computedStyle.width, 10)/2 - parseInt(computedStyle.marginLeft, 10);
        let offsetY = -parseInt(computedStyle.height, 10)/2 - parseInt(computedStyle.marginTop, 10);

        let posX = (x + offsetX);
        let posY = (y + offsetY);

        if (this.boundary) {
            let boundaryRect = this.boundary.getBoundingClientRect();
            if (posX < boundaryRect.left) {
                posX = boundaryRect.left
            } else if (posX > boundaryRect.right + 2 * offsetX) {
                posX = boundaryRect.right + 2 * offsetX
            }
            if (posY < boundaryRect.top) {
                posY = boundaryRect.top
            } else if (posY > boundaryRect.bottom + 2 * offsetY) {
                posY = boundaryRect.bottom + 2 * offsetY
            }
        }

        this.element.style.left = posX + "px";
        this.element.style.top = posY + "px";
    }
    
    dragMouseDown(event) {

        if (this.element.getAttribute("disabled") !== null) {
            console.log("It was disabled!");
            return;
        } else {
            console.log("It was not disabled");
        }

        event.preventDefault();

        document.onmouseup = this.dragMouseUp.bind(this);
        document.onmousemove = this.dragMouseMove.bind(this);
    
        this.parent = this.element.parentElement;
        this.element.style.position = "absolute";
        this.element.style.transform = "none";
        this.element.style.width = "auto";
        this.element.style.height = "auto";
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
    
        let mouseX = event.clientX;
        let mouseY = event.clientY;

        let parented = false;

        for (let container of this.containers) {
            let rect = container.getBoundingClientRect();
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
    let cardWrapper = document.createElement("div");
    cardWrapper.classList.add("cardWrapper", "dragCard");

    let card = document.createElement("div");
    card.classList.add("unoCard", "num-4", "green");

    let inner = document.createElement("span");
    inner.classList.add("inner");

    let mark = document.createElement("span");
    mark.classList.add("mark");

    inner.appendChild(mark);
    card.appendChild(inner);
    cardWrapper.appendChild(card);

    return cardWrapper;
}

let hand = document.getElementById("playerHand");
let discard = document.getElementById("discard");
let drawCard = document.getElementById("drawCard");
let table = document.getElementById("gameTable");

let myCards = [];
for (let i = 0; i < hand.children.length; i++) {
    myCards.push(hand.children[i]);
}

let containers = [
    hand,
    discard,
];

for (let card of myCards) {
    let draggable = new Draggable(card, containers, table);
    draggable.setCallback((parentContainer) => {
        if (parentContainer === discard) {
            //card.remove();
            discard.innerHTML = "";
            discard.appendChild(card);
            draggable.destroy();
        }
    });
}

let drawCardParent = drawCard.parentElement;
let draggable = new Draggable(drawCard, [hand], table);
draggable.setCallback((parentContainer) => {
    if (parentContainer === hand) {
        console.log("Drew a card!");
        drawCardParent.appendChild(drawCard);
        let newCard = createCard();
        hand.appendChild(newCard);
        /*
        myCards.push(newCard);

        for (let card of myCards) {
            
        }*/

        let draggable = new Draggable(newCard, containers, table);
        draggable.setCallback((parentContainer) => {
            if (parentContainer === discard) {
                draggable.destroy();
            }
        });
    }
});

// GetHand structure
/*
    "Cards".game_id,
    "CardInfo".type AS card_info_type,
    "CardInfo".color AS card_color,
    "CardInfo".content AS card_content,
    "Collection".player_id,
    "Collection".collection_index,
    "Collection".card_state_id,
    "Collection".collection_info_id,
    "CardState".card_info_id,
    "CollectionInfo".type AS collection_info_type
*/

class UnoGameRenderer {
    constructor (viewerPlayerId) {
        this.viewerPlayerId = viewerPlayerId;
        this.handContainers = {};
        this.hands = {};        // [player_id] = [element, element, element]
        this.drawPile = [];     // [element, element, element]
        this.playPile = [];     // [element, element, element]
    }

    addPlayer(userId, container) {
        this.handContainer[userId] = container
        this.hands[userId] = {};
    }

    playCard(cardId) {
        // Post request with card id
    }

    updateHand(playerId, hand) {

    }

    updateGameState(gameState) {
        // Get play pile cards, update on callback?
        // Get my hand cards, update on callback?

        // Do we need to do anything with the draw pile?
        
        // Iterate through player hands
        gameState.players.forEach((player) => {
            // If new card, add (animate from draw pile later)
            for (let i = player.collection.length; i < this.hands[player.player_id].length; i++) {
                // Add card to hand
            }
            // If missing card, move to play pile (animate later)
            for (let i = this.hands[player.player_id].length; i < player.collection.length; i++) {
                // Reparent card to play pile
            }
        });


    }

    startTurn() {
        //let myHand = 

        // Make draw stack draggable
        //if () {
            
        //}

        // Make my cards draggable

        // Hook up draggable callback to play card?
            // Submit move and end turn
    }

    endTurn() {
        // Make cards no longer draggable
    }

}

// getPlayers()
//    [id, id, id, id]
