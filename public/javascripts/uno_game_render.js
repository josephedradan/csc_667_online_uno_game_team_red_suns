//var socket = io();

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
        if (!this.hands[playerId]) { return; }
        // If is local player, get card info (cuz we have to see what kind of card)
            // POST getHand
            // handle logic separately

        //ELSE (it should be flipped and generic) 

        // Create additional cards if additional exist (animate later from draw)
        console.log("card collection");
        console.log(cardCollection.length);
        console.log("this hands playerId");
        console.log(this.hands[playerId].length);

        for (
            let i = this.hands[playerId].length;
            i < cardCollection.length;
            i++
        ) {
            console.log("Building a new card!!!");
            // Add new flipped card to hand (animate later)
            let card = generate_flipped_card();
            console.log(card + " cardd");
            this.hands[playerId].push(card);
            console.log(this.hands + " this.hands");
            this.handContainers[playerId].appendChild(card);
            console.log(this.handContainers[playerId] + " this.handContainers[playerId]");
        }

        // If missing card, move to play pile (animate later to play)
        for (
            let i = cardCollection.length;
            i < this.hands[playerId].length;
            i++
        ) {
            console.log("Destroying it!!!");
            // Reparent card to discard pile (animate later)
            //this.playContainer.appendChild(this.hands[playerId][i]);
            //this.playPile.push(this.hands[playerId].pop());
            this.hands[playerId][i].remove();
            this.hands[playerId].splice(i, 1);
        }
    }

    updateTopCard(cardInfo) {
        // Destroy all but the top card
        this.playContainer.innerHTML = "";
        let newCard = null; //Generate card with card info
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


    //*************************** Card Templates */

    generate_flipped_card = () => {
        const cardWrapper = document
            .createElement('div')
            .classList.add('cardWrapper');
        const unoCard = document
            .createElement('div')
            .classList.add('unoCard', 'flipped');
        const inner = document.createElement('span').classList.add('inner');
        const mark = document.createElement('span').classList.add('mark');
        inner.append(mark);
        unoCard.append(inner);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };
    
    generate_user_card = (number, color) => {
        const cardWrapper = document
            .createElement('div')
            .classList.add('cardWrapper');
        const unoCard = document
            .createElement('div')
            .classList.add('unoCard', `number-${number}`, color);
        const inner = document.createElement('span').classList.add('inner');
        const mark = document.createElement('span').classList.add('mark');
        inner.append(mark);
        unoCard.append(inner);
        cardWrapper.append(unoCard);
        return cardWrapper;
    };
    
    generate_wild_black = (is_wild /* or is_wild4 */) => {
        const cardWrapper = document
            .createElement('div')
            .classList.add('cardWrapper');
        const unoCard = document
            .createElement('div')
            .classList.add('unoCard', is_wild ? 'wild' : 'wild4', 'black');
        const inner = document.createElement('span').classList.add('inner');
        const wildMark = document
            .createElement('span')
            .classList.add(is_wild ? 'wildMark' : 'wild4Mark');
    
        // 4 colors
        const wildRed = document
            .createElement('div')
            .classList.add('wildRed', 'wildCard');
        const wildBlue = document
            .createElement('div')
            .classList.add('wildBlue', 'wildCard');
        const wildYellow = document
            .createElement('div')
            .classList.add('wildYellow', 'wildCard');
        const wildGreen = document
            .createElement('div')
            .classList.add('wildGreen', 'wildCard');
    
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

var gameRenderer;

window.onload = async () => {

    socket.on('server-game-game-id-game-state', (game_state) => {
        console.log(
            '%cserver-game-game-id-game-state',
            'color: black;background-color:lawngreen;font-size: 20px;',
        );
        console.log(game_state);
    
        let gameWindow = document.getElementById("game_window");
        let playerList = document.getElementById("list_of_players");
    
        console.log(gameWindow);
        console.log(playerList);
    
        if (game_state.game.is_active) {
            gameWindow.classList.remove("invisible");
            gameWindow.classList.remove("hidden");
            //gameWindow.classList.add("grid");
            playerList.classList.add("invisible");
            playerList.classList.add("hidden");
            //playerList.classList.remove("grid");
        } else {
            playerList.classList.remove("invisible");
            playerList.classList.remove("hidden");
            //playerList.classList.add("grid");
            gameWindow.classList.add("invisible");
            gameWindow.classList.add("hidden");
            //gameWindow.classList.remove("grid");
        }
    
        game_state.players.forEach((player) => {
            gameRenderer.updateHand(player.player_id, player.collection);
        });
    
        //let players = axios.get(`/game/${getGameId()}/GETPlayers`)
    
    });

    let drawContainer = document.getElementById("drawCard");
    let playContainer = document.getElementById("discard");

    gameRenderer = new UnoGameRenderer(drawContainer, playContainer);

    console.log(gameRenderer);
    console.log("That was the renderer");
    

    const playersResults = await axios.get(`/game/${getGameId()}/GETPlayers`);
    const localPlayerResults = await axios.get(`/game/${getGameId()}/GETPlayer`);

    const players = playersResults.data;
    const localPlayer = localPlayerResults.data;

    console.log(players);

    let offset = 0;

    players.forEach((player, index) => {
        if (player.player_id === localPlayer.player_id) {
            offset = index;
        }
    });

    for (let i = 0; i < players.length; i++) {
        let handContainer = document.getElementById("player" + i);
        let player = players[(i + offset) % players.length];
        gameRenderer.addPlayer(player.player_id, handContainer);
    }

    gameRenderer.addPlayer();
}