// Based on https://phaser.io/examples/v2/demoscene/atari-intro

/*
 * Preload is called first. Normally you'd use this to load your game assets.
 * You shouldn't create any objects in this method that require assets that
 * you're also loading in this method, as they won't yet be available.
*/
preload((game) => {
    game.load.baseURL = "https://examples.phaser.io/assets/";
    game.load.crossOrigin = "anonymous";
    game.load.image("atari", "demoscene/atari.png");
    game.load.image("raster", "demoscene/pink-raster.png");
    game.load.image("floor", "demoscene/checker-floor.png");
    game.load.audio("tune", "audio/bodenstaendig_2000_in_rock_4bit.mp3");
});

let effect: Phaser.BitmapData;
let image: Phaser.Image;
const mask = new Phaser.Rectangle();

/*
 * Create is called once preload has completed, this includes the loading of
 * any assets.
 * If you don't have a preload method then create is the first method called.
 */
create((game) => {
    game.stage.backgroundColor = "#000042";
    const floor = game.add.image(0, game.height, "floor");
    floor.width = 800;
    floor.anchor.y = 1;
    effect = game.make.bitmapData();
    effect.load("atari");
    image = game.add.image(game.world.centerX, game.world.centerY, effect);
    image.anchor.set(0.5);
    image.smoothed = false;
    mask.setTo(0, 0, effect.width, game.cache.getImage("raster").height);
    game.add.tween(mask).to({ y: effect.height - mask.height }, 3000, Phaser.Easing.Sinusoidal.InOut, true, 0, 100, true);
    game.add.tween(image.scale).to({ x: 4, y: 4 }, 3000, Phaser.Easing.Quartic.InOut, true, 0, 100, true);
    game.add.audio("tune").play();
});

/*
 * Update is called during the core game loop.
 */
update(() => {
    effect.alphaMask("raster", effect, mask);
    image.rotation += 0.01;
});
