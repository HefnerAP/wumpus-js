// Dimensiones del mundo
const size = 8;

// Crear la cuadrícula
let world = Array.from({ length: size }, () => Array.from({ length: size }, () => ({
    wumpus: false,
    pozo: false,
    oro: false,
    breeze: false,
    stench: false,
    glitter: false
})));

// Configurar elementos en el mundo
world[2][4].pozo = true;
world[4][5].wumpus = true;
world[5][1].oro = true;

function addPerceptions(world) {
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (world[x][y].pozo) addAdjacentPerception(world, x, y, 'breeze');
            if (world[x][y].wumpus) addAdjacentPerception(world, x, y, 'stench');
            //if (world[x][y].wumpus) addAdjacentPerception(world, x, y, 'glitter');
            if (world[x][y].oro) world[x][y].glitter = true;
        }
    }
}

function addAdjacentPerception(world, x, y, perception) {
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    directions.forEach(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            world[nx][ny][perception] = true;
        }
    });
}

addPerceptions(world);

// Renderizar el mundo en la interfaz
const worldDiv = document.getElementById('world');
const logList = document.getElementById('logList');

function renderWorld(world, agent) {
    worldDiv.innerHTML = '';
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            if (agent.x === x && agent.y === y) cellDiv.classList.add('agent');
            if (world[x][y].oro) cellDiv.classList.add('gold');
            if (world[x][y].wumpus) cellDiv.classList.add('wumpus');
            if (world[x][y].pozo) cellDiv.classList.add('pit');
            worldDiv.appendChild(cellDiv);
        }
    }
}

function logEvent(message) {
    const logItem = document.createElement('li');
    logItem.textContent = message;
    logList.appendChild(logItem);
}

// Agente
let agent = { x: 0, y: 0, hasGold: false, alive: true };

function perceive(world, agent) {
    const cell = world[agent.x][agent.y];
    return { breeze: cell.breeze, stench: cell.stench, glitter: cell.glitter };
}

function decide(perceptions) {
    if (perceptions.glitter) return "pickGold";
    if (perceptions.breeze || perceptions.stench) return "back";
    return "move";
}

function moveAgent(agent) {
    const directions = ["up", "down", "left", "right"];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    const movement = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [dx, dy] = movement[randomDirection];
    const newX = agent.x + dx;
    const newY = agent.y + dy;

    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
        agent.x = newX;
        agent.y = newY;
    }
}

// Simulación
function simulate(world, agent) {
    let steps = 0;
    const interval = setInterval(() => {
        if (steps >= 40 || agent.hasGold || !agent.alive) {
            clearInterval(interval);
            if (agent.hasGold) logEvent("El agente encontró el oro y ganó!");
            else if (!agent.alive) logEvent("El agente murió!");
            else logEvent("Fin de la energía!");
            return;
        }

        const perceptions = perceive(world, agent);
        logEvent(`Percepciones: Brisa: ${perceptions.breeze}, Hedor: ${perceptions.stench}, Brillo: ${perceptions.glitter}`);
        const action = decide(perceptions);

        if (action === "pickGold") {
            agent.hasGold = true;
            logEvent("El agente recogió el oro.");
        } else if (action === "move") {
            moveAgent(agent);
            logEvent(`El agente se movió a (${agent.x}, ${agent.y}).`);
        }
        renderWorld(world, agent);
        steps++;
    }, 1000);
}

// Botón de Play
document.getElementById('playButton').addEventListener('click', () => {
    agent = { x: 0, y: 0, hasGold: false, alive: true }; // Reiniciar agente
    renderWorld(world, agent);
    logList.innerHTML = ''; // Limpiar log
    simulate(world, agent);
});

// Render inicial
renderWorld(world, agent);
