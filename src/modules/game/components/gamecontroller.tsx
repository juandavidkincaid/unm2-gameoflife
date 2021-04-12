import React, { useState, useReducer, useContext, useMemo } from 'react';
import { BoundObject } from 'lecasv';

import {
    NC  
} from '@gof-util';

import {EventEmitter} from 'events';

import {Game, Cell} from '.';

const GameControllerContext = React.createContext<Game | null>(null);

const useGame = () => {
    const ctx = useContext(GameControllerContext);

    if (ctx === null) {
        throw new Error('calling useGameController() is only possible under a <GameProvider/> component');
    }

    return ctx;
}

type GameProvider = {
    cellsize: number,
    blocksize: number,
    initialVelocity: number
}

const GameProvider = NC<GameProvider>('GameProvider', ({ children, cellsize, blocksize, initialVelocity }) => {
    const game = useMemo(() => new Game(cellsize, blocksize, initialVelocity), []);

    return <GameControllerContext.Provider value={game}>
        {children}
    </GameControllerContext.Provider>
})


export {
    useGame,
    GameProvider
}