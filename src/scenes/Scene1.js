import Phaser from 'phaser'

export default class Scene1 extends Phaser.Scene
{
	constructor()
	{
		super('scene-1')
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
            frames: [{
                key: 'flatboy',
                frame: 'Dead (1).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (2).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (3).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (4).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (5).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (6).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (7).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (8).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (9).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (10).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (11).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (12).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (13).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (14).png'
            }, {
                key: 'flatboy',
                frame: 'Dead (15).png'
            }, ],
            frameRate: 15,
            repeat: 0
        })

        // Create Animation for - Idle
        this.anims.create({
            key: 'idle',
            frames: [{
                key: 'flatboy',
                frame: 'Idle (1).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (2).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (3).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (4).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (5).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (6).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (7).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (8).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (9).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (10).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (11).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (12).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (13).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (14).png'
            }, {
                key: 'flatboy',
                frame: 'Idle (15).png'
            }, ],
            frameRate: 15,
            repeat: -1
        })

        // Create Animation for - Jump
        this.anims.create({
            key: 'jump',
            frames: [{
                key: 'flatboy',
                frame: 'Jump (1).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (2).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (3).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (4).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (5).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (6).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (7).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (8).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (9).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (10).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (11).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (12).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (13).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (14).png'
            }, {
                key: 'flatboy',
                frame: 'Jump (15).png'
            }, ],
            frameRate: 15,
            repeat: -1
        })

        // Create Animation for - Run
        this.anims.create({
            key: 'run',
            frames: [{
                key: 'flatboy',
                frame: 'Run (1).png'
            }, {
                key: 'flatboy',
                frame: 'Run (2).png'
            }, {
                key: 'flatboy',
                frame: 'Run (3).png'
            }, {
                key: 'flatboy',
                frame: 'Run (4).png'
            }, {
                key: 'flatboy',
                frame: 'Run (5).png'
            }, {
                key: 'flatboy',
                frame: 'Run (6).png'
            }, {
                key: 'flatboy',
                frame: 'Run (7).png'
            }, {
                key: 'flatboy',
                frame: 'Run (8).png'
            }, {
                key: 'flatboy',
                frame: 'Run (9).png'
            }, {
                key: 'flatboy',
                frame: 'Run (10).png'
            }, {
                key: 'flatboy',
                frame: 'Run (11).png'
            }, {
                key: 'flatboy',
                frame: 'Run (12).png'
            }, {
                key: 'flatboy',
                frame: 'Run (13).png'
            }, {
                key: 'flatboy',
                frame: 'Run (14).png'
            }, {
                key: 'flatboy',
                frame: 'Run (15).png'
            }, ],
            frameRate: 15,
            repeat: -1
        })

        // Create Animation for - Walk
        this.anims.create({
            key: 'walk',
            frames: [{
                key: 'flatboy',
                frame: 'Walk (1).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (2).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (3).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (4).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (5).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (6).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (7).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (8).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (9).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (10).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (11).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (12).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (13).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (14).png'
            }, {
                key: 'flatboy',
                frame: 'Walk (15).png'
            }, ],
            frameRate: 15,
            repeat: -1
        })

        this.flatboy.play("run")
    }
}
