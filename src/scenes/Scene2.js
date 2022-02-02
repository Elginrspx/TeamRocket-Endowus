import Phaser from 'phaser'
import { WorldProperties } from '../worldProperties'

export default class Scene2 extends Phaser.Scene
{
	constructor()
	{
		super('scene-2')
        // Can call from backend to update the wallet amount here
        this.walletAmount = 50
        this.endowusWalletAmount = 600
	}

	preload()
    {
        this.load.baseURL = "../assets/"

        // Preload Scene Background
        this.load.image('background', 'tilemaps/background.png');

        // Preload Map
        this.load.image('World Of Solaria', 'tilemaps/World Of Solaria.png')
        this.load.tilemapTiledJSON('scene2Tilemap', 'tilemaps/scene-2.json')

        // Preload Character
        this.load.atlas('player', 'characters/player.png', 'characters/player.json')

        // Preload Miscellaneous Assets
        this.load.image('wallet', 'images/money.png')
    }

    create()
    {
        // Scene Fade In Effect
        this.cameras.main.fadeIn(1000, 0, 0, 0)

        // Create Map
        var map = this.make.tilemap({ key: 'scene2Tilemap', tileWidth: WorldProperties.tileWidth, tileHeight: WorldProperties.tileHeight })
        const WorldOfSolaria = map.addTilesetImage('World Of Solaria', 'World Of Solaria')

        // Create Scrolling Background
        this.add.tileSprite(0, 0, WorldProperties.width, WorldProperties.height, 'background')
            .setOrigin(0)
            .setScrollFactor(0,0);

        // Layers on Tiled to be referenced here
        const MapGroundLayer = map.createLayer('Ground', [WorldOfSolaria])
        const MapGround2Layer = map.createLayer('Ground2', [WorldOfSolaria])
        const MapObjectsLayer = map.createLayer('Objects', [WorldOfSolaria])
        const MapDepthLayer = map.createLayer('Depth', [WorldOfSolaria])

        // Create Character
        const SpawnPoint = map.findObject('GameObjects', obj => obj.name === 'spawn-point')
        this.player = this.physics.add.sprite(SpawnPoint.x, SpawnPoint.y, 'player')
        this.player.setScale(1.25) // Make Player slightly bigger
        this.player.body.setSize(10,10) // Set Hitbox Size to match Player Size
        this.player.body.setOffset(2,22) // Offset Hitbox to match Player

        // Set Collision with World Bounds
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.player.setCollideWorldBounds(true)

        // Set Bounds of the Camera, Follow Movement of Player
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.setZoom(WorldProperties.cameraZoom, WorldProperties.cameraZoom)
        this.cameras.main.startFollow(this.player)

        const GameObjects = map.createFromObjects('GameObjects', null)
        
        // Set Collision with <Objects> Layers
        MapObjectsLayer.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, MapObjectsLayer)

        // Set Layer for Depth Perception
        MapDepthLayer.setDepth(1);

        // Create Wallet
        this.wallet = this.add.image(700, 35, 'wallet')
        this.wallet.setDisplaySize(48, 48)
        this.wallet.setScrollFactor(0, 0)
        this.wallet.setDepth(10)
        this.wallet.setDataEnabled()
        this.wallet.data.set('amount', this.walletAmount)

        this.walletText = this.add.text(720, 20, '', { font: '24px Arial' })
        this.walletText.setScrollFactor(0, 0)
        this.walletText.setDepth(10)
        this.walletText.setText(this.wallet.data.get('amount'))

        // Create EndowusWallet
        this.endowusWallet = this.add.image(700, 75, 'wallet')
        this.endowusWallet.setDisplaySize(48, 48)
        this.endowusWallet.setScrollFactor(0, 0)
        this.endowusWallet.setDepth(10)
        this.endowusWallet.setDataEnabled()
        this.endowusWallet.data.set('amount', this.endowusWalletAmount)

        this.endowusWalletText = this.add.text(720, 60, '', { font: '24px Arial' })
        this.endowusWalletText.setScrollFactor(0, 0)
        this.endowusWalletText.setDepth(10)
        this.endowusWalletText.setText(this.endowusWallet.data.get('amount'))

        /* For Debug Purposes, to be deleted */
        const debugGraphics = this.add.graphics().setAlpha(0.7);
        MapObjectsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        })

        // /* Use these commands to get exact frame names for animations, to be deleted */
        // // var frameNames = this.textures.get('player').getFrameNames();
        // // console.log(frameNames)

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

        // Create key inputs for movement
        this.keys = this.input.keyboard.createCursorKeys();

        // Set Starting Animation
        this.player.play("idleDown")

        GameObjects.forEach(object => {
            switch(object.name) {
                case "scene-1":
                    this.physics.world.enable(object)
                    this.physics.add.overlap(this.player, object, () => {
                        this.enterPortal(object.name)
                    })
                    break;
                case "npc-1":
                    let npc = this.physics.add.sprite(object.x, object.y, 'player')
                    npc.anims.play('idleDown', true)
                    break;
            }
        })
    }

    // Update polls at 60 times a second
    update() {
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

    enterPortal(sceneName) {
        // Destroy all colliders to prevent repeated calls
        this.physics.world.colliders.destroy()

        // Camera Transitions, Start New Scene
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start(sceneName)
        })
    }

    walletManager(wallet, text, amount) {
        wallet.data.values.amount += amount
        text.setText(wallet.data.get('amount'))
    }
}