import Phaser from 'phaser'

const WorldProperties = {
    velocity: 6
}
export default class Scene1 extends Phaser.Scene
{
	// constructor()
	// {
	// 	super('scene-1')
	// }

	preload()
    {
        this.load.baseURL = "../assets/"

        // Preload Map
        this.load.image('hyptosis_tile-art-batch-1', 'tilemaps/hyptosis_tile-art-batch-1.png')
        // this.load.image('hyptosis_tile-art-batch-2', 'tilemaps/hyptosis_tile-art-batch-2.png')

        this.load.tilemapTiledJSON('tilemap', 'tilemaps/level-1.json')

        // Preload Character
        this.load.atlas('flatboy', 'characters/flatboy/spritesheet.png', 'characters/flatboy/spritesheet.json')
    }

    create()
    {
        // Create Map
        const map = this.make.tilemap({ key: 'tilemap', tileWidth: 16, tileHeight: 16 })
        const hyptosisTileset1 = map.addTilesetImage('hyptosis_tile-art-batch-1', 'hyptosis_tile-art-batch-1')
        // var hyptosisTileset2 = map.addTilesetImage('hyptosis_tile-art-batch-2', 'hyptosis_tile-art-batch-2')
        
        const mapGroundLayer = map.createLayer('Ground', hyptosisTileset1)
        const mapObjectsLayer = map.createLayer('Objects', hyptosisTileset1)
        // map.createLayer('Ground', [hyptosisTileset1, hyptosisTileset2])
        // map.createLayer('Objects', [hyptosisTileset1, hyptosisTileset2])

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true, true, true, true)

        // Create Character
        this.player = this.physics.add.sprite(300, 300, 'flatboy')
        // this.player.play("idle")

        this.player.body.setCollideWorldBounds(true)
        this.player.body.onWorldBounds = true
        this.physics.world.on('worldbounds', function(body){
            console.log('hello from the edge of the world', body);
        },this);

        // Create key inputs
        this.keys = this.input.keyboard.createCursorKeys();

        mapObjectsLayer.setCollisionByProperty({ collides: true })
        // mapObjectsLayer.setCollisionBetween(1,5000)
        this.physics.add.collider(this.player, mapObjectsLayer)

        const debugGraphics = this.add.graphics().setAlpha(0.7);
        mapObjectsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        })
        
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
    }

    update() {
        if (this.keys.left.isDown) {
            this.player.anims.play('run', true)
            this.player.flipX = true
            this.player.x -= WorldProperties.velocity;
        } else if (this.keys.right.isDown) {
            this.player.anims.play('run', true)
            this.player.flipX = false
            this.player.x += WorldProperties.velocity;
        } else if (this.keys.up.isDown) {
            this.player.anims.play('run', true)
            this.player.y -= WorldProperties.velocity;
        } else if (this.keys.down.isDown) {
            this.player.anims.play('run', true)
            this.player.y += WorldProperties.velocity;
        } else {
            this.player.anims.play('idle', true)
        }
    }
}
