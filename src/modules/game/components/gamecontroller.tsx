import React, { useState, useReducer, useContext, useMemo } from 'react';
import { BoundObject } from 'lecasv';

import {
    NC  
} from '@gof-util';

import {GamePattern, GamePatterns} from './patterns';
import {EventEmitter} from 'events';

class GameCell extends BoundObject {
    id: number;
    pos: { x: number, y: number };
    size: number;
    blocksize: number;
    game: GameControl;
    status: 'dead' | 'alive';
    tags: Set<'marked'>;
    updatePending: boolean;
    nextUpdate: ()=>void;
    events: EventEmitter;
    neighbours: Set<GameCell>;


    constructor(id: number, pos: GameCell["pos"], size: number, blocksize: number, game: GameControl) {
        super();
        this.id = id;
        this.pos = pos;
        this.size = size;
        this.blocksize = blocksize;
        this.status = 'dead';
        this.game = game;
        this.tags = new Set();
        this.events = new EventEmitter().setMaxListeners(0);
        this.updatePending = false;
        this.nextUpdate = ()=>{};
        this.neighbours = new Set();
    }

    getPlaygroundPos() {
        return {
            x: this.pos.x * this.blocksize,
            y: this.pos.y * this.blocksize
        }
    }

    getNeighbours(radius: number = 3) {
        if(this.neighbours.size === 0){
            
            radius = radius % 2 === 1 ? radius : radius - 1;

            const startPos = {
                x: this.pos.x - Math.floor(radius / 2),
                y: this.pos.y - Math.floor(radius / 2),
            }

            for (let x = 0; x < radius; x++) {
                for (let y = 0; y < radius; y++) {
                    const pos = {
                        x: startPos.x + x,
                        y: startPos.y + y,
                    }

                    if(pos.x === this.pos.x && pos.y === this.pos.y){
                        continue;
                    }

                    const cell = this.game.getCellByPos(pos);

                    if (cell) {
                        this.neighbours.add(cell);
                    }
                }
            }
        }

        return new Set([...this.neighbours].filter(n=>n.status === 'alive'));
    }

    async tick() {
        window.tickers.d3++;
        const neighbours = this.getNeighbours();
        
        if (this.status === 'alive') {
            if (neighbours.size == 2 || neighbours.size == 3) {
                this.setUpdate(()=>this.status = 'alive');
            }else{
                this.setUpdate(()=>this.status = 'dead');
            }
        } 
        if (this.status === 'dead') {
            if (neighbours.size == 3) {
                this.setUpdate(()=>this.status = 'alive');
            }
        }

        this.update();
    }

    getRelativePatternCells(pattern: GamePattern){
        const cells: Set<GameCell> = new Set();
        for(const [y, row] of pattern.pattern.entries()){
            for(const [x, cell] of row.entries()){
                if(cell === 1){
                    const found = this.game.getCellByPos({
                        x: this.pos.x + x, 
                        y: this.pos.y + y,
                    });
                    if(found){
                        cells.add(found);
                    }
                }
            }
        }
        return cells;
    }

    onMouseOver(){
        const cells = this.getRelativePatternCells(this.game.pattern);
        cells.forEach((cell)=>{
            cell.setUpdate(()=>cell.tags.add('marked'));
            cell.update();
        });
    }

    onMouseOut(){
        const cells = this.getRelativePatternCells(this.game.pattern);
        cells.forEach((cell)=>{
            cell.setUpdate(()=>cell.tags.delete('marked'));
            cell.update();
        });
    }

    onClick(){
        const cells = this.getRelativePatternCells(this.game.pattern);
        cells.forEach((cell)=>{
            cell.setUpdate(()=>cell.status = 'alive');
            cell.update();
        });
    }

    setUpdate(update: ()=>void){
        this.updatePending = true;
        this.nextUpdate = update;
    }

    update() {
        this.events.emit('update');
    }

    draw(fn: ()=>void) {
        if(this.updatePending){
            this.nextUpdate();
            fn();
            this.updatePending = false;
        }
    }
}


class GameControl extends BoundObject {
    status: 'play' | 'stop';
    size: { x: number, y: number };
    cellsize: number;
    blocksize: number;
    cells: Set<GameCell>;
    velocity: number;
    time: null | number;
    ticks: null | number;
    generations: number;
    aid?: number;
    pattern: GamePattern;
    updater: (update: { control: GameControl }) => void;
    events: EventEmitter;
    

    constructor() {
        super();
        this.status = 'stop';
        this.updater = () => { };
        this.size = { x: 0, y: 0 };
        this.cellsize = 10;
        this.blocksize = 10;
        this.velocity = 100;
        this.time = null;
        this.ticks = null;
        this.generations = 0;

        this.pattern = [...GamePatterns].find(gp=>gp.id==='s_dot') as GamePattern;

        this.cells = new Set();
        this.events = new EventEmitter().setMaxListeners(0);
        this.playAnimation();
    }

