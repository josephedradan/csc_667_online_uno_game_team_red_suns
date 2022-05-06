class UnoGameRenderer {
    constructor(drawContainer, playContainer) {
        this.drawContainer = drawContainer;
        this.playContainer = playContainer;
        this.handContainers = {};
        this.hands = {}; // [player_id] = [element, element, element]
        this.drawPile = []; // [element, element, element]
        this.playPile = []; // [element, element, element]
    }

    addPlayer(userId, container) {
        this.handContainers[userId] = container;
        this.hands[userId] = [];
    }

    updateHand(playerId, cardCollection) {
 
        // If player not in game, don't render
        if (!this.hands[playerId]) {
            return;
        }

        // Empty the container
        this.handContainers[playerId].innerHTML = "";
        this.hands[playerId] = [];

        // Loop through cards and render
        cardCollection.forEach((cardData, index) => {
            let card = this.generate_card(cardData);

            // Add the card to the hand and the handContainer
            this.handContainers[playerId].appendChild(card);
            this.hands[playerId].push(card);
        });
    }

    updateTopCard(cardData) {
        // Destroy all but the top card
        this.playContainer.innerHTML = "";
        const newCard = this.generate_card(cardData); // Generate card with card info
        this.playContainer.appendChild(newCard);
    }

    generate_card(cardData) {
        let card;
        // Figure out what kind of card and render
        if (cardData.card_info_type === undefined) {
            card = this.generate_flipped_card();
        } else if(cardData.card_color === "black") {
            card = this.generate_wild_black((cardData.card_content === "wild"));
        } else if (cardData.card_info_type == "NUMBER") {
            card = this.generate_color_card("num-" + cardData.card_content, cardData.card_color);
        } else {
            card = this.generate_color_card(cardData.card_content, cardData.card_color);
        }
        return card;
    }

    /*
    updateGameState(gameState) {
        // Get play pile cards, update on callback?
        // Get my hand cards, update on callback?

        // Do we need to do anything with the draw pile?

        // Iterate through player hands
        gameState.players.forEach((player) => {
            // If new card, add (animate from draw pile later)
            for (
                let i = player.collection.length;
                i < this.hands[player.player_id].length;
                i++
            ) {
                // Add card to hand
            }
            // If missing card, move to play pile (animate later)
            for (
                let i = this.hands[player.player_id].length;
                i < player.collection.length;
                i++
            ) {
                // Reparent card to play pile
            }
        });
    }
    */

    /*

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

    */

    //* ************************** Card Templates */

    generate_flipped_card = () => {
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

    generate_color_card = (value, color) => {
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

    generate_wild_black = (is_wild /* or is_wildFour */) => {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");
        const unoCard = document.createElement("div");
        unoCard.classList.add("unoCard", is_wild ? "wild" : "wildFour", "black");
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

let gameRenderer;

const gameStateQueue = [];
let queueActive = false;
const playerMapping = new Map();
playerMapping.set(2, [0, 2]);
playerMapping.set(3, [0, 1, 3]);
playerMapping.set(4, [0, 1, 2, 3]);

async function renderGameState(game_state) {

    const localPlayer = (await axios.get(
        `/game/${getGameId()}/getPlayer`
    )).data.player;

    console.log(
        "%cserver-game-game-id-game-state",
        "color: black;background-color:lawngreen;font-size: 20px;"
    );
    console.log(game_state);

    // Ohhh this is gonna cause problems potentially. Maybe.
    const playersHand = await axios.get(`/game/${getGameId()}/getHand`);

    gameStateQueue.push([
        game_state,
        playersHand,
    ]);

    if (!queueActive) {
        queueActive = true;

        while (gameStateQueue.length > 0) {
            let [game_state, playersHand] = gameStateQueue.shift();

            let gameWindow = document.getElementById("game_window");
            let playerList = document.getElementById("list_of_players");

            if (game_state.game.is_active) {
                gameWindow.classList.remove("invisible");
                gameWindow.classList.remove("hidden");
                playerList.classList.add("invisible");
                playerList.classList.add("hidden");
            } else {
                playerList.classList.remove("invisible");
                playerList.classList.remove("hidden");
                gameWindow.classList.add("invisible");
                gameWindow.classList.add("hidden");
            }

            if (game_state.game.is_active) {
                if (gameRenderer == null) {
                    let drawContainer = document.getElementById("drawCard");
                    let playContainer = document.getElementById("discard");

                    gameRenderer = new UnoGameRenderer(
                        drawContainer,
                        playContainer
                    );

                    const players = game_state.players;

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
                            "player" + newPos[i]
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

                gameRenderer.updateTopCard(game_state.collection_play[game_state.collection_play.length - 1]);

                // If its my turn
                    // make my cards draggable loop
                        // draggable for this card, disconnect all others upon callback
                        // callback is if card is black, modal, then request
                        // else request
                //if (game_state.player_id_current_turn === localPlayer.player_id) {

                //}
            }
        }

        queueActive = false;
    }
}

// Wait for the window to load so we have the DOM and access to socket from a script that loads later than this one
window.onload = async () => {

    // Set up a listener for future incoming game states (the next incoming state could be several seconds/minutes away)
    socket.on("server-game-game-id-game-state", renderGameState);

    // Request the game state right now because we need one now
    const gameState = (await axios.get(
        `/game/${getGameId()}/getGameState`
    )).data;

    // Manually force a rerender
    renderGameState(gameState);
};
