// eslint-disable-next-line no-var,no-undef
var socket = io();
// const LOCALHOST_SIZE = "http://localhost:3000/".length;

const getGameId = () => {
    // https://term-project-red-suns.herokuapp.com/games/112451
    const currURL = window.location.href;
    const gameId = currURL.split('/');
    return gameId.at(gameId.length - 1);
};

socket.on('connect', async () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // THIS MUST BE CALLED ONCE AND BEFORE ANY OTHER EVENTS

    // grab the current path, only care for the route.
    const currPath = window.location.href; // FIXME: DONT DO THSI
    console.log(currPath);

    // check to see if the word 'game' exists anywhere on this path.
    const gameRE = '(?:game)';
    const containsGame = currPath.search(gameRE);
    // emit the game_id if it does.
    if (containsGame > -1) {
        // game_id will I assume be always the second element when the path is tokenized.
        const game_id = parseInt(getGameId(), 10);
        socket.emit('client-game-game-id-join-room', game_id); // parsed game_id from URL.
        // load all previous messages in lobby.
        const results = await axios.get(`/game/${game_id}/getMessages`);

        for (const old_msgs of results.data) {
            outputMessage(old_msgs, await getPlayerIdxForColor(old_msgs));
        }
        forceScrollDown();
    } else {
        console.log(`${containsGame}`);
        socket.emit('client-index-join-room');
    }

    // Test messages
    // socket.emit('client-message', 'Hello 1');
    // socket.emit('client-message', 'Hello 2');
    // socket.emit('client-message', 'Hello 3');
});

