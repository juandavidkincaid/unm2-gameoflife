import React, { useState, useEffect, ComponentType } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';
import { EventEmitter } from 'events';
import { NC } from '@gof-util';

import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
type Button = {
    className?: string,
    disabled?: boolean,
    emitter?: EventEmitter,
    events?: string | [string] | [string, string],
    as?: ComponentType<ButtonProps>
} & ButtonProps;

const Button = styled(NC<Button>('Button', ({children, disabled = false, emitter = null, events = null, as: As='button', ...props }) => {
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (emitter && events) {
            const reg: { event: string, fn: any }[] = [];
            const regon = (event: string, fn: any) => { reg.push({ event, fn }); emitter.on(event, fn) };
            const regoff = () => reg.forEach(({ event, fn }) => emitter.off(event, fn));

            if (typeof events === 'string') {
                events = [events, events]
            }
            if (Array.isArray(events)) {
                if (events.length === 1) {
                    events = [events[0], events[0]]
                }
            }

            if (events[0] === events[1]) {
                regon(events[0], () => {
                    setLoading(loading => !loading);
                });
            } else {
                regon(events[0], () => {
                    setLoading(true);
                });
                regon(events[1], () => {
                    setLoading(false);
                });
            }

            return regoff;
        }
    }, [emitter]);

    return <As className={clsx(loading && 'loading', disabled && 'disabled')} {...props}>
        {loading ? <div className='icon-holder'>
            <Icon path={mdiLoading} className='icon' size={0.75} />
        </div> : null}
        {children}
    </As>;
}))``;

export {
    Button
};
