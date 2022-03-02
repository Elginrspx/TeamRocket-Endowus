import Phaser from 'phaser'
import { WorldProperties, SceneEventMapping } from '../settings'

export default class Scene3 extends Phaser.Scene
{
	constructor()
	{
		super('scene-3')
	}

    init(data) {
        this.walletAmount = data.walletAmount
        this.endowusWalletAmount = data.endowusWalletAmount
        this.annualisedReturn = data.annualisedReturn
        this.volatility = data.volatility
        this.personaEvents = data.personaEvents
        this.eventNumber = this.personaEvents[0]
    }

	preload()
    {
        this.load.baseURL = "../assets/"

        // Preload Scene Background
        this.load.image('background', 'tilemaps/background.png');

        // Preload Map
        this.load.image('World Of Solaria', 'tilemaps/World Of Solaria.png')
        this.load.image('Animated', 'tilemaps/Animated.png')
        this.load.tilemapTiledJSON('scene3Tilemap', 'tilemaps/scene-3.json')
        
        // Preload Plugin for Animated Tileset
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

        // Preload Character
        this.load.atlas('player', 'characters/player.png', 'characters/player.json')
        this.load.atlas('npc-1', 'characters/npc-1.png', 'characters/npc-1.json')
        this.load.atlas('npc-2', 'characters/npc-2.png', 'characters/npc-2.json')
        this.load.atlas('npc-3', 'characters/npc-3.png', 'characters/npc-3.json')
        this.load.atlas('npc-4', 'characters/npc-4.png', 'characters/npc-4.json')
        this.load.atlas('npc-5', 'characters/npc-5.png', 'characters/npc-5.json')

        // Preload Miscellaneous Assets
        this.load.atlas('questMarker', 'images/questMarker.png', 'images/questMarker.json')
        this.load.image('wallet', 'images/money.png')
        this.load.image('endowusWallet', 'images/endowus.png')
        
        //Preload Scripts for event dialog
        this.load.json('script', 'data/script.json');

        this.Dialog = this.Dialog
        this.spacePressed = false
        this.shiftPressed = false
    }

    create()
    {
        // Get script data preloaded from script.json
        this.script = this.cache.json.get('script');

        // Scene Fade In Effect
        this.cameras.main.fadeIn(1000, 0, 0, 0)

        // Create Map
        this.map = this.make.tilemap({ key: 'scene3Tilemap', tileWidth: WorldProperties.tileWidth, tileHeight: WorldProperties.tileHeight })
        const WorldOfSolaria = this.map.addTilesetImage('World Of Solaria', 'World Of Solaria')
        const Animated = this.map.addTilesetImage('Animated', 'Animated')

        // Create Scrolling Background
        this.add.tileSprite(0, 0, WorldProperties.width, WorldProperties.height, 'background')
            .setOrigin(0)
            .setScrollFactor(0,0);

        // Layers on Tiled to be referenced here
        const MapGroundLayer = this.map.createLayer('Ground', [WorldOfSolaria, Animated])
        const MapGround2Layer = this.map.createLayer('Ground2', [WorldOfSolaria, Animated])
        const MapObjectsLayer = this.map.createLayer('Objects', [WorldOfSolaria, Animated])
        const MapObjects2Layer = this.map.createLayer('Objects2', [WorldOfSolaria, Animated])
        const MapDepthLayer = this.map.createLayer('Depth', [WorldOfSolaria, Animated])

        // Animate Tiles (Ignore the error)
        this.animatedTiles.init(this.map);

        // Create All Animations
        this.createAnimations()

        // Create Character
        const SpawnPoint = this.map.findObject('GameObjects', obj => obj.name === 'spawn-point')
        this.player = this.createCharacter(SpawnPoint.x, SpawnPoint.y, 'player')

        // Set Collision with World Bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.player.setCollideWorldBounds(true)

        // Set Bounds of the Camera, Follow Movement of Player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.cameras.main.setZoom(WorldProperties.cameraZoom, WorldProperties.cameraZoom)
        this.cameras.main.startFollow(this.player)

        this.gameObjects = this.map.createFromObjects('GameObjects', null)
        
        // Set Collision with <Objects> Layers
        MapObjectsLayer.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, MapObjectsLayer)

