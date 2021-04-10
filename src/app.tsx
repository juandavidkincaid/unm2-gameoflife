import React from 'react';
import ReactDOM from 'react-dom';
import {Helmet, HelmetProvider} from 'react-helmet-async';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';
import {I18nextProvider} from 'react-i18next';

import {app, AppTheme, theme, i18n} from '@gof-core';
import {viewportSwitch} from '@gof-styling'
import {NC} from '@gof-util';

import {NotFoundView} from '@gof-components';

import {GameView} from '@gof-modules/game';


const GlobalStyle = createGlobalStyle`
    *{
        box-sizing: border-box;
    }
    
    html, body, #App{
        width: 100%;
        height: 100%;
        margin: 0;
        display: grid;
        place-content: start;
        place-items: start;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        font-family: ${theme.fFamily};
        font-size: 1;
        line-height: 1;
        background-color: ${theme.c.wh};
    }
`;

const App = NC<{}>('App', ({})=>{
    app.useAppData();

    return <Routes>
        <Route path='*' element={<GameView/>}/>
    </Routes>;
});

ReactDOM.render(<React.StrictMode>
    <I18nextProvider i18n={i18n}>
        <HelmetProvider>
            <Helmet>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Grenze&display=swap');
                </style>
            </Helmet>
            <Router>
                <AppTheme.Provider>
                    <GlobalStyle/>
                    <App/>
                </AppTheme.Provider>
            </Router>
        </HelmetProvider>
    </I18nextProvider>
</React.StrictMode>, document.getElementById('App'))
