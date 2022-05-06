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
        if (this.element.getAttribute("disabled") !== null) {
            console.log("It was disabled!");
            return;
        }
        console.log("It was not disabled");

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

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let parented = false;

        for (const container of this.containers) {
            const rect = container.getBoundingClientRect();
            console.log(
                `${parseInt(rect.left, 10)} ${parseInt(
                    rect.right,
                    10
                )} ${parseInt(rect.top, 10)} ${parseInt(rect.bottom, 10)}`
            );
            if (
                mouseX > parseInt(rect.left, 10) &&
                mouseX < parseInt(rect.right, 10) &&
                mouseY > parseInt(rect.top, 10) &&
                mouseY < parseInt(rect.bottom, 10)
            ) {
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
        if (cardData.card_info_type === undefined) {
            card = this.#generate_flipped_card();
        } else if (cardData.card_color === "black") {
            card = this.#generate_wild_black(cardData.card_content === "wild");
        } else if (cardData.card_info_type == "NUMBER") {
            card = this.#generate_color_card(
                `num-${cardData.card_content}`,
                cardData.card_color
            );
        } else {
            card = this.#generate_color_card(
                cardData.card_content,
                cardData.card_color
            );
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
    constructor(drawContainer, playContainer, handContainer) {
        this.drawContainer = drawContainer;
        this.playContainer = playContainer;
        this.handContainer = handContainer;
        this.draggables = [];
    }

    startTurn(cardCollection) {
        cardCollection.forEach((cardData, index) => {
            const card = this.handContainer.children.item(index);
            const draggable = new Draggable(card, [this.playContainer]);
            draggable.setCallback((newParent) => {
                if (newParent == this.playContainer) {
                    // if card is a wild card, prompt with modal and request the move
                    if (cardData.card_color == "black") {
                        // Modal!
                        // On modal callback, make move request and end turn
                        // /game/id/playCard pass in index
                        // TODO: add api call to the backend calling /game/id/
                        const wildFourUserEvent =
                            document.getElementById("wildFourUserEvent");
                        wildFourUserEvent.classList.toggle("hidden");
                        for (const colorSelectedByID of document.querySelectorAll(
                            "#wildFourUserEvent div"
                        )) {
                            colorSelectedByID.addEventListener("click", (e) => {
                                const selectedColor =
                                    e.target.getAttribute("id");
                                // const result = axios.post(`/game/${getGameId()}/someCallWithRoutePassingInIndex`)
                            });
                        }
                        wildFourUserEvent.children.addEventListener();
                    } else {
                        // Make move request
                        // const moveResult = await axios.post(`/game/${getGameId()}/move`, {index}); //or however the heck it's named
                        this.endTurn();
                    }
                }
            });
            this.draggables.push(draggable);
        });
    }

    endTurn() {
        this.draggables.forEach((draggable) => {
            draggable.destroy();
        });
        this.draggables = [];
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
                        document.getElementById("player0")
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

                turnController.startTurn(playersHand.data.collection);
            }
        }

        queueActive = false;
    }
}

async function setup() {
    // Set up a listener for future incoming game states (the next incoming state could be several seconds/minutes away)
    socket.on("server-game-game-id-game-state", renderGameState);

    // Request the game state right now because we need one now
    const gameState = (await axios.get(`/game/${getGameId()}/getGameState`))
        .data;

    // Manually force a rerender
    renderGameState(gameState);
}

// Wait for the window to load so we have the DOM and access to socket from a script that loads later than this one
window.addEventListener("load", setup);

// This is not as widely supported as window.onload
//document.addEventListener("DOMContentLoaded", setup);
