WebFont.load({
    google: {
        families: ['Silkscreen']
    },
    active: e => {
        app.loader.onComplete.add(setup);
        app.loader.load();
    }
});