import Phaser from 'phaser'

export default class Scene1 extends Phaser.Scene
{
	constructor()
	{
		super('scene-1')

        var isClicked = false;
	}

	preload()
    {
        this.load.baseURL = "../assets/"

        // Preload Map
        this.load.image('hyptosis_tile-art-batch-1', 'tilemaps/hyptosis_tile-art-batch-1.png')
        this.load.image('hyptosis_tile-art-batch-2', 'tilemaps/hyptosis_tile-art-batch-2.png')

        this.load.tilemapTiledJSON('tilemap', 'tilemaps/level-1.json')

        // Preload Character
        this.load.atlas('flatboy', 'characters/flatboy/spritesheet.png', 'characters/flatboy/spritesheet.json')
    }

    create()
    {
        // Create Map
        var map = this.make.tilemap({ key: 'tilemap' })
        var hyptosisTileset1 = map.addTilesetImage('hyptosis_tile-art-batch-1', 'hyptosis_tile-art-batch-1')
        var hyptosisTileset2 = map.addTilesetImage('hyptosis_tile-art-batch-2', 'hyptosis_tile-art-batch-2')
        
        map.createLayer('Ground', [hyptosisTileset1, hyptosisTileset2])
        map.createLayer('Objects', [hyptosisTileset1, hyptosisTileset2])

        // Create Character
        this.flatboy = this.add.sprite(300, 300, 'flatboy')

        /* Use these commands to get exact frame names for animations
        var frameNames = this.textures.get('flatboy').getFrameNames();
        console.log(frameNames)
        */

        // Create Animation for - Dead
        this.anims.create({
            key: 'dead',
            frames: this.anims.generateFrameNames('flatboy', {start: 1, end: 15, zeroPad: 0, prefix: 'Dead (', suffix: ').png'}),
            frameRate: 15,
            repeat: 0
        })

        // Create Animation for - Idle
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('flatboy', {start: 1, end: 15, zeroPad: 0, prefix: 'Idle (', suffix: ').png'}),
            frameRate: 15,
            repeat: -1
        })

        // Create Animation for - Jump
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('flatboy', {start: 1, end: 15, zeroPad: 0, prefix: 'Jump (', suffix: ').png'}),
            frameRate: 15,
            repeat: -1
        })

        // Create Animation for - Run
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('flatboy', {start: 1, end: 15, zeroPad: 0, prefix: 'Run (', suffix: ').png'}),
            frameRate: 15,
            repeat: -1
        })

        // Create Animation for - Walk
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('flatboy', {start: 1, end: 15, zeroPad: 0, prefix: 'Walk (', suffix: ').png'}),
            frameRate: 15,
            repeat: -1
        })

        this.flatboy.play("run")
    }

    update() {
        if (this.input.activePointer.isDown) {
            this.isClicked = true;
        }
        
        if (this.isClicked) {
            this.flatboy.play("dead")
            this.isClicked = false;
        }
    }
}
