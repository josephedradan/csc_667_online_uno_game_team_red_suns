class UnoGameRenderer {
    constructor(viewerPlayerId) {
        this.viewerPlayerId = viewerPlayerId;
        this.handContainers = {};
        this.hands = {}; // [player_id] = [element, element, element]
        this.drawPile = []; // [element, element, element]
        this.playPile = []; // [element, element, element]
    }

    addPlayer(userId, container) {
        this.handContainer[userId] = container;
        this.hands[userId] = {};
    }

    playCard(cardId) {
        // Post request with card id
    }

    updateHand(playerId, hand) {}

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
