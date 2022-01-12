import Phaser from 'phaser'

const WorldProperties = {
    velocity: 6
}
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

        // Create Character
        this.flatboy = this.add.sprite(300, 300, 'flatboy')
        this.flatboy.play("idle")

        // Create key inputs
        this.keys = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.keys.left.isDown) {
            this.flatboy.anims.play('run', true)
            this.flatboy.flipX = true
            this.flatboy.x -= WorldProperties.velocity;
        } else if (this.keys.right.isDown) {
            this.flatboy.anims.play('run', true)
            this.flatboy.flipX = false
            this.flatboy.x += WorldProperties.velocity;
        } else if (this.keys.up.isDown) {
            this.flatboy.anims.play('run', true)
            this.flatboy.y -= WorldProperties.velocity;
        } else if (this.keys.down.isDown) {
            this.flatboy.anims.play('run', true)
            this.flatboy.y += WorldProperties.velocity;
        } else {
            this.flatboy.anims.play('idle', true)
        }
    }
}
