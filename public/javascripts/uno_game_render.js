class Draggable {
    constructor(element, containers, boundary) {
        this.dragging = false;
        this.containers = containers;
        this.parent = element.parentElement;
        this.childIndex = 0;
        this.element = element;
        this.dragBeginCallback = null;
        this.dragEndCallback = null;
        this.boundary = boundary;
        // Some hacky way to implement adding and removing listeners
        this.dragMouseDown = this.dragMouseDown.bind(this);
        this.dragMouseMove = this.dragMouseMove.bind(this);
        this.dragMouseUp = this.dragMouseUp.bind(this);

        this.element.addEventListener("mousedown", this.dragMouseDown);
        // this.element.onmousedown = this.dragMouseDown;
    }

    moveToPosition(x, y) {
        const computedStyle = window.getComputedStyle(this.element);
        const offsetX =
            -parseInt(computedStyle.width, 10) / 2 -
            parseInt(computedStyle.marginLeft, 10);
        const offsetY =
            -parseInt(computedStyle.height, 10) / 2 -
            parseInt(computedStyle.marginTop, 10);

        let posX = x + offsetX;
        let posY = y + offsetY;

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
        // If not left click, do nothing
        if (event.which != 1) {
            return;
        }
        if (this.dragging) {
            return;
        }
        if (this.element.getAttribute("disabled") !== null) {
            return;
        }

        this.dragging = true;

        event.preventDefault();

        document.addEventListener("mouseup", this.dragMouseUp);
        document.addEventListener("mousemove", this.dragMouseMove);

        this.parent = this.element.parentElement;
        this.childIndex = Array.from(this.parent.children).indexOf(
            this.element
        );
        this.element.style.position = "absolute";
        this.element.style.transform = "none";
        document.body.appendChild(this.element);

        this.moveToPosition(event.clientX, event.clientY);

        if (this.dragBeginCallback) {
            this.dragBeginCallback();
        }
    }

    dragMouseMove(event) {
        // If not left click, do nothing
        if (event.which != 1) {
            return;
        }
        event.preventDefault();
        // console.log(`${event.clientX} ${event.clientY}`);
        this.moveToPosition(event.clientX, event.clientY);
    }

    dragMouseUp(event) {
        // If not left click, do nothing
        if (event.which != 1) {
            return;
        }

        this.dragging = false;

        event.preventDefault();

        document.removeEventListener("mouseup", this.dragMouseUp);
        document.removeEventListener("mousemove", this.dragMouseMove);
        this.element.style.top = null;
        this.element.style.left = null;
        this.element.style.position = null;
        this.element.style.transform = null;

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let parented = false;

        for (const container of this.containers) {
            const rect = container.getBoundingClientRect();
            // console.log(rect);
            // console.log(mouseX > parseInt(rect.left, 10));
            // console.log(mouseX < parseInt(rect.right, 10));
            // console.log(mouseY > parseInt(rect.top, 10));
            // console.log(mouseY < parseInt(rect.bottom, 10));

            if (
                mouseX > parseInt(rect.left, 10) &&
                mouseX < parseInt(rect.right, 10) &&
                mouseY > parseInt(rect.top, 10) &&
                mouseY < parseInt(rect.bottom, 10)
            ) {
                container.appendChild(this.element);
                this.parent = this.element.parentElement;
                parented = true;
                if (this.dragEndCallback) {
                    this.dragEndCallback(this.parent);
                }
                break;
            }
        }
        if (!parented) {
            this.parent.insertBefore(
                this.element,
                this.parent.children[this.childIndex]
            );
            if (this.dragEndCallback) {
                this.dragEndCallback(this.parent);
            }
        }
    }

    setDragBeginCallback(func) {
        this.dragBeginCallback = func;
    }

    setDragEndCallback(func) {
        this.dragEndCallback = func;
    }

    destroy() {
        this.element.removeEventListener("mousedown", this.dragMouseDown);
        document.removeEventListener("mouseup", this.dragMouseUp);
        document.removeEventListener("mousemove", this.dragMouseMove);
    }
}

class UnoGameRenderer {
    constructor(drawContainer, playContainer) {
        this.drawContainer = drawContainer;
        this.playContainer = playContainer;
        this.handContainers = {};
    }

    addPlayer(userId, container) {
        this.handContainers[userId] = container;
    }

