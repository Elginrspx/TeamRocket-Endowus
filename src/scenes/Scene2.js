import Phaser from 'phaser'
import { WorldProperties } from '../worldProperties'

export default class Scene2 extends Phaser.Scene
{
	constructor()
	{
		super('scene-2')
	}

	preload()
    {
        this.load.baseURL = "../assets/"

        // Preload Map
        this.load.image('hyptosis_tile-art-batch-1', 'tilemaps/hyptosis_tile-art-batch-1.png')
        this.load.image('hyptosis_tile-art-batch-2', 'tilemaps/hyptosis_tile-art-batch-2.png')
        this.load.tilemapTiledJSON('scene2Tilemap', 'tilemaps/scene-2.json')

        // Preload Character
        this.load.atlas('player', 'characters/player.png', 'characters/player.json')

        this.load.image('background', 'tilemaps/background.png');
    }

    create()
    {
        // Create Map
        this.map = this.make.tilemap({ key: 'scene2Tilemap', tileWidth: WorldProperties.tileWidth, tileHeight: WorldProperties.tileHeight })
        const hyptosisTileset1 = this.map.addTilesetImage('hyptosis_tile-art-batch-1', 'hyptosis_tile-art-batch-1')
        const hyptosisTileset2 = this.map.addTilesetImage('hyptosis_tile-art-batch-2', 'hyptosis_tile-art-batch-2')

        // Create Scrolling Background
        this.background = this.add.tileSprite(0, 0, WorldProperties.width, WorldProperties.height, 'background')
            .setOrigin(0)
            .setScrollFactor(0,0);

        // Layers on Tiled to be referenced here
        const mapGroundLayer = this.map.createLayer('Ground', [hyptosisTileset1, hyptosisTileset2])
        const mapObjectsLayer = this.map.createLayer('Objects', [hyptosisTileset1, hyptosisTileset2])

        // Create Character
        this.player = this.physics.add.sprite(300, 300, 'player')
        this.player.setScale(1.25) // Make Player slightly bigger
        this.player.body.setSize(16, 6) // Set Hitbox Size to match Player Size
        this.player.body.setOffset(0,8) // Offset Hitbox to match Player

        // Set Collision with World Bounds
        // this.physics.world.setBounds(0, 0, this.map.widthInPixels*2, this.map.heightInPixels*2)
        // this.player.body.setCollideWorldBounds(true)

        // Set Collision with <Objects> Layers
        mapObjectsLayer.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, mapObjectsLayer)

        /* For Debug Purposes, to be deleted */
        const debugGraphics = this.add.graphics().setAlpha(0.7);
        mapObjectsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        })

        /* Use these commands to get exact frame names for animations, to be deleted */
        // var frameNames = this.textures.get('player').getFrameNames();
        // console.log(frameNames)

        // Create Animation for - Idle Right
        this.anims.create({
            key: 'idleRight',
            frames: this.anims.generateFrameNames('player', {start: 4, end: 9, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for - Idle Up
        this.anims.create({
            key: 'idleUp',
            frames: this.anims.generateFrameNames('player', {start: 10, end: 15, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for - Idle Left
        this.anims.create({
            key: 'idleLeft',
            frames: this.anims.generateFrameNames('player', {start: 16, end: 21, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for - Idle Down
        this.anims.create({
            key: 'idleDown',
            frames: this.anims.generateFrameNames('player', {start: 22, end: 27, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for - Run Right
        this.anims.create({
            key: 'runRight',
            frames: this.anims.generateFrameNames('player', {start: 28, end: 33, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for - Run Up
        this.anims.create({
            key: 'runUp',
            frames: this.anims.generateFrameNames('player', {start: 34, end: 39, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for - Run Left
        this.anims.create({
            key: 'runLeft',
            frames: this.anims.generateFrameNames('player', {start: 40, end: 45, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for - Run Down
        this.anims.create({
            key: 'runDown',
            frames: this.anims.generateFrameNames('player', {start: 46, end: 51, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Set Bounds of the Camera, Follow Movement of Player
        this.cameras.main.startFollow(this.player)

        // Create key inputs for movement
        this.keys = this.input.keyboard.createCursorKeys();

        // Set Starting Animation
        this.player.play("idleDown")
    }

    // Update polls at 60 times a second
    update() {
        this.cameras.main.setBounds(this.player.x - WorldProperties.width/2, this.player.y - WorldProperties.height/2, WorldProperties.width, WorldProperties.height)
        
        // Set Velocity to 0 whenever no key is being pressed
        this.player.body.velocity.x = 0
        this.player.body.velocity.y = 0

        // On Arrow Key Press, Move in Direction + Animation
        if (this.keys.right.isDown) {
            this.player.anims.play('runRight', true)
            this.player.body.velocity.x = WorldProperties.velocity;
            this.keyLastPressed = "right"
        } else if (this.keys.up.isDown) {
            this.player.anims.play('runUp', true)
            this.player.body.velocity.y = -WorldProperties.velocity;
            this.keyLastPressed = "up"
        } else if (this.keys.left.isDown) {
            this.player.anims.play('runLeft', true)
            this.player.body.velocity.x = -WorldProperties.velocity;
            this.keyLastPressed = "left"
        } else if (this.keys.down.isDown) {
            this.player.anims.play('runDown', true)
            this.player.body.velocity.y = WorldProperties.velocity;
            this.keyLastPressed = "down"
        } else {
            // Animation to play during idle
            switch(this.keyLastPressed) {
                case "right":
                    this.player.anims.play('idleRight', true)
                    break;
                case "up":
                    this.player.anims.play('idleUp', true)
                    break;
                case "left":
                    this.player.anims.play('idleLeft', true)
                    break;
                case "down":
                    this.player.anims.play('idleDown', true)
                    break;
            }
        }
    }
}