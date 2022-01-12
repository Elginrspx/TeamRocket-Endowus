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
        //this.load.image('flatboy', 'characters/flatboy/Idle (10).png')
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

        this.anims.create({
            key: 'idle',
            frames: [{
                key: 'flatboy',
                frame: 'Idle (1)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (2)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (3)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (4)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (5)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (6)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (7)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (8)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (9)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (10)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (11)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (12)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (13)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (14)_1.png'
            }, {
                key: 'flatboy',
                frame: 'Idle (15)_1.png'
            }],
            frameRate: 8,
            repeat: -1
        })
        this.flatboy.play("idle")
    }
}
