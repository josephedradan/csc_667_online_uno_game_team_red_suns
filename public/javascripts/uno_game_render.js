// var socket = io();

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
    /*
    playCard(cardId) {
        // Post request with card id
    }
    */

    /*
        collection:
        [
            {collection_index: 0},
            ...
        ]
    */

    updateHand(playerId, cardCollection) {
        console.log("Updating hand!!");
        if (!this.hands[playerId]) {
            return;
        }
        // If is local player, get card info (cuz we have to see what kind of card)
        // POST getHand
        // handle logic separately

        // ELSE (it should be flipped and generic)

        // Create additional cards if additional exist (animate later from draw)
        console.log("card collection");
        console.log(cardCollection.length);
        console.log("this hands playerId");
        console.log(this.hands[playerId].length);
        console.log(cardCollection);
        for (
            let i = this.hands[playerId].length;
            i < cardCollection.length;
            i++
        ) {
            // console.log("Building a new card!!!");
            // Add new flipped card to hand (animate later)
            // let card;
            // if (cardCollection[i].card_info_type === "NUMBER") {
            // }
            let card = this.generate_flipped_card();

            // console.log(card + " cardd");
            this.hands[playerId].push(card);
            // console.log(this.hands + " this.hands");
            this.handContainers[playerId].appendChild(card);
            // console.log(this.handContainers[playerId] + " this.handContainers[playerId]");
        }

        // If missing card, move to play pile (animate later to play)
        for (
            let i = cardCollection.length;
            i < this.hands[playerId].length;
            i++
        ) {
            console.log("Destroying it!!!");
            // Reparent card to discard pile (animate later)
            // this.playContainer.appendChild(this.hands[playerId][i]);
            // this.playPile.push(this.hands[playerId].pop());
            this.hands[playerId][i].remove();
            this.hands[playerId].splice(i, 1);
        }
    }

    updateTopCard(cardInfo) {
        // Destroy all but the top card
        this.playContainer.innerHTML = "";
        const newCard = null; // Generate card with card info
        this.playContainer.appendChild(newCard);

        // Post request
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
        const inner = document.createElement("span");
        inner.classList.add("inner");
        const mark = document.createElement("span");
        mark.classList.add("mark");
        inner.append(mark);
        unoCard.append(inner);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };

    generate_user_card = (number, color) => {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");
        const unoCard = document.createElement("div");
        unoCard.classList.add("unoCard", `number-${number}`, color);
        const inner = document.createElement("span");
        inner.classList.add("inner");
        const mark = document.createElement("span");
        mark.classList.add("mark");
        inner.append(mark);
        unoCard.append(inner);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };

    generate_wild_black = (is_wild /* or is_wild4 */) => {
        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");
        const unoCard = document.createElement("div");
        unoCard.classList.add("unoCard", is_wild ? "wild" : "wild4", "black");
        const inner = document.createElement("span");
        inner.classList.add("inner");
        const wildMark = document.createElement("span");
        wildMark.classList.add(is_wild ? "wildMark" : "wild4Mark");

        // 4 colors
        const wildRed = document.createElement("div");
        wildRed.classList.add("wildRed", "wildCard");
        const wildBlue = document.createElement("div");
        wildBlue.classList.add("wildBlue", "wildCard");
        const wildYellow = document.createElement("div");
        wildYellow.classList.add("wildYellow", "wildCard");
        const wildGreen = document.createElement("div");
        wildGreen.classList.add("wildGreen", "wildCard");

        wildMark
            .append(wildRed)
            .append(wildBlue)
            .append(wildYellow)
            .append(wildGreen);
        inner.append(wildMark);
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
playerMapping.set(3, [0, 1, 2]);
playerMapping.set(3, [0, 1, 2, 3]);

window.onload = async () => {
    socket.on("server-game-game-id-game-state", async (game_state) => {
        console.log(
            "%cserver-game-game-id-game-state",
            "color: black;background-color:lawngreen;font-size: 20px;"
        );
        console.log(game_state);

        gameStateQueue.push(game_state);

        const playersHand = await axios.get(`/game/${getGameId()}/getHand`);

        if (!queueActive) {
            queueActive = true;

            while (gameStateQueue.length > 0) {
                const game_state = gameStateQueue.shift();

                const gameWindow = document.getElementById("game_window");
                const playerList = document.getElementById("list_of_players");

                console.log(gameWindow);
                console.log(playerList);

                if (game_state.game.is_active) {
                    gameWindow.classList.remove("invisible");
                    gameWindow.classList.remove("hidden");
                    // gameWindow.classList.add("grid");
                    playerList.classList.add("invisible");
                    playerList.classList.add("hidden");
                    // playerList.classList.remove("grid");
                } else {
                    playerList.classList.remove("invisible");
                    playerList.classList.remove("hidden");
                    // playerList.classList.add("grid");
                    gameWindow.classList.add("invisible");
                    gameWindow.classList.add("hidden");
                    // gameWindow.classList.remove("grid");
                }

                if (!game_state.game.is_active) {
                    return;
                }

                // console.log(gameRenderer);

                if (gameRenderer == null) {
                    const drawContainer = document.getElementById("drawCard");
                    const playContainer = document.getElementById("discard");

                    gameRenderer = new UnoGameRenderer(
                        drawContainer,
                        playContainer
                    );

                    // console.log("Created the renderer");

                    // console.log("Getting players");
                    // const playersResults = await axios.get(`/game/${getGameId()}/getPlayers`);
                    // console.log("Getting local player");
                    // const localPlayerResults = await axios.get(
                    //     `/game/${getGameId()}/getPlayer`
                    // );

                    console.log(
                        await axios.get(`/game/${getGameId()}/getHand`)
                    );
                    // console.log(`/game/${getGameId()}/GETPlayers`);

                    // const playersData = playersResults.data;
                    // const players = playersData.players;
                    // console.log(localPlayerResults);

                    const { players } = game_state;
                    // const localPlayer = localPlayerResults.data;
                    const localPlayer = players[0];

                    let offset = 0;

                    // console.log(playersData);

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

                    console.log("Added players");
                }

                console.log("Updating hand");
                game_state.players.forEach((player) => {
                    gameRenderer.updateHand(
                        player.player_id,
                        playersHand.data.collection // eric added this for all cards
                    );
                });

                // let players = axios.get(`/game/${getGameId()}/GETPlayers`)
            }

            queueActive = false;
        }

        console.log("Done");
    });
};
