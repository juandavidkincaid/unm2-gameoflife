import React, { useState, useEffect, useRef, useReducer } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Color from 'color';

import {
    NC,
    Title
} from '@gof-util';
import {
    Button
} from '@gof-abs';
import {
    GridStyle,
    CardStyle,
    FlexStyle,

    ButtonStyle
} from '@gof-styling';
import {

} from '@gof-components';
import { theme, app } from '@gof-core';

import { Cell, GameProvider, useGame, GamePattern, GamePatterns } from './components';

const useForceUpdate = ()=>useReducer(s=>s+1, 0)[1];

const ControlBarStyled = styled.div`
    ${GridStyle}
    padding: 10px;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 70px 5px 1fr 5px min-content 5px 15px;

    row-gap: 5px;

    place-items: center;
    place-content: center;

    .vb-wrapper{
        width: 100%;
        padding: 10px 0;
    }

    .vb{
        height: 1px;
        width: 100%;
        background-color: ${theme.c.a};
    }

    > .title{
        font-family: ${theme.fTitle};
        text-align: center;
        color: ${theme.c.a};
        font-size: calc(${theme.fSize} * 2);
    }

    .instructions{
        ${GridStyle}
        padding: 10px;
        height: 100%;
        width: 100%;
        grid-template-columns: 1fr;
        grid-template-rows: 15px 1fr;

        row-gap: 5px;

        place-items: start;
        place-content: start;

        .title{
            text-align: center;
            color: ${theme.c.a};
            font-size: calc(${theme.fSize} * 1.5);
        }

        .content{
            
        }
    }
    

    a{
        text-decoration: none;
        color: ${theme.c.a};
    }

    .controls{
        ${GridStyle}
        height: 100%;
        width: 100%;
        
        grid-template-columns: 1fr;
        grid-auto-rows: min-content;

        row-gap: 5px;

        place-items: center;
        place-content: space-around;

        button{
            ${ButtonStyle(theme)}
            width: 100%;
            height: 50px;
            
        }

        .slider{
            ${GridStyle}
            width: 100%;
            height: 100px;

            grid-template-columns: 1fr;
            grid-template-rows: 50px 50px;

            place-items: center;
            place-content: center;
            padding: 5px;
            border: 1px solid ${theme.c.a};

            input{
                appearance: none;
                width: 100%;
                height: 1px;
                background-color: ${theme.c.a};
                outline: none;
                transition: all 500ms;

                &::-webkit-slider-thumb{
                    appearance: none;
                    width: 3px;
                    height: 15px;
                    background-color: ${theme.c.a};
                    cursor: pointer;
                }

                &::-moz-range-thumb{
                    appearance: none;
                    width: 3px;
                    height: 15px;
                    background-color: ${theme.c.a};
                    cursor: pointer;
                }
            }
        }
    }
`;

const ControlBar = NC('ControlBar', () => {
    const game = useGame();
    const forceUpdate = useForceUpdate();
    

    useEffect(()=>{
        game.events.on('stats', forceUpdate);
        return () => {
            game.events.off('stats', forceUpdate);
        }
    }, []);

    return <ControlBarStyled>
        <div className='title'>
            Conway's Game Of Life
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div className='controls'>
            <Button onClick={() => {
                const status = game.status;
                if (status === 'play') {
                    game.status = 'stop';
                }
                if (status === 'stop') {
                    game.status = 'play';
                }
            }}>
                {game.status === 'play' && 'Stop'}
                {game.status === 'stop' && 'Play'}
            </Button>
            <Button onClick={()=>{game.reset(); game.buildCells();}}>
                Reset
            </Button>
            <Button onClick={() => {
                const patterns = [...GamePatterns];
                const index = patterns.findIndex(p => p.id === game.pattern.id);
                if (index > -1) {
                    game.pattern = patterns[(index + 1) % patterns.length];
                }
            }}>
                Pattern: {game.pattern.name}
            </Button>
            <Button onClick={game.buildRandomCells}>
                Randomize
            </Button>
            <div className="slider">
                <label>
                    Velocity
                </label>
                <input type="range" min="-1500" max="-50" value={-game.velocity} onChange={({target})=>game.velocity = -parseInt(target.value)}/>
            </div>
            <div className="slider">
                <label>
                    CellSize
                </label>
                <input type="range" min="10" max="100" value={game.cellsize} onChange={({target})=>game.cellsize = parseInt(target.value)}/>
            </div>
            <div className="slider">
                <label>
                    BlockSize
                </label>
                <input type="range" min="10" max="100" value={game.blocksize} onChange={({target})=>game.blocksize = parseInt(target.value)}/>
            </div>
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div className='instructions'>
            <div className='title'>
                Manual
            </div>
            <div className='content'>
                <ul>
                    <li>Play or Stop the game with the Play/Stop button.</li>
                    <li>Reset the cells with the Reset button.</li>
                    <li>Change between patterns with the Patterns button.</li>
                    <li>Set live cells clicking where needed in the board.</li>
                    <li>Adjust the game's velocity with the slider.</li>
                </ul>
            </div>
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div>
            By <a href="https://github.com/juandavidkincaid">@juandavidkincaid</a> for <a href="https://unal.edu.co/">UNAL</a>
        </div>
    </ControlBarStyled>;
});

const GameStyled = styled.svg`
    width: 100%;
    height: 100%;
`;

const Game = NC('Game', ({})=>{
    const game = useGame();
    const playground = useRef<null | SVGSVGElement>(null);
    const [size, setSize] = useState({ x: 0, y: 0 });
    const [svg, setSvg] = useState<SVGSVGElement | null>(null);

    useEffect(() => {
        if (playground.current) {
            setSize({ x: playground.current.clientWidth, y: playground.current.clientHeight });
            setSvg(playground.current);
        }
    }, [playground.current]);

    useEffect(() => {
        game.size = size;
    }, [size]);

    useEffect(() => {
        if (svg) {
            const strokeStyles = {
                'default': Color(theme.c.b()).grayscale().lightness(5).rgb().string(),
            }
            const fillStyles = {
                'alive': theme.c.a(),
                'dead': Color(theme.c.a()).grayscale().lightness(20).rgb().string(),
                'marked': Color(theme.c.a()).alpha(0.5).rgb().string()
            }
            
            const preDraw = async () => {
                [...svg.children].forEach(child=>child.remove());
                for (const cell of game.cells.values()) {
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.style.transition = 'all 10ms';
                    rect.style.stroke = strokeStyles['default'];
                    rect.style.strokeWidth = '1px';

                    rect.style.fill = fillStyles[cell.status];
                    if(cell.tags.has('marked')){
                        rect.style.fill = fillStyles['marked'];
                    }

                    rect.style.width = `${cell.cellsize}px`;
                    rect.style.height = `${cell.cellsize}px`;

                    rect.addEventListener('mouseover', cell.onMouseOver);
                    rect.addEventListener('mouseout', cell.onMouseOut);
                    rect.addEventListener('click', cell.onClick);

                    rect.setAttribute('x', `${cell.gamepos.x}`);
                    rect.setAttribute('y', `${cell.gamepos.y}`);
                    rect.setAttribute('id', `c${cell.posid}`);
                    svg.appendChild(rect);
                }
            }
            preDraw();
            
            const draw = async () => {
                for (const [cell, draw] of game.tickUpdates) {
                    draw(()=>{
                        const rect = svg.getElementById(`c${cell.posid}`) as SVGRectElement;
                        if(rect){
                            rect.style.fill = fillStyles[cell.status];
                            if(cell.tags.has('marked')){
                                rect.style.fill = fillStyles['marked'];
                            }
                        }
                    });
                }
            }

            game.events.on('gridchange', preDraw);
            game.events.on('frame', draw);

            return () => {
                game.events.off('gridchange', preDraw);
                game.events.off('frame', draw);
            }
        }
    }, [svg]);

    return <GameStyled viewBox={`0 0 ${size.x} ${size.y}`} ref={playground}/>;
});


const PlayGroundStyled = styled.div`
    ${GridStyle}
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 5px 100px;

    row-gap: 5px;

    place-items: center;
    place-content: center;
    padding: 10px;

    .vb-wrapper{
        width: 100%;
        padding: 10px 0;
    }

    .vb{
        height: 1px;
        width: 100%;
        background-color: ${theme.c.a};
    }

    .playground{
        ${FlexStyle}
        width: 100%;
        height: 100%;

        place-items: center;
        place-content: center;
        padding: 5px;
    }

    .stats{
        ${GridStyle}
        height: 100%;
        width: 100%;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(3, 1fr);

        column-gap: 5px;
        row-gap: 5px;

        place-items: start;
        place-content: start;
        padding: 10px;
    }
`;

const PlayGround = NC('PlayGround', ({ }) => {
    const game = useGame();
    const forceUpdate = useForceUpdate();


    useEffect(()=>{
        game.events.on('stats', forceUpdate);
        game.events.on('tick', forceUpdate);
        return () => {
            game.events.off('stats', forceUpdate);
            game.events.on('tick', forceUpdate);
        }
    }, []);

    return <PlayGroundStyled>
        <div className='playground'>
            <Game/>
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div className='stats'>
            <span>Ticks: {game.ticks}</span>
            <span>Velocity: {game.velocity}ms/tick</span>
            <span>Status: {game.status}</span>
            <span>LiveCells: {[...game.cells.values()].filter(c=>c.status==='alive').length}</span>
            <span>CellSize: {game.cellsize}</span>
            <span>BlockSize: {game.blocksize}</span>
            <span>GridSize: {game.mx}x{game.my}</span>
            <span>SvgSize: {game.size.x}x{game.size.y}</span>
        </div>
    </PlayGroundStyled>;
});


const GameViewStyled = styled.div`
    ${GridStyle}
    height: 100%;
    width: 100%;
    grid-template-columns: 350px 5px 1fr;
    grid-template-rows: 1fr;

    column-gap: 5px;

    place-items: center;
    place-content: center;

    .hb-wrapper{
        height: 100%;
        padding: 10px 0;
    }

    .hb{
        width: 1px;
        height: 100%;
        background-color: ${theme.c.a};
    }
`;

const GameView = NC('GameView', ({ }) => {
    return <GameViewStyled>
        <GameProvider initialBlocksize={15} initialCellsize={15} initialVelocity={500}>
            <ControlBar />
            <div className='hb-wrapper'>
                <div className='hb'></div>
            </div>
            <PlayGround />
        </GameProvider>
    </GameViewStyled>;
})

export {
    GameView
}

