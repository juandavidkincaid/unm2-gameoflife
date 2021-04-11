import { Theme, ThemeProxy } from '@gof-styling';


const theme = Theme.createTheme({
    colors: {
        a: '#FFCA98',
        b: '#FFA34C',
        c: '#F78345',
        d: '#F2784B',
        e: '#D94141'
    },
    fontSize: '1em',
    fontFamily: "'Josefin Slab', serif",
    fontTitle: "'Megrim', cursive",

    fTitle: (theme: ThemeProxy)=>theme.fontTitle
}, 'function');

const AppTheme: InstanceType<typeof Theme> = Theme.accessTheme(theme);

export {
    theme,
    AppTheme
}