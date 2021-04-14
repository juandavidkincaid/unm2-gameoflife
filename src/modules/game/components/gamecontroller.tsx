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
    initialCellsize: number,
    initialBlocksize: number,
    initialVelocity: number
}

const GameProvider = NC<GameProvider>('GameProvider', ({ children, initialCellsize, initialBlocksize, initialVelocity }) => {
    const game = useMemo(() => new Game(initialCellsize, initialBlocksize, initialVelocity), []);

    return <GameControllerContext.Provider value={game}>
        {children}
    </GameControllerContext.Provider>
})


export {
    useGame,
    GameProvider
}