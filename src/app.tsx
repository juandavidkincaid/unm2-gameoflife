import React from 'react';
import ReactDOM from 'react-dom';
import {Helmet, HelmetProvider} from 'react-helmet-async';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';
import {I18nextProvider} from 'react-i18next';

import {app, AppTheme, theme, i18n} from '@gof-core';
import {NC} from '@gof-util';

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
        color: ${theme.c.a};
        font-size: ${theme.fSize};
        line-height: 1;
        background-color: ${theme.c.bl};
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
                <link rel="preconnect" href="https://fonts.gstatic.com"/>
                <link href="https://fonts.googleapis.com/css2?family=Josefin+Slab:wght@400&family=Megrim&display=swap" rel="stylesheet"/>
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
