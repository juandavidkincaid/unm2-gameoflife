type GamePattern = {
    id: string,
    name: string,
    pattern: number[][]
}
const GamePatterns = new Set<GamePattern>([
    {
        id: 's_dot',
        name: 'Small Dot',
        pattern: [
            [1]
        ]
    },
    {
        id: 'm_dot',
        name: 'Medium Dot',
        pattern: [
            [1,1,1],
            [1,1,1],
            [1,1,1],
        ]
    },
    {
        id: 'l_dot',
        name: 'Large Dot',
        pattern: [
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1],
        ]
    },
    {
        id: 'b_dot',
        name: 'Big Dot',
        pattern: [
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
        ]
    },
    {
        id: 'block',
        name: 'Block',
        pattern: [
            [1, 1],
            [1, 1],
        ]
    },
    {
        id: 'beehive',
        name: 'Bee Hive',
        pattern: [
            [0,1,1,0],
            [1,0,0,1],
            [0,1,1,0],
        ]
    },
    {
        id: 'loaf',
        name: 'Loaf',
        pattern: [
            [0,1,1,0],
            [1,0,0,1],
            [0,1,0,1],
            [0,0,1,0],
        ]
    },
    {
        id: 'boat',
        name: 'Boat',
        pattern: [
            [1,1,0],
            [1,0,1],
            [0,1,0],
        ]
    },
    {
        id: 'blinker',
        name: 'Blinker',
        pattern: [
            [0,1,0],
            [0,1,0],
            [0,1,0],
        ]
    },
    {
        id: 'toad',
        name: 'Toad',
        pattern: [
            [0,0,1,0],
            [1,0,0,1],
            [1,0,0,1],
            [0,1,0,0],
        ]
    },
    {
        id: 'beacon',
        name: 'Beacon',
        pattern: [
            [1,1,0,0],
            [1,0,0,0],
            [0,0,0,1],
            [0,0,1,1]            
        ]
    },
    {
        id: 'pulsar',
        name: 'Pulsar',
        pattern: [
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
        ]
    },
    {
        id: 'penta',
        name: 'Penta',
        pattern: [
            [0,1,0],
            [0,1,0],
            [1,0,1],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [1,0,1],
            [0,1,0],
            [0,1,0],
        ]
    },
    {
        id: 'glider',
        name: 'Glider',
        pattern: [
            [0,1,0],
            [0,0,1],
            [1,1,1]
        ]
    },
    {
        id: 's_spaceship',
        name: 'Small Spaceship',
        pattern: [
            [1,0,0,1,0],
            [0,0,0,0,1],
            [1,0,0,0,1],
            [0,1,1,1,1],
        ]
    },
    {
        id: 'm_spaceship',
        name: 'Medium Spaceship',
        pattern: [
            [0,1,1,1,1,1],
            [1,0,0,0,0,1],
            [0,0,0,0,0,1],
            [1,0,0,0,1,0],
            [0,0,1,0,0,0],
        ]
    },
    {
        id: 'l_spaceship',
        name: 'Large Spaceship',
        pattern: [
            [0,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0],
            [0,0,1,1,0,0,0],
        ]
    },
    {
        id: 'pentonimo',
        name: 'Pentonimo',
        pattern: [
            [0,1,1],
            [1,1,0],
            [0,1,0],
        ]
    },
    {
        id: 'diehard',
        name: 'Die Hard',
        pattern: [
            [0,0,0,0,0,0,1,0],
            [1,1,0,0,0,0,0,0],
            [0,1,0,0,0,1,1,1],
        ]
    },
    {
        id: 'acorn',
        name: 'Acorn',
        pattern: [
            [0,1,0,0,0,0,0],
            [0,0,0,1,0,0,0],
            [1,1,0,0,1,1,1],
        ]
    }
]);

export {
    GamePattern,
    GamePatterns
}