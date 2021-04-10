import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import styled, {css} from 'styled-components';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

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


const GameViewStyled = styled.div`
    ${GridStyle}
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr min-content;
    grid-auto-rows: min-content;
`;

const GameView = NC('GameView', ({ }) => {
    return <GameViewStyled>

    </GameViewStyled>;
})

export {
    GameView
}