    updateHand(playerId, cardCollection) {
        // If player not in game, don't render
        if (!this.handContainers[playerId]) {
            return;
        }

        // Empty the container
        this.handContainers[playerId].innerHTML = "";

        // Loop through cards and render
        cardCollection.forEach((cardData, index) => {
            const card = this.#generate_card(cardData);

            // Add the card to the hand and the handContainer
            this.handContainers[playerId].appendChild(card);
        });
    }

    // updateCurrentPlayer() {
    //     console.log(this.playerContainer);
    // }

    updateTopCard(cardData) {
        if (!cardData) {
            return;
        }
        // Destroy all but the top card
        this.playContainer.innerHTML = "";
        const newCard = this.#generate_card(cardData); // Generate card with card info
        this.playContainer.appendChild(newCard);
    }

    //* ************************** Card Templates */

    #generate_card(cardData) {
        let card;
        // Figure out what kind of card and render
        if (cardData.type === undefined) {
            card = this.#generate_flipped_card();
        } else if (cardData.color === "black") {
            card = this.#generate_wild_black(cardData.content === "wild");
        } else if (cardData.type == "NUMBER") {
            card = this.#generate_color_card(
                `num-${cardData.content}`,
                cardData.color
            );
        } else {
            card = this.#generate_color_card(cardData.content, cardData.color);
        }
        return card;
    }

    #generate_flipped_card = () => {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");
        const unoCard = document.createElement("div");
        unoCard.classList.add("unoCard", "flipped");
        const shadow = document.createElement("div");
        shadow.classList.add("cardShadow");
        const inner = document.createElement("span");
        inner.classList.add("inner");
        const mark = document.createElement("span");
        mark.classList.add("mark");
        inner.append(mark);
        unoCard.append(inner);
        unoCard.append(shadow);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };

    #generate_color_card = (value, color) => {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");
        const unoCard = document.createElement("div");
        unoCard.classList.add("unoCard", value, color);
        const shadow = document.createElement("div");
        shadow.classList.add("cardShadow");
        const inner = document.createElement("span");
        inner.classList.add("inner");
        const mark = document.createElement("span");
        mark.classList.add("mark");
        inner.append(mark);
        unoCard.append(inner);
        unoCard.append(shadow);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };

    #generate_wild_black = (is_wild /* or is_wildFour */) => {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");
        const unoCard = document.createElement("div");
        unoCard.classList.add(
            "unoCard",
            is_wild ? "wild" : "wildFour",
            "black"
        );
        const shadow = document.createElement("div");
        shadow.classList.add("cardShadow");
        const inner = document.createElement("span");
        inner.classList.add("inner");
        const wildMark = document.createElement("span");
        wildMark.classList.add(is_wild ? "wildMark" : "wildFourMark");

        // 4 colors
        const wildRed = document.createElement("div");
        wildRed.classList.add("wildRed", "wildCard");
        const wildBlue = document.createElement("div");
        wildBlue.classList.add("wildBlue", "wildCard");
        const wildYellow = document.createElement("div");
        wildYellow.classList.add("wildYellow", "wildCard");
        const wildGreen = document.createElement("div");
        wildGreen.classList.add("wildGreen", "wildCard");

        wildMark.append(wildRed);
        wildMark.append(wildBlue);
        wildMark.append(wildYellow);
        wildMark.append(wildGreen);
        inner.append(wildMark);
        unoCard.append(shadow);
        unoCard.append(inner);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };
}

/**
 * TurnController is used to start or end a turn.
 */
