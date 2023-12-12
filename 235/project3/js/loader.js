//The font is now the Google Font named Silkscreen.
//It doesn't look like what you would expect a font with that name to be called.
//It's just pixel art text really.
WebFont.load({
    google: {
        families: ['Silkscreen']
    },
    active: e => {
        app.loader.onComplete.add(setup);
        app.loader.load();
    }
});