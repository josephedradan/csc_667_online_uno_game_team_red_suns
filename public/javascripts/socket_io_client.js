// eslint-disable-next-line no-var,no-undef
var socket = io();
const LOCALHOST_SIZE = 'http://localhost:3000/'.length;

socket.on('connect', () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // THIS MUST BE CALLED ONCE AND BEFORE ANY OTHER EVENTS

    // grab the current path, only care for the route.
    const currPath = window.location.href.slice(LOCALHOST_SIZE); // FIXME: DONT DO THSI
    console.log(currPath);

    // check to see if the word 'game' exists anywhere on this path.
    const gameRE = '(?:game)';
    const containsGame = currPath.search(gameRE);
    console.log(`contains game: ${containsGame > -1}`);
    // emit the game_id if it does.
    if (containsGame > -1) {
        // game_id will I assume be always the second element when the path is tokenized.
        const game_id = currPath.split('/')[1];
        console.log(`game_id: ${game_id}`);
        socket.emit('client-game-game-id-join-room', parseInt(game_id)); // parsed game_id from URL.
    } else {
        console.log('ELSE');
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
socket.on('server-game-game-id-message-client', (msg) => {
    console.log(
        '%cserver-game-game-id-message-client',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    console.log(msg);
    outputMessage(msg);
    document.querySelector('#sandbox_message_box').scrollTop = document.querySelector('#sandbox_message_box').scrollHeight;
});

const outputMessage = (msg) => {
    console.log(msg);
    const div = document.createElement('div');
    const pSpanName = document.createElement('span');
    const messageContent = document.createElement('p');
    div.classList.add('p-2');
    pSpanName.classList.add('inline');
    messageContent.classList.add('inline');
    pSpanName.classList.add('font-bold', 'inline', `text-${randomColor()}-700`);
    pSpanName.textContent = `${msg.display_name} `;
    messageContent.textContent = msg.message;
    div.append(pSpanName);
    div.append(messageContent);
    document.querySelector('#sandbox_message_box')
        .appendChild(div);
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
    document.querySelector('#sandbox_message_box')
        .appendChild(div);
};

const randomColor = () => {
    const colors = ['sky', 'green', 'red', 'yellow'];
    return colors[Math.floor(Math.random() * 3)];
};

/*
On Server message
 */
socket.on('server-game-game-id-message-server', (msg) => {
    console.log(
        '%cserver-game-game-id-message-server',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    outputMessageServer(msg);
});

/*
On Server game players
Notes:
    To show players in lobby
*/
socket.on('server-game-game-id-players', (gameWithPlayersRows) => {
    console.log(
        '%cserver-game-game-id-players',
        'color: black;background-color:lawngreen;font-size: 20px;',
    );
    console.log(gameWithPlayersRows);
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
            const div = document.createElement('div');
            parent_div_list_of_players.append(div);
            continue;
        }
        parent_div_list_of_players.append(
            create_game_url(gameWithPlayersRows.game.game_id),
        );
    }
});

const removeAllChildren = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};

const create_game_url = (gameId) => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    div.classList.add('flex', 'items-center', 'justify-center');
    a.classList.add(
        'w-1/2',
        'px-4',
        'py-2',
        'font-bold',
        'text-center',
        'text-white',
        'bg-sky-500',
        'hover:bg-sky-700',
    );
    a.textContent = 'Start Game';
    a.href = `/game/${gameId}/startGame`;
    div.append(a);
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
});