class TurnController {
    constructor(drawContainer, playContainer, handContainer, gameWindow) {
        this.drawContainer = drawContainer;
        this.playContainer = playContainer;
        this.handContainer = handContainer;
        this.gameWindow = gameWindow;
        this.draggables = [];
    }
    // note for callbacks that you want to use arrow functions for any form of callbacks if you're using this keyword
    startTurn(cardCollection, playCollection) {
        this.endTurn();
        cardCollection.forEach((cardData) => {
            // console.log(cardData); // card data last element has the discard card
            // console.log(cardData.collection_index);
            const card = this.handContainer.children.item(
                cardData.collection_index
            );
            const draggable = new Draggable(
                card,
                [this.playContainer],
                this.gameWindow
            );
            // kill the animation
            draggable.setDragBeginCallback(async () => {
                // kill card bounce
                removeBounceAnimation(card);
                for (const [idx, reapplyCard] of Object.entries(
                    this.handContainer.children
                )) {
                    removeBounceAnimation(reapplyCard);
                    /*applyBounceAnimation(
                        reapplyCard,
                        playCollection,
                        cardCollection[idx]
                    );*/
                }
            });

            // restart the animation
            draggable.setDragEndCallback(async (newParent) => {
                // debugger;
                if (newParent == this.playContainer) {
                    // debugger;
                    // if card is a wild card, prompt with modal and request the move
                    // console.log(cardData);
                    if (cardData.color == "black") {
                        // Modal!
                        this.handleBlackCardAction(cardData);
                    } else {
                        // Make move request
                        // const moveResult = await axios.post(`/game/${getGameId()}/move`, {cardData.collection_index}); //or however the heck it's named
                        console.log("Playing a card!");

                        console.log(
                            `collection_index: ${cardData.collection_index}`
                        );

                        // console.log(cardData.color);

                        const result = await axios.post(
                            `/game/${getGameId()}/playCard`,
                            {
                                collection_index: cardData.collection_index,
                            }
                        );
                        // debugger;
                        console.log(result);
                    }
                } else {
                    for (const [idx, reapplyCard] of Object.entries(
                        this.handContainer.children
                    )) {
                        //removeBounceAnimation(reapplyCard);
                        applyBounceAnimation(
                            reapplyCard,
                            playCollection,
                            cardCollection[idx]
                        );
                    }
                }
            });

            this.draggables.push(draggable);
            applyBounceAnimation(card, playCollection, cardData);
        });

        const drawCard = document.getElementById("drawCard");
        const drawParent = drawCard.parentElement;
        const draggable = new Draggable(
            drawCard,
            [this.handContainer],
            this.gameWindow
        );
        draggable.setDragEndCallback(async (newParent) => {
            if (newParent == this.handContainer) {
                drawParent.appendChild(drawCard);

                const result = await axios.get(`/game/${getGameId()}/drawCard`);

                console.log(result);

                this.endTurn();
            }
        });
        this.draggables.push(draggable);
    }

    // clean up
    endTurn() {
        this.handContainer.childNodes.forEach((e) =>
            e.classList.remove("animate-bounce")
        );
        this.draggables.forEach((draggable) => {
            draggable.destroy();
        });
        this.draggables = [];
    }

    handleBlackCardAction(cardData) {
        const wildFourUserEvent = document.getElementById("wildFourUserEvent");
        wildFourUserEvent.classList.toggle("hidden", false);
        const colorSelectionChildren = document.querySelectorAll(
            "#wildFourUserEvent div"
        );
        for (const colorSelectedByID of colorSelectionChildren) {
            colorSelectedByID.addEventListener("click", async (e) => {
                const selectedColor = e.target.getAttribute("id");
                console.log(selectedColor);
                await axios.post(`/game/${getGameId()}/playCard`, {
                    collection_index: cardData.collection_index,
                    color: selectedColor, // selected color
                });
                applyCurrentColorToGameScreen(selectedColor);
                wildFourUserEvent.classList.toggle("hidden", true);
            });
        }
    }
}

let gameRenderer;
let turnController;

const gameStateQueue = [];
let queueActive = false;
const playerMapping = new Map();
playerMapping.set(2, [0, 2]);
playerMapping.set(3, [0, 1, 3]);
playerMapping.set(4, [0, 1, 2, 3]);