        // Set Layer for Depth Perception
        MapDepthLayer.setDepth(1);

        // Create Wallet
        this.wallet = this.add.image(570, 125, 'wallet')
        this.wallet.setDisplaySize(38, 38)
        this.wallet.setScrollFactor(0, 0)
        this.wallet.setDepth(100)
        this.wallet.setDataEnabled()
        this.wallet.data.set('amount', this.walletAmount)

        this.walletText = this.add.text(585, 115, '', { font: '20px Arial' })
        this.walletText.setScrollFactor(0, 0)
        this.walletText.setDepth(100)
        this.walletText.setText(this.wallet.data.get('amount'))

        // Create EndowusWallet
        this.endowusWallet = this.add.image(540, 155, 'endowusWallet')
        this.endowusWallet.setDisplaySize(80, 16)
        this.endowusWallet.setScrollFactor(0, 0)
        this.endowusWallet.setDepth(100)
        this.endowusWallet.setDataEnabled()
        this.endowusWallet.data.set('amount', this.endowusWalletAmount)

        this.endowusWalletText = this.add.text(585, 145, '', { font: '20px Arial' })
        this.endowusWalletText.setScrollFactor(0, 0)
        this.endowusWalletText.setDepth(100)
        this.endowusWalletText.setText(this.endowusWallet.data.get('amount'))

        /* For Debug Purposes, to be deleted */
        if (this.physics.config.debug) {
            const debugGraphics = this.add.graphics().setAlpha(0.7);
            MapObjectsLayer.renderDebug(debugGraphics, {
                tileColor: null,
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            })
        }

        // /* Use these commands to get exact frame names for animations, to be deleted */
        // // var frameNames = this.textures.get('player').getFrameNames();
        // // console.log(frameNames)

        this.gameObjects.forEach(object => {
            if (!this.physics.config.debug) {
                object.alpha = 0
            }

            let npc
            switch(object.name) {
                case "npc-1":
                    npc = this.createCharacter(object.x, object.y, 'npc-1')
                    npc.anims.play('npc1IdleDown', true)
                    break;
                case "npc-2":
                    npc = this.createCharacter(object.x, object.y, 'npc-2')
                    npc.anims.play('npc2IdleDown', true)
                    break;
                case "npc-3":
                    npc = this.createCharacter(object.x, object.y, 'npc-3')
                    npc.anims.play('npc3IdleDown', true)
                    break;
                case "npc-4":
                    npc = this.createCharacter(object.x, object.y, 'npc-4')
                    npc.anims.play('npc4IdleDown', true)
                    break;
                case "npc-5":
                    npc = this.createCharacter(object.x, object.y, 'npc-5')
                    npc.anims.play('npc5IdleDown', true)
                    break;
            }
        })

        // Set Event Waypoints
        this.setEventCollision()

        // Create key inputs for movement
        this.keys = this.input.keyboard.createCursorKeys();

