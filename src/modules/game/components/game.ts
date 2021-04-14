import { BoundObject } from 'lecasv';
import {EventEmitter} from 'events';

import {GamePattern, GamePatterns} from './patterns';


const cacheProp = (times: number = -1) =>{
    let cache: any;
    let called: number = 0;

    return function(target: any, prop: string, desc: PropertyDescriptor){
        const orgGet = desc.get;
        desc.get = function(){
            if(times > -1 && called >= times){
                cache = undefined;
            }
            if(cache === undefined){
                cache = (orgGet ??  (()=>{})).call(target);
            }
            return cache;
        }
    }
}



class Cell extends BoundObject{
    posid: number;
    events: EventEmitter;

    tags: Set<'marked'>;
    tickUpdate: (update: ()=>void)=>void;
    private _cellsize: number;
    private _blocksize: number;
    private _status: 'dead' | 'alive';    
    private _neighbours: Set<Cell>;

    game: Game;

    constructor(posid: number, game: Game){
        super();

        this.posid = posid;
        this.game = game;
        
        this._cellsize = 0;
        this._blocksize = 0;
        this.tags = new Set();
        this._status = 'dead';
        this._neighbours = new Set();

        this.events = new EventEmitter().setMaxListeners(0);

        this.tickUpdate = ()=>{};
        this.requestTickUpdate();
        this.tickUpdate(()=>{});

    }

    requestTickUpdate(){
        this.tickUpdate = this.game.requestTickUpdate(this);
    }

    setSizes(cellsize: number, blocksize: number){
        this.cellsize = cellsize;
        this.blocksize = blocksize;
    }

    get cellsize(){
        return this._cellsize;
    }

    set cellsize(value){
        this._cellsize = value;
        this.events.emit('cellsize', value);
    }

    get blocksize(){
        return this._blocksize;
    }

    set blocksize(value){
        this._blocksize = value;
        this.events.emit('blocksize', value);
    }
    
    get pos(){
        const x = Math.floor(this.posid % this.game.mx);
        const y = Math.floor(this.posid / this.game.mx);
        return {x, y};
    }

    
    get gamepos(){
        return {
            x: this.pos.x * this.blocksize,
            y: this.pos.y * this.blocksize
        }
    }

    get status(){
        return this._status;
    }

    set status(value){
        this._status = value; 
        this.events.emit('status', value);
    }

    getGamePosid(pos: {x:number, y: number}){
        return this.game.mx * pos.y + pos.x;
    }

    retriveNeighbours(radius: number = 3){
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

                const posid = this.getGamePosid(pos);

                const cell = this.game.getCellByPosid(posid);

                if (cell) {
                    this._neighbours.add(cell);
                }
            }
        }
    }

    getNeighbours(filter: (cell: Cell)=>boolean){
        if(this._neighbours.size === 0){
            this.retriveNeighbours();
        }

        return new Set([...this._neighbours].filter(filter));
    }

    tick(){
        const alivens = this.getNeighbours(cell=>cell.status === 'alive');

        if (this.status === 'alive') {
            if (alivens.size == 2 || alivens.size == 3) {
                this.tickUpdate(()=>this.status = 'alive');
            }else{
                this.tickUpdate(()=>this.status = 'dead');
            }
        }

        if (this.status === 'dead') {
            if (alivens.size == 3) {
                this.tickUpdate(()=>this.status = 'alive');
            }
        }
    }

    getRelativePatternCells(pattern: GamePattern){
        const cells: Set<Cell> = new Set();
        for(const [y, row] of pattern.pattern.entries()){
            for(const [x, cell] of row.entries()){
                if(cell === 1){
                    const posid = this.getGamePosid({
                        x: this.pos.x + x, 
                        y: this.pos.y + y,
                    });
                    const found = this.game.getCellByPosid(posid);
                    if(found){
                        cells.add(found);
                    }
                }
            }
        }
        return cells;
    }

    /*Extra Events*/
    onMouseOver(){
        const cells = this.getRelativePatternCells(this.game.pattern);
        cells.forEach((cell)=>{
            cell.tickUpdate(()=>cell.tags.add('marked'));
        });
    }

    onMouseOut(){
        const cells = this.getRelativePatternCells(this.game.pattern);
        cells.forEach((cell)=>{
            cell.tickUpdate(()=>cell.tags.delete('marked'));
        });
    }

    onClick(){
        const cells = this.getRelativePatternCells(this.game.pattern);
        cells.forEach((cell)=>{
            cell.tickUpdate(()=>cell.status = 'alive');
        });
    }
}


class Game extends BoundObject{
    mx: number;
    my: number;
    private _cellsize: number;
    private _blocksize: number;
    private _size: {x: number, y: number};
    
    cells: Map<number, Cell>;
    rtime: number;
    ltime: number;
    ticks: number;
    private _fid: number;
    private _velocity: number;
    private _status: 'play' | 'stop';
    private _pattern: GamePattern;

    events: EventEmitter;
    updateQueue: Map<Cell, (()=>void)[]>;