// I'll clean this up, ik it's bad
async function renderGameState(game_state) {
    const localPlayer = (await axios.get(`/game/${getGameId()}/getPlayer`)).data
        .player;

    console.log(
        "%cserver-game-game-id-game-state",
        "color: black;background-color:lawngreen;font-size: 20px;"
    );
    console.log(game_state);

    // Ohhh this is gonna cause problems potentially. Maybe.
    const playersHand = await axios.get(`/game/${getGameId()}/getHand`);

    gameStateQueue.push([game_state, playersHand]);

    // this check is to allow for the rendering of the host. since we're rendering
    // TODO: legal_color will be used instead to render the current color being played
    if (
        game_state.collection_play.length !== 0 ||
        !game_state.collection_play
    ) {
        applyCurrentColorToGameScreen(
            game_state.collection_play[game_state.collection_play.length - 1]
                .color
        );
    }

    if (!queueActive) {
        queueActive = true;

        while (gameStateQueue.length > 0) {
            const [game_state, playersHand] = gameStateQueue.shift();

            const gameWindow = document.getElementById("game_window");
            const playerList = document.getElementById("list_of_players");

            // Display the proper panel depending on game state
            gameWindow.classList.toggle(
                "invisible",
                !game_state.game.is_active
            );
            gameWindow.classList.toggle("hidden", !game_state.game.is_active);
            playerList.classList.toggle("invisible", game_state.game.is_active);
            playerList.classList.toggle("hidden", game_state.game.is_active);

            if (game_state.game.is_active) {
                if (gameRenderer == null) {
                    const drawContainer = document.getElementById("drawCard");
                    const playContainer = document.getElementById("discard");

                    gameRenderer = new UnoGameRenderer(
                        drawContainer,
                        playContainer
                    );

                    turnController = new TurnController(
                        drawContainer,
                        playContainer,
                        document.getElementById("player0"),
                        gameWindow
                    );

                    const { players } = game_state;

                    let offset = 0;

                    players.forEach((player, index) => {
                        if (player.player_id === localPlayer.player_id) {
                            offset = index;
                        }
                    });

                    // placement of players based on how many
                    const newPos = playerMapping.get(players.length);
                    for (let i = 0; i < newPos.length; i++) {
                        const handContainer = document.getElementById(
                            `player${newPos[i]}`
                        );
                        const player = players[(i + offset) % players.length];
                        gameRenderer.addPlayer(player.player_id, handContainer);
                    }
                }

                game_state.players.forEach((player) => {
                    if (player.player_id == localPlayer.player_id) {
                        gameRenderer.updateHand(
                            player.player_id,
                            playersHand.data.collection // eric added this for all cards
                        );
                    } else {
                        gameRenderer.updateHand(
                            player.player_id,
                            player.collection // eric added this for all cards
                        );
                    }
                });

                if (game_state.collection_play.length > 0) {
                    gameRenderer.updateTopCard(
                        game_state.collection_play[
                            game_state.collection_play.length - 1
                        ]
                    );
                }

                // If its my turn
                // make my cards draggable loop
                // draggable for this card, disconnect all others upon callback
                // callback is if card is black, modal, then request
                // else request
                // if (game_state.player_id_turn === localPlayer.player_id) {

                // }
                // pass also the current player at the start of turn so we can display that current player
                // console.log(game_state.game.player_id_turn);

                // search game state for current player id, match and return name
                display_current_player(
                    game_state.players.find(
                        (player) =>
                            player.player_id === game_state.game.player_id_turn
                    ).display_name
                );
                // console.log(game_state.game.player_id_turn);
                // console.log(localPlayer.player_id);
                if (game_state.game.player_id_turn == localPlayer.player_id) {
                    turnController.startTurn(
                        playersHand.data.collection,
                        game_state.collection_play // discard pile
                    );
                }
            }
        }
        forceScrollDown();
        queueActive = false;
    }
}

const forceScrollDown = () => {
    document.querySelector("#sandbox_message_box").scrollTop =
        document.querySelector("#sandbox_message_box").scrollHeight;
};

const display_current_player = (display_name) => {
    const currentPlayerTarget = document.getElementById("currentPlayer");
    currentPlayerTarget.textContent = `Current Player: ${display_name}`;
};

const applyCurrentColorToGameScreen = (color) => {
    const currentColor = document.getElementById("currentColor");
    currentColor.classList.add(`bg-${color}-500`);
};

const applyBounceAnimation = (card, playCollection, cardData) => {
    if (!playCollection[playCollection.length - 1]) return;
    if (cardData.color === playCollection[playCollection.length - 1].color) {
        card.classList.add("animate-bounce");
    } else if (
        cardData.content === playCollection[playCollection.length - 1].content
    ) {
        card.classList.add("animate-bounce");
    } else if (cardData.color === "black") {
        card.classList.add("animate-bounce");
    } else {
        card.classList.add("brightness-75");
        card.toggleAttribute("disabled", true); // ERIC, added disabled as well.
    }
};

const removeBounceAnimation = (card) => {
    card.classList.remove("animate-bounce");
};

async function setup() {
    // Set up a listener for future incoming game states (the next incoming state could be several seconds/minutes away)
    socket.on("server-game-game-id-game-state", renderGameState);
    socket.on("server-game-game-id-object", (object) => {
        window.location.pathname = object.url;
    });
    // Request the game state right now because we need one now
    const gameState = (await axios.get(`/game/${getGameId()}/getGameState`))
        .data;

    // Manually force a rerender
    renderGameState(gameState);
}

// Wait for the window to load so we have the DOM and access to socket from a script that loads later than this one
window.addEventListener("load", setup);

// This is not as widely supported as window.onload
// document.addEventListener("DOMContentLoaded", setup);