        // Set Starting Animation
        this.player.play("idleDown")
    }

    // Update polls at 60 times a second
    update() {
        // Set Velocity to 0 whenever no key is being pressed
        this.player.body.velocity.x = 0
        this.player.body.velocity.y = 0

        // On Arrow Key Press, Move in Direction + Animation when Dialog is not visible
        if (this.keys.right.isDown && !this.Dialog.visible) {
            this.player.anims.play('runRight', true)
            this.player.body.velocity.x = WorldProperties.velocity;
            this.keyLastPressed = "right"
        } else if (this.keys.up.isDown && !this.Dialog.visible) {
            this.player.anims.play('runUp', true)
            this.player.body.velocity.y = -WorldProperties.velocity;
            this.keyLastPressed = "up"
        } else if (this.keys.left.isDown && !this.Dialog.visible) {
            this.player.anims.play('runLeft', true)
            this.player.body.velocity.x = -WorldProperties.velocity;
            this.keyLastPressed = "left"
        } else if (this.keys.down.isDown && !this.Dialog.visible) {
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
        // Code to only press key ONCE
        if (this.keys.space.isDown) {
            if (!this.spacePressed) {
                this.dialogManager(true)
                this.spacePressed = true
            }
        }

        if (this.keys.space.isUp) {
            this.spacePressed = false
        }

        if (this.keys.shift.isDown) {
            if (!this.shiftPressed) {
                this.dialogManager(false)
                this.shiftPressed = true
            }
        }

        if (this.keys.shift.isUp) {
            this.shiftPressed = false
        }
    }

    enterScene(sceneName) {
        // Camera Transitions, Start New Scene
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.time.delayedCall(1000, () => {
                this.scene.start(sceneName, {
                    walletAmount: this.wallet.data.values.amount,
                    endowusWalletAmount: this.endowusWallet.data.values.amount,
                    annualisedReturn: this.annualisedReturn,
                    volatility: this.volatility,
                    personaEvents: this.personaEvents
                })
            })
        })
    }

    walletManager(wallet, text, amount) {
        wallet.data.values.amount += amount
        text.setText(wallet.data.get('amount'))
    }

    setEventCollision() {
        var currentEvent = "event" + this.eventNumber
        var eventObject = this.gameObjects.find(event => event.name === currentEvent)
        var questMarker = this.physics.add.sprite(eventObject.x, eventObject.y - 50, 'questMarker')
        questMarker.setScale(0.20, 0.20)
        questMarker.anims.play('questMarkerAnim', true)

        this.physics.world.enable(eventObject)
        this.physics.add.overlap(this.player, eventObject, () => {
            // Disable Game Object and Quest Marker on collision
            this.physics.world.disable(eventObject)
            questMarker.destroy()

            this.playEvent(this.eventNumber)
        })
    }

    playEvent(eventNumber) {
        this.Dialog.setText(this.script["event" + eventNumber]["script"][0], 1)
        this.dialogEvent = "script", this.scriptNumber = 0
    }

    // isSpace == true means Space key was pressed. isSpace != true means Shift key was pressed.
    dialogManager(isSpace) {
        if (this.Dialog.visible && this.dialogEvent == "script") {
            if (isSpace) {
                this.scriptNumber += 1
                if (this.script["event" + this.eventNumber]["script"][this.scriptNumber] != null) {
                    this.Dialog.setText(this.script["event" + this.eventNumber]["script"][this.scriptNumber], 1)
                } else {
                    this.dialogEvent = "question"
                    this.Dialog.setText(this.script["event" + this.eventNumber]["question"], 3)
                }
            }
        } else if (this.Dialog.visible && this.dialogEvent == "question") {
            if (isSpace) {
                // Debit or Credit event to EndowusWallet
                this.walletManager(this.endowusWallet, this.endowusWalletText, this.script["event" + this.eventNumber]["amount"])
                this.Dialog.setText(this.script["event" + this.eventNumber]["response"]["space"], 1)
            }

            if (!isSpace) {
                // Debit or Credit event to Wallet
                this.walletManager(this.wallet, this.walletText, this.script["event" + this.eventNumber]["amount"])
                this.Dialog.setText(this.script["event" + this.eventNumber]["response"]["shift"], 1)
            }
            this.dialogEvent = ""
            this.time.delayedCall(5000, this.calculateEarnLoss, [this.endowusWallet, this.endowusWalletText], this)
        } else if (this.Dialog.visible && this.dialogEvent == "interest") {
            this.dialogEvent = ""
            this.Dialog.display(false);

            // Event is completed, remove from events, Set Event Number to be new event
            this.personaEvents.shift()
            this.eventNumber = this.personaEvents[0]

            if (this.eventNumber != null) {
                // Check if next Event is available in current scene, else find the scene which has it
                var eventObject = this.gameObjects.find(event => event.name === "event" + this.eventNumber)
                if (eventObject == null) {
                    for (var scene in SceneEventMapping) {
                        if (SceneEventMapping[scene].includes(this.eventNumber)) {
                            this.enterScene(scene)
                            return
                        }
                    }
                }

                // Event is available within current Scene
                this.setEventCollision()
            } else {
                console.log("Game has ended")
            }
        } else {
            this.Dialog.display(false);
        }
    }

    calculateEarnLoss(wallet, text) {
        let returnsPercentage = ((Math.random() - 0) / (1 - 0)) * (this.volatility) + (this.annualisedReturn - this.volatility)

        let currentAmount = wallet.data.values.amount
        let amount = Math.round(currentAmount * (returnsPercentage / 100))

        this.walletManager(wallet, text, amount)

        this.dialogEvent = "interest"
        this.Dialog.setText("The year has come to an end...\n Your returns this year is " + returnsPercentage.toFixed(2) + "%. Total earnings: $" + amount, 1)
    }

    createCharacter(x, y, type) {
        var character = this.physics.add.sprite(x, y, type)
        character.setScale(1.25) // Make Player slightly bigger
        character.body.setSize(10,10) // Set Hitbox Size to match Player Size
        character.body.setOffset(2,22) // Offset Hitbox to match Player

        return character
    }

    createAnimations() {
        // Create Animation for Player - Idle Right
        this.anims.create({
            key: 'idleRight',
            frames: this.anims.generateFrameNames('player', {start: 4, end: 9, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for Player - Idle Up
        this.anims.create({
            key: 'idleUp',
            frames: this.anims.generateFrameNames('player', {start: 10, end: 15, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for Player - Idle Left
        this.anims.create({
            key: 'idleLeft',
            frames: this.anims.generateFrameNames('player', {start: 16, end: 21, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for Player - Idle Down
        this.anims.create({
            key: 'idleDown',
            frames: this.anims.generateFrameNames('player', {start: 22, end: 27, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for Player - Run Right
        this.anims.create({
            key: 'runRight',
            frames: this.anims.generateFrameNames('player', {start: 28, end: 33, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for Player - Run Up
        this.anims.create({
            key: 'runUp',
            frames: this.anims.generateFrameNames('player', {start: 34, end: 39, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for Player - Run Left
        this.anims.create({
            key: 'runLeft',
            frames: this.anims.generateFrameNames('player', {start: 40, end: 45, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for Player - Run Down
        this.anims.create({
            key: 'runDown',
            frames: this.anims.generateFrameNames('player', {start: 46, end: 51, zeroPad: 0, prefix: 'player-', suffix: '.png'}),
            frameRate: 6,
            repeat: 0
        })

        // Create Animation for NPC-1 - Idle Down
        this.anims.create({
            key: 'npc1IdleDown',
            frames: this.anims.generateFrameNames('npc-1', {start: 0, end: 3, zeroPad: 0, prefix: 'npc-1-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for NPC-2 - Idle Down
        this.anims.create({
            key: 'npc2IdleDown',
            frames: this.anims.generateFrameNames('npc-2', {start: 0, end: 3, zeroPad: 0, prefix: 'npc-2-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for NPC-3 - Idle Down
        this.anims.create({
            key: 'npc3IdleDown',
            frames: this.anims.generateFrameNames('npc-3', {start: 0, end: 3, zeroPad: 0, prefix: 'npc-3-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for NPC-4 - Idle Down
        this.anims.create({
            key: 'npc4IdleDown',
            frames: this.anims.generateFrameNames('npc-4', {start: 0, end: 3, zeroPad: 0, prefix: 'npc-4-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for NPC-5 - Idle Down
        this.anims.create({
            key: 'npc5IdleDown',
            frames: this.anims.generateFrameNames('npc-5', {start: 0, end: 3, zeroPad: 0, prefix: 'npc-5-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })

        // Create Animation for Quest Marker
        this.anims.create({
            key: 'questMarkerAnim',
            frames: this.anims.generateFrameNames('questMarker', {start: 0, end: 3, zeroPad: 0, prefix: 'questMarker-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })
    }
}