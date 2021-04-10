import { useReducer, useEffect } from 'react';
import lodash from 'lodash';
import { BoundObject } from 'lecasv';
import { EventEmitter } from 'events';


type AppData = {

} & Record<any, any>;

const App = new class App extends BoundObject {
    data: AppData;
    events: EventEmitter;

    constructor() {
        super();
        this.data = {} as AppData;
        this.events = new EventEmitter().setMaxListeners(0);

        this.addHashHandler();
    }

    addHashHandler() {
        window.addEventListener('keydown', (event) => {
            if (event.altKey && event.ctrlKey && event.key.toLocaleLowerCase() === 'h') {
                alert(`
                    FDH-${__webpack_hash__}
                `);
            }
        });
    }

    updateData(data: Record<any, any>) {
        lodash.merge(this.data, data);
        this.events.emit('data.update');
    }

    useAppData() {
        const forceUpdate = useReducer((s) => !s, false)[1];
        useEffect(() => {
            this.events.on('data.update', forceUpdate);
            return () => {
                this.events.off('data.update', forceUpdate);
            }
        });
        return { ...this.data };
    }
}

export {
    App,
    App as app
}