/*
On Server game message
*/
socket.on('server-game-game-id-message-client', async (msg) => {
    console.log(
        '%cserver-game-game-id-message-client',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    console.log(msg);
    // document.querySelector("#sandbox_message_box").innerHTML = "";
    outputMessage(msg, await getPlayerIdxForColor(msg));
    forceScrollDown();
});

const getPlayerIdxForColor = async (msg) => {
    const players = await axios.get(`/game/${getGameId()}/getPlayers`);
    return players.data.players.findIndex(
        (obj) => obj.player_id === msg.player_id,
    );
};

const colorNameLookUpTable = {
    0: 'sky',
    1: 'green',
    2: 'red',
    3: 'yellow',
};

const outputMessage = async (msg, colorIdx) => {
    // console.log(msg);
    const div = document.createElement('div');
    const pSpanName = document.createElement('span');
    const messageContent = document.createElement('p');
    div.classList.add('p-2', 'rounded', 'w-fit', 'm-2', 'bg-sky-200');
    pSpanName.classList.add('inline');
    if (msg.message !== undefined) {
        if (msg.message.length > 17) {
            messageContent.classList.add('inline', 'break-all');
        } else {
            messageContent.classList.add('inline');
        }
    }
    // pSpanName.classList.add("font-bold", "inline", `text-${randomColor()}-700`);
    pSpanName.classList.add(
        'font-bold',
        'inline',
        `text-${colorNameLookUpTable[colorIdx]}-700`,
    );
    [yyyy, mm, dd, hh, mi] = msg.time_stamp.split(/[/:\-T]/); // no need for
    pSpanName.textContent = `${msg.display_name} ${hh}:${mi} `;
    messageContent.textContent = msg.message;
    div.append(pSpanName);
    div.append(messageContent);
    document.querySelector('#sandbox_message_box').appendChild(div);
};

const outputMessageServer = (msg) => {
    console.log(msg);
    const div = document.createElement('div');
    const pSpanName = document.createElement('span');
    const messageContent = document.createElement('p');
    div.classList.add('p-2');
    pSpanName.classList.add('font-bold', 'inline', 'text-grey-700');
    messageContent.classList.add('inline');
    pSpanName.classList.add('font-bold', 'inline', 'text-grey-700');
    pSpanName.textContent = `${msg.display_name} `;
    messageContent.textContent = msg.message;
    div.append(pSpanName);
    div.append(messageContent);
    document.querySelector('#sandbox_message_box').appendChild(div);
};

// const randomColor = () => {
//     const colors = ["sky", "green", "red", "yellow"];
//     return colors[Math.floor(Math.random() * 3)];
// };

/*
On Server message
 */
socket.on('server-game-game-id-message-server', (msg) => {
    console.log(
        '%cserver-game-game-id-message-server',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    outputMessageServer(msg);
    forceScrollDown();
});

/*
On Server game players
Notes:
    To show players in lobby
*/
socket.on('server-game-game-id-players', async (gameWithPlayersRows) => {
    console.log(
        '%cserver-game-game-id-players',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    console.log(gameWithPlayersRows);

    // add check if game is active
    if (!gameWithPlayersRows.game.is_active) {
        const parent_div_list_of_players = document.getElementById('list_of_players');
        removeAllChildren(parent_div_list_of_players);
        let player_idx = 0;
        for (let i = 0; i < 6; i++) {
            if (i == 0 || i == 2) {
                const div = document.createElement('div');
                parent_div_list_of_players.append(div);
                continue;
            }
            if (i == 1) {
                parent_div_list_of_players.append(
                    create_player_card(gameWithPlayersRows.players, player_idx),
                );
                player_idx++;
                continue;
            }
            if (player_idx >= gameWithPlayersRows.players.length) {
                const div = document.createElement('div');
                parent_div_list_of_players.append(div);
                continue;
            }
            parent_div_list_of_players.append(
                create_player_card(gameWithPlayersRows.players, player_idx),
            );
            player_idx++;
        }
        for (let i = 0; i < 3; i++) {
            if (i == 0 || i == 2) {
                const div = document.createElement("div");
                parent_div_list_of_players.append(div);
                continue;
            }
            // we could just leave this here since it'll run once anyways.
            const currentPlayer = await axios.get(
                `/game/${getGameId()}/getPlayer`,
                {}
            );
            if (currentPlayer !== undefined) {
                if (
                    gameWithPlayersRows.game.player_id_host ===
                    currentPlayer.data.player.player_id
                ) {
                    parent_div_list_of_players.append(
                        create_start_button(gameWithPlayersRows.game.game_id)
                    );
                }
            }
        }
    }
});

const removeAllChildren = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};

const create_start_button = (gameId) => {
    const div = document.createElement('div');
    // const a = document.createElement("a");
    const button = document.createElement('button');
    div.classList.add('flex', 'items-center', 'justify-center');
    button.classList.add(
        'flex',
        'items-center',
        'justify-center',
        'bg-sky-500',
        'hover:bg-sky-700',
        'text-white',
        'font-bold',
        'py-2',
        'px-4',
        'rounded',
    );
    button.textContent = 'Start Game';
    button.id = 'in_game_socket_start_game_button';
    // add the eventlistener here. // Figure out load ordering of the scripts as why it's not running.
    button.addEventListener('click', async () => {
        const gameId = window.location.href.split('/');
        const results = await axios.post(
            `/game/${gameId.at(gameId.length - 1)}/startGame`,
            {},
        );
        // console.log(results);
    });
    div.append(button);
    return div;
};

const create_player_card = (player_info_array, player_idx) => {
    const divWrapper = document.createElement('div');
    const profileImg = document.createElement('img');
    const username = document.createElement('div');
    const num_of_wins_div = document.createElement('div');
    const num_of_losses_div = document.createElement('div');
    divWrapper.classList.add(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'p-4',
        'bg-white',
        'shadow-lg',
        'card',
        'rounded-2xl',
    );
    profileImg.src = '/images/face.webp';
    username.textContent = `Username: ${player_info_array[player_idx].display_name}`;
    num_of_wins_div.textContent = `Number of Wins ${player_info_array[player_idx].num_wins}`;
    num_of_losses_div.textContent = `Number of Losses ${player_info_array[player_idx].num_loss}`;
    divWrapper.append(profileImg);
    divWrapper.append(username);
    divWrapper.append(num_of_wins_div);
    divWrapper.append(num_of_losses_div);
    return divWrapper;
};

/**
 * Server message
 */
socket.on('server-message', (msg) => {
    console.log(
        '%cserver-message',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    console.log(msg);
});

/**
 * Index page game list
 */
socket.on('server-index-games', (msg) => {
    console.log(
        '%cserver-index-games',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    console.log(msg);

    const list_of_games = document.getElementById('game_list');
    removeAllChildren(list_of_games);
    // manually set first
    const title = document.createElement('li');
    title.classList.add('px-3', 'py-3', 'list-none', 'border', 'rounded-sm');
    title.textContent = 'Game List';
    list_of_games.append(title);

    // remove all but first child in the list
    // for (let i = list_of_games.length - 1; i >= 1; i--) {
    //     list_of_games.removeChild(list_of_games.childNodes[i]);
    // }

    for (const game_info of msg) {
        const individual_game = document.createElement('li'); // append to list_of_games
        const clickable_link = document.createElement('a'); // append to individual_game
        const list_of_players = document.createElement('ul'); // inner list of players

        individual_game.classList.add(
            'px-3',
            'py-3',
            'list-none',
            'border',
            'rounded-sm',
            'bg-slate-100',
        );
        list_of_players.classList.add('list-none', 'm-0', 'p-0', 'inline-flex');

        clickable_link.href = `/game/${game_info.game.game_id}`;
        clickable_link.textContent = `Game ${game_info.game.game_id}`;
        individual_game.append(clickable_link);
        // individual_game.append(list_of_players);
        list_of_games.append(individual_game);

        for (const player of game_info.players) {
            const players = document.createElement('li');
            players.classList.add('px-2');
            players.textContent = `${player.display_name}`;
            list_of_players.append(players);
        }
        individual_game.append(list_of_players);
    }
});

/**
 * Start game logic
 */

/*
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
*/

// const generate_flipped_card = () => {
//     const cardWrapper = document
//         .createElement('div')
//         .classList.add('cardWrapper');
//     const unoCard = document
//         .createElement('div')
//         .classList.add('unoCard', 'flipped');
//     const inner = document.createElement('span').classList.add('inner');
//     const mark = document.createElement('span').classList.add('mark');
//     inner.append(mark);
//     unoCard.append(inner);
//     cardWrapper.append(unoCard);
//     return cardWrapper;
// };

// const generate_user_card = (number, color) => {
//     const cardWrapper = document
//         .createElement('div')
//         .classList.add('cardWrapper');
//     const unoCard = document
//         .createElement('div')
//         .classList.add('unoCard', `number-${number}`, color);
//     const inner = document.createElement('span').classList.add('inner');
//     const mark = document.createElement('span').classList.add('mark');
//     inner.append(mark);
//     unoCard.append(inner);
//     cardWrapper.append(unoCard);
//     return cardWrapper;
// };

// const generate_wild_black = (is_wild /* or is_wild4 */) => {
//     const cardWrapper = document
//         .createElement('div')
//         .classList.add('cardWrapper');
//     const unoCard = document
//         .createElement('div')
//         .classList.add('unoCard', is_wild ? 'wild' : 'wild4', 'black');
//     const inner = document.createElement('span').classList.add('inner');
//     const wildMark = document
//         .createElement('span')
//         .classList.add(is_wild ? 'wildMark' : 'wild4Mark');

//     // 4 colors
//     const wildRed = document
//         .createElement('div')
//         .classList.add('wildRed', 'wildCard');
//     const wildBlue = document
//         .createElement('div')
//         .classList.add('wildBlue', 'wildCard');
//     const wildYellow = document
//         .createElement('div')
//         .classList.add('wildYellow', 'wildCard');
//     const wildGreen = document
//         .createElement('div')
//         .classList.add('wildGreen', 'wildCard');

//     wildMark
//         .append(wildRed)
//         .append(wildBlue)
//         .append(wildYellow)
//         .append(wildGreen);
//     inner.append(wildMark);
//     unoCard.append(inner);
//     cardWrapper.append(unoCard);
//     return cardWrapper;
// };
