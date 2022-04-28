// eslint-disable-next-line no-var,no-undef
var socket = io();
const LOCALHOST_SIZE = 'http://localhost:3000/'.length;

socket.on('connect', () => {
    console.log(`Connected, your id is: ${socket.id}`);

    // THIS MUST BE CALLED ONCE AND BEFORE ANY OTHER EVENTS

    // grab the current path, only care for the route.
    const currPath = window.location.href.slice(LOCALHOST_SIZE);
    console.log(currPath);

    // check to see if thwe word 'game' exists anywhere on this path.
    const gameRE = '(?:game)';
    const containsGame = currPath.search(gameRE);
    console.log(`contains game: ${containsGame > -1}`);
    // emit the game_id if it does.
    if (containsGame > -1) {
        // game_id will I assume be always the second element when the path is tokenized.
        const game_id = currPath.split('/')[1];
        console.log(`game_id: ${game_id}`);
        socket.emit('client-join-room', parseInt(game_id)); // parsed game_id from URL.
    }

    // Test messages
    // socket.emit('client-message', 'Hello 1');
    // socket.emit('client-message', 'Hello 2');
    // socket.emit('client-message', 'Hello 3');
});

/*
On Server game message
*/
socket.on('server-game-message', (msg) => {
    console.log('%cserver-game-message', 'color: black;background-color:lawngreen;font-size: 20px;');
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
socket.on('server-message', (msg) => {
    console.log('%cserver-message', 'color: black;background-color:lawngreen;font-size: 20px;');
    outputMessageServer(msg);
});

/*
On Server game players
Notes:
    To show players in lobby
*/
socket.on('server-game-players', (gameWithPlayersRows) => {
    console.log('%cserver-game-players', 'color: black;background-color:lawngreen;font-size: 20px;');
    console.log(gameWithPlayersRows);
});