    setCells() {
        this.cells = new Set();
        const mx = Math.floor(this.size.x / this.blocksize);
        const my = Math.floor(this.size.y / this.blocksize);

        for (let i = 0; i < mx * my; i++) {
            const x = Math.floor(i % mx);
            const y = Math.floor(i / mx);

            this.cells.add(new GameCell(i, { x, y }, this.cellsize, this.blocksize, this));
        }

        this.update();
    }

    setRandomCells(){
        this.cells = new Set();
        const mx = Math.floor(this.size.x / this.blocksize);
        const my = Math.floor(this.size.y / this.blocksize);

        for (let i = 0; i < mx * my; i++) {
            const x = Math.floor(i % mx);
            const y = Math.floor(i / mx);

            const cell = new GameCell(i, { x, y }, this.cellsize, this.blocksize, this);
            cell.status = (Math.random() * 10000) % 2 ? 'alive' : 'dead';
            this.cells.add(cell);
        }

        this.update();
    }

    setPattern(pattern: GamePattern){
        this.pattern = pattern;
        this.update();
    }

    getCells() {
        return [...this.cells];
    }

    getCellByPos(pos: GameCell["pos"]) {
        for (const cell of this.cells) {
            if (cell.pos.x === pos.x && cell.pos.y === pos.y) {
                return cell;
            }
        }

        return null;
    }

    getCellByPlaygroundPos(pos: GameCell["pos"]) {
        for (const cell of this.cells) {
            const playgroundPos = cell.getPlaygroundPos();
            const rangeX = [playgroundPos.x, playgroundPos.x + cell.size];
            const rangeY = [playgroundPos.y, playgroundPos.y + cell.size];

            if (
                (rangeX[0] <= pos.x && rangeX[1] > pos.x)
                && 
                (rangeY[0] <= pos.y && rangeY[1] > pos.y)
            ) {
                return cell;
            }
        }

        return null;
    }

    getCellById(id: number) {
        for (const cell of this.cells) {
            if (cell.id === id) {
                return cell;
            }
        }

        return null;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status: GameControl["status"]) {
        this.status = status;

        if (this.status === 'play') {
            this.playAnimation();
            this.playTicker();
        }

        if (this.status === 'stop') {
            this.stopTicker();
        }

        this.update();
    }

    reset(){
        this.status = 'stop';
        this.pattern = [...GamePatterns].find(gp=>gp.id==='s_dot') as GamePattern;
        this.stopAnimation();
        this.stopTicker();
        this.generations = 0;
        this.setCells();
        this.events.emit('animate');
        this.update();
    }


    playAnimation() {
        this.stopAnimation();
        this.aid = window.setInterval(this.animate, 0);
        this.time = Date.now();
    }

    async animate() {
        if (this.time !== null) {
            const now = Date.now();
            const delta = now - this.time;
            const ticks = Math.floor(delta / this.velocity);
            if(ticks > 0){
                for (let i = 0; i < ticks; i++) {
                    setTimeout(this.tick, 0);
                }
                this.time = now;
            }
            this.events.emit('animate');
        }
    }

    stopAnimation() {
        if (this.aid) {
            window.clearInterval(this.aid);
            this.time = null;
        }
    }

    playTicker(){
        if(this.ticks === null){
            this.ticks = 0;
        }
    }

    async tick() {
        window.tickers.d4++;
        if (this.ticks !== null) {
            for(const cell of this.cells){
                window.tickers.d5++;
                await cell.tick();
            }
            this.ticks++;
            this.generations++;
            this.events.emit('tick');
        }
    }

    stopTicker(){
        this.ticks = null;
    }


    setCellSize(cellsize: GameControl["cellsize"], blocksize?: GameControl["blocksize"]) {
        blocksize = blocksize || cellsize * 2;
        this.cellsize = cellsize;
        this.blocksize = blocksize;
        this.setCells();
    }

    setSize(size: GameControl["size"]) {
        this.size = size;
        this.setCells();
    }

    update() {
        this.updater({ control: this });
        this.events.emit('animate');
    }

    setUpdate(updater: (update: { control: GameControl }) => void) {
        this.updater = updater;
    }
}


const GameControllerContext = React.createContext<{ control: GameControl } | null>(null);

const useGameController = () => {
    const ctx = useContext(GameControllerContext);

    if (ctx === null) {
        throw new Error('calling useGameController() is only possible under a <GameController/> component');
    }

    return ctx.control;
}


const GameController = NC('GameController', ({ children }) => {
    const control = useMemo(() => new GameControl(), []);
    const [update, setUpdate] = useState(() => ({ control }));

    control.setUpdate(setUpdate);

    return <GameControllerContext.Provider value={update}>
        {children}
    </GameControllerContext.Provider>
})


export {
    useGameController,
    GameController,
    GameCell
}