import { Theme } from '@gof-styling';


const theme = Theme.createTheme({
    colors: {
        a: '#1c2f75',
        b: '#324073',
        c: '#546bbf',
        d: '#6b88f2',
        e: '#b5c3f4'
    },
    fontSize: '1em',
    fontFamily: "'Grenze', serif"
}, 'function');

const AppTheme: InstanceType<typeof Theme> = Theme.accessTheme(theme);

export {
    theme,
    AppTheme
}