import React, {useReducer, useEffect, useContext, FC} from 'react';
import {merge as lodashMerge} from 'lodash';
import {BoundObject} from 'lecasv';
import {EventEmitter} from 'events';

import {NC} from '@gof-util';

const ThemeContextUnavailable = Symbol('ThemeContextUnavailable');
const ThemeContext = React.createContext<typeof ThemeContextUnavailable | {theme: ThemeProxy}>(ThemeContextUnavailable);
const GetterFunction = Symbol('GetterFunction');
const ThemeAccess = Symbol('ThemeAccess');
type ThemeProxy = Record<any, any> & typeof Proxy;

const Theme = class Theme extends BoundObject{
    hooks: Record<any, InstanceType<typeof EventEmitter>>;
    store: Record<any, any>;
    theme: ThemeProxy;
    mode: 'prop' | 'function';
    Provider: {
        ({children}: any):any;
        displayName?: string;
    };
    Consumer: {
        ({children}: {children: ((theme: ThemeProxy)=>any[]) | ((theme: ThemeProxy)=>any)}):any;
        displayName?: string;
    };

    static accessTheme(theme: ThemeProxy): Theme{
        return theme[ThemeAccess as any] ?? null;
    }

    static isTheme(theme: ThemeProxy){
        return theme[ThemeAccess as any] instanceof Theme;
    }

    static createTheme(theme={}, mode: 'prop' | 'function'='prop'): ThemeProxy{
        const themei = new Theme(theme, mode);
        return themei.theme;
    }

    constructor(theme={}, mode: 'prop' | 'function'='prop'){
        super();
        this.hooks = {
            theme: new EventEmitter(),
            themeProperty: new EventEmitter()
        };
        this.mode = mode;
        this.store = lodashMerge({
            colors: {
                a: '#00ffff',
                b: '#ff00ff',
                c: '#ffff00',
                d: '#00ff00',
                e: '#0000ff',
                black: '#000000',
                white: '#ffffff',
                bl: (theme: ThemeProxy, ctx: ThemeProxy)=>ctx.black,
                wh: (theme: ThemeProxy, ctx: ThemeProxy)=>ctx.white,
            },
            fontSize: '1em',
            fontFamily: '"sans-serif"',
            fSize: (theme: ThemeProxy)=>theme.fontSize,
            fFamily: (theme: ThemeProxy)=>theme.fontFamily,
            c: (theme: ThemeProxy)=>theme.colors,

        }, theme);
        this.theme = this.propertyGetterProxy(this.themePropertyHandler, this.store);

        const Provider: Theme["Provider"] = this.ProviderComponent;
        Provider.displayName = `Theme.Provider`;
        this.Provider = Provider;

        const Consumer: Theme["Consumer"] = this.ConsumerComponent;
        Consumer.displayName = `Theme.Consumer`;
        this.Consumer = Consumer;
    }

    propertyGetterProxy(handler: (prop: string, ...args: any[])=>any, ...args: any[]){
        return new Proxy(Object.create(null), {
            get: (target: never, prop: string, reciever: never)=>{
                return handler(prop, ...args);
            },
            getPrototypeOf: (target: never)=>{
                return Theme;
            }
        });
    }

    themePropertyHandler(prop: string | symbol, store: Theme["store"]){
        if(prop === ThemeAccess){
            return this;
        }

        const storeValue = store[prop as any] ?? null;
        let actualValue: any;
        if(typeof storeValue === 'function'){
            actualValue = storeValue(this.theme, this.propertyGetterProxy(
                this.themePropertyHandler,
                store
            ));
        }else{
            actualValue = storeValue;
        }

        if(actualValue !== null && typeof actualValue === 'function' && actualValue[GetterFunction]){
            actualValue = actualValue();
        }


        if(this.isIndexable(actualValue)){
            return this.propertyGetterProxy(this.themePropertyHandler, actualValue);
        }else{
            if(this.mode === 'prop'){
                return actualValue;
            }
            if(this.mode === 'function'){
                const getter: {
                    (): any;
                    [GetterFunction]?: boolean;
                } = ()=>actualValue;
                getter[GetterFunction] = true;
                return getter;
            }
        }
    }

    isIndexable(obj: any){
        if(Array.isArray(obj)){
            return true;
        }
        if(typeof obj === 'object' && obj !== null){
            return true;
        }
        return false;
    }

    updateTheme(theme={}){
        this.store = lodashMerge(this.store, theme);
        this.hooks.theme.emit('change', this.theme);
    }

    /*React*/
    useTheme(){
        const ctx = useContext(ThemeContext);
        if(ctx === ThemeContextUnavailable){
            return null;
        }
        return ctx.theme;
    }

    themeComponent<P extends any={}>(Component: FC<P>){
        return NC<P>(`Theme<${Component.displayName ?? 'Component'}>`, (props: P, ref: any)=>{
            this.useTheme();
            return <Component {...props} ref={ref}/>;
        });
    }


    ProviderComponent({children}: any){
        const [status, forceUpdate] = useReducer((s)=>s+1, 1);
        useEffect(()=>{
            this.hooks.theme.on('change', forceUpdate);
        }, []);
        return <ThemeContext.Provider value={{theme: this.theme}} key={status}>
            {children}
        </ThemeContext.Provider>
    }

    ConsumerComponent({children}: {children: ((theme: ThemeProxy)=>any[]) | ((theme: ThemeProxy)=>any)}){
        const theme = this.useTheme();
        if(theme === null){
            throw new Error(`<Theme.Consumer/> Component needs to be used inside a <Theme.Provider/> Component`)
        }

        if(Array.isArray(children)){
            return children.map((c: any)=>{
                if(typeof c === 'function'){
                    return c(theme);
                }
                return c;
            });
        }

        if(typeof children === 'function'){
            return children(theme);
        }
        return null;
    }
}

export {
    Theme,
    ThemeProxy,
    EventEmitter
}