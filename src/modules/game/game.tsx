import React, { useState, useEffect, useRef } from 'react';
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

import { GameCell, GameController, useGameController, GamePattern, GamePatterns } from './components';

const ControlBarStyled = styled.div`
    ${GridStyle}
    padding: 10px;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 70px 5px 1fr 5px 1fr 5px 15px;

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
        grid-auto-rows: 1fr;

        row-gap: 5px;


        button{
            ${ButtonStyle(theme)}
            width: 100%;
            height: 50px;
            
        }
    }
`;

const ControlBar = NC('ControlBar', () => {
    const control = useGameController();


    return <ControlBarStyled>
        <div className='title'>
            Conway's Game Of Life
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div className='controls'>
            <Button onClick={() => {
                const status = control.getStatus();
                if (status === 'play') {
                    control.setStatus('stop');
                }
                if (status === 'stop') {
                    control.setStatus('play');
                }
            }}>
                {control.getStatus() === 'play' && 'Stop'}
                {control.getStatus() === 'stop' && 'Play'}
            </Button>
            <Button onClick={control.reset}>
                Reset
            </Button>
            <Button onClick={() => {
                const patterns = [...GamePatterns];
                const index = patterns.findIndex(p => p.id === control.pattern.id);
                if (index > -1) {
                    control.setPattern(patterns[(index + 1) % patterns.length]);
                }
            }}>
                Pattern: {control.pattern.name}
            </Button>
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div className='instructions'>
            <div className='title'>
                Instructions
            </div>
            <div className='content'>

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

        canvas{
            width: 100%;
            height: 100%;
        }
    }
`;

const PlayGround = NC('PlayGround', ({ }) => {
    const control = useGameController();
    const playground = useRef<null | HTMLCanvasElement>(null);
    const [size, setSize] = useState({ x: 0, y: 0 });
    const [canvas, setCanvas] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (playground.current) {
            setSize({ x: playground.current.clientWidth, y: playground.current.clientHeight });
            setCanvas(playground.current.getContext('2d'));
            playground.current.width = playground.current.clientWidth;
            playground.current.height = playground.current.clientHeight;
        }
    }, []);

    useEffect(() => {
        control.setSize(size);
    }, [size]);

    useEffect(() => {
        if (canvas) {
            const draw = async () => {
                canvas.clearRect(0, 0, size.x, size.y);
                for (const cell of control.getCells()) {
                    canvas.strokeStyle = Color(theme.c.b()).grayscale().lightness(5).rgb().string();
                    canvas.lineWidth = 1;

                    if (cell.status === 'alive') {
                        canvas.fillStyle = theme.c.a();
                    }

                    if (cell.status === 'dead') {
                        canvas.fillStyle = Color(theme.c.a()).grayscale().lightness(20).rgb().string();
                    }

                    if (cell.tags.has('marked')) {
                        canvas.fillStyle = Color(theme.c.a()).alpha(0.5).rgb().string();
                    }

                    canvas.beginPath();
                    canvas.rect(
                        cell.getPlaygroundPos().x,
                        cell.getPlaygroundPos().y,
                        cell.size,
                        cell.size,
                    );
                    canvas.fill();
                    canvas.stroke();
                    canvas.closePath();
                }
            }
            control.events.on('animate', draw);
            return () => {
                control.events.off('animate', draw);
            }
        }
    }, [canvas]);

    const tailer = (fn: (...args: any[]) => any) => {
        let tail: (...args: any[]) => any = () => { };
        return (...args: any) => {
            tail();
            const ret = fn(...args);
            if (typeof ret === 'function') {
                tail = ret;
            }
        }
    }

    return <PlayGroundStyled>
        <div className='playground'>
            <canvas ref={playground}
                onMouseMove={tailer((event) => {
                    const cell = control.getCellByPlaygroundPos({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY
                    });
                    if (cell) {
                        cell.onMouseOver();
                        return () => {
                            cell.onMouseOut();
                        }
                    }

                })}
                onMouseUp={(event) => {
                    const cell = control.getCellByPlaygroundPos({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY
                    });
                    if (cell) {
                        cell.onClick();
                    }
                }}
            />
        </div>
        <div className='vb-wrapper'>
            <div className='vb'></div>
        </div>
        <div>

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
        <GameController>
            <ControlBar />
            <div className='hb-wrapper'>
                <div className='hb'></div>
            </div>
            <PlayGround />
        </GameController>
    </GameViewStyled>;
})

export {
    GameView
}