    constructor(cellsize: number, blocksize: number, velocity: number){
        super();

        this.events = new EventEmitter().setMaxListeners(0);

        this._size = {x: 0, y: 0};
        this.mx = 0;
        this.my = 0;
        this.size = {x: 0, y: 0};
        this._cellsize = cellsize;
        this._blocksize = blocksize;

        this._fid = 0;
        this.cells = new Map();
        this.rtime = this.ltime = Date.now();
        this.ticks = 0;
        

        this._velocity = 5000;
        this._status ='stop';
        this._pattern = [...GamePatterns].find(gp=>gp.id==='s_dot') as GamePattern;
        this.velocity = velocity;
        this.status = 'stop';


        
        this.updateQueue = new Map();

        /*Listeners*/
        this.events.on('size', this.buildCells);

        this.events.on('cellsize', ()=>this.events.emit('stats'));
        this.events.on('blocksize', ()=>this.events.emit('stats'));
        this.events.on('size', ()=>this.events.emit('stats'));
        this.events.on('status', ()=>this.events.emit('stats'));
        this.events.on('velocity', ()=>this.events.emit('stats'));
        this.events.on('pattern', ()=>this.events.emit('stats'));
        this.events.on('reset', ()=>this.events.emit('stats'));

        this.events.on('cellsize', ()=>this.events.emit('gridchange'));
        this.events.on('blocksize', ()=>this.events.emit('gridchange'));
        this.events.on('size', ()=>this.events.emit('gridchange'));

        this.events.on('tick', ()=>this.events.emit('update'));
        this.events.on('frame', ()=>this.events.emit('update'));
        
        this.events.on('gridchange', ()=>this.buildCells());

        this.buildCells();
        this.startFraming();
    }

    get cellsize(){
        return this._cellsize;
    }

    set cellsize(value){
        this._cellsize = value;
        this.events.emit('cellsize', value);
    }

    get blocksize(){
        return this._blocksize;
    }

    set blocksize(value){
        this._blocksize = value;

        this.mx = Math.floor(this.size.x / value);
        this.my = Math.floor(this.size.y / value);

        this.events.emit('blocksize', value);
    }

    get size(){
        return this._size;
    }

    set size(value){
        this.mx = Math.floor(value.x / this.blocksize);
        this.my = Math.floor(value.y / this.blocksize);

        this._size = value;
        this.events.emit('size');
    }

    get status(){
        return this._status;
    }

    set status(value){
        this._status = value;

        if(this._status === 'play'){
            this.startFraming();
        }

        if(this._status === 'stop'){

        }
        
        this.events.emit('status', value);
    }

    get velocity(){
        return this._velocity;
    }

    set velocity(value){
        value = Math.max(value, 50);
        value = Math.min(value, 5000);
        this._velocity = value;
        this.events.emit('velocity', value);
    }

    get pattern(){
        return this._pattern;
    }

    set pattern(value){
        this._pattern = value;
        this.events.emit('pattern', value);
    }


    get tickUpdates(){
        const updates: [Cell, (draw: ()=>void)=>void][] = [];

        for(const [cell, queue] of this.updateQueue.entries()){
            updates.push([cell, (draw)=>{
                queue.forEach(update=>update());
                draw();
                this.updateQueue.delete(cell);
            }]);
        }

        return updates;
    }
    

    getCellByPosid(posid: number){
        return this.cells.get(posid) ?? null;
    }

    getCellByGamepos(pos: {x: number, y: number}){
        const x = Math.floor(pos.x / this.blocksize);
        const y = Math.floor(pos.y / this.blocksize);
        const posid = this.mx * y + x;
        return this.getCellByPosid(posid);
    }

    buildCells(){
        this.cells = new Map();

        for(let posid = 0; posid < this.mx * this.my; posid++){
            const cell = new Cell(posid, this);
            cell.setSizes(this.cellsize, this.blocksize);
            this.cells.set(posid, cell);
        }
    }

    buildRandomCells(){
        this.cells = new Map();

        for(let posid = 0; posid < this.mx * this.my; posid++){
            const cell = new Cell(posid, this);
            cell.setSizes(this.cellsize, this.blocksize);
            cell.status = (Math.random() - 0.5) < 0 ? 'alive' : 'dead';

            this.cells.set(posid, cell);
        }
    }

    requestTickUpdate(cell: Cell){
        const tickUpdate = (update: ()=>void)=>{
            if(this.updateQueue.has(cell)){
                const queue = this.updateQueue.get(cell);
                if(queue){
                    queue.push(update);
                }
            }
            this.updateQueue.set(cell, [update]);
        }
        return tickUpdate;
    }

    reset(){
        this.cells = new Map();
        this.rtime = this.ltime = Date.now();
        this.ticks = 0;
        this.status = 'stop';
        this.pattern = [...GamePatterns].find(gp=>gp.id==='s_dot') as GamePattern;
        this.events.emit('reset');
    }

    /*Animate and Ticking*/
    startFraming(){
        this.rtime = this.ltime = Date.now();
        this._fid = requestAnimationFrame(this.framing);
    }

    stopFraming(){
        cancelAnimationFrame(this._fid);
    }

    framing(){
        const ntime = Date.now();
        const delta = ntime - this.ltime;
        const ticks = Math.floor(delta / this.velocity);

        if(ticks > 0){
            for (let i = 0; i < ticks; i++) {
                setTimeout(this.ticking, 0);
            }
            this.ltime = ntime;
        }
        this.events.emit('frame');
        this._fid = requestAnimationFrame(this.framing);
    }

    ticking(){
        if(this.status === 'play'){
            for(const cell of this.cells.values()){
                cell.tick();
            }
            this.ticks++;
            this.events.emit('tick');
        }
    }
}

export {
    Game,
    Cell
}