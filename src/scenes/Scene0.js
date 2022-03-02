import Phaser from 'phaser'
import { WorldProperties, PersonaEvents, SceneEventMapping } from '../settings'

export default class Scene0 extends Phaser.Scene
{
	constructor()
	{
		super('scene-0')
	}

	preload()
    {
        // From DB
        this.persona = "student"

        this.walletAmount = 0
        this.endowusWalletAmount = 0

        this.load.baseURL = "../assets/"

        // Preload Scene Background
        this.load.image('background', 'tilemaps/background.png');

        // Preload Map
        this.load.image('World Of Solaria', 'tilemaps/World Of Solaria.png')
        this.load.image('Animated', 'tilemaps/Animated.png')
        this.load.tilemapTiledJSON('scene0Tilemap', 'tilemaps/scene-0.json')
        
        // Preload Plugin for Animated Tileset
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

        // Preload Character
        this.load.atlas('player', 'characters/player.png', 'characters/player.json')

        // Preload Miscellaneous Assets
        this.load.atlas('questMarker', 'images/questMarker.png', 'images/questMarker.json')
        this.load.image('wallet', 'images/money.png')
        this.load.image('endowusWallet', 'images/endowus.png')

        // Preload Audio
        this.load.audio("gameTheme1", "music/ambience-cave.wav");
        this.load.audio("gameTheme2", "music/adventures-in-adventureland.wav");

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
        this.map = this.make.tilemap({ key: 'scene0Tilemap', tileWidth: WorldProperties.tileWidth, tileHeight: WorldProperties.tileHeight })
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

            // For every object that is not spawn point
            if (object.name != "spawn-point") {
                object.y += 35

                // Add Visible Collision Rectangle
                var rectangle = this.add.rectangle(object.x, object.y, object.width, object.height)
                rectangle.setStrokeStyle(2, 0xefc53f, 0.5)

                // Add Quest Marker
                var questMarker = this.physics.add.sprite(object.x, object.y - 50, 'questMarker')
                questMarker.setScale(0.10, 0.10)
                questMarker.anims.play('questMarkerAnim', true)

                switch(object.name) {
                    case "equities100":
                        this.add.text(object.x - 35, object.y + 20, '100% Equities', { font: '11px Arial' })
                        break;
                    case "equities80":
                        this.add.text(object.x - 45, object.y + 20, '    80% Equities\n20% Fixed Income', { font: '11px Arial' })
                        break;
                    case "equities60":
                        this.add.text(object.x - 45, object.y + 20, '    60% Equities\n40% Fixed Income', { font: '11px Arial' })
                        break;
                    case "equities40":
                        this.add.text(object.x - 45, object.y + 20, '    40% Equities\n60% Fixed Income', { font: '11px Arial' })
                        break;
                    case "equities20":
                        this.add.text(object.x - 45, object.y + 20, '    20% Equities\n80% Fixed Income', { font: '11px Arial' })
                        break;
                    case "equities0":
                        this.add.text(object.x - 55, object.y + 20, '    100% Fixed Income', { font: '11px Arial' })
                        break;
                }

                this.physics.world.enable(object)
                this.physics.add.overlap(this.player, object, () => {
                    this.playEvent(object)
                })
            }
        })

        this.walletManager(this.wallet, this.walletText, 100000)
        this.walletManager(this.endowusWallet, this.endowusWalletText, 100000)

        switch(this.persona) {
            case "student":
                this.personaEvents = PersonaEvents.student
                break
            case "familyMan":
                this.personaEvents = PersonaEvents.familyMan
                break
        }

        // Create key inputs for movement
        this.keys = this.input.keyboard.createCursorKeys();

        // Set Starting Animation
        this.player.play("idleDown")

        // Play Game Theme
        this.gameTheme1 = this.sound.add("gameTheme1", { loop: true });
        this.gameTheme2 = this.sound.add("gameTheme2", { loop: true });
        this.gameTheme1.play()
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
        this.gameTheme1.stop()
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.time.delayedCall(1000, () => {
                this.gameTheme2.play()
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

    playEvent(object) {
        this.physics.world.disable(object)
        this.Dialog.setText(this.script[object.name]["script"][0], 1)
        this.currentObject = object, this.isScript = true, this.scriptNumber = 0
    }

    dialogManager(isSpace) {
        if (this.Dialog.visible && this.isScript) {
            if (isSpace) {
                this.scriptNumber += 1
                if (this.script[this.currentObject.name]["script"][this.scriptNumber] != null) {
                    this.Dialog.setText(this.script[this.currentObject.name]["script"][this.scriptNumber], 1)
                } else {
                    this.isScript = false
                    this.Dialog.setText("Do you want to select this portfolio?", 2)
                }
                return
            }
        }

        if (this.Dialog.visible && !this.isScript) {
            if (isSpace) {
                this.annualisedReturn = this.script[this.currentObject.name]["annualisedReturn"]
                this.volatility = this.script[this.currentObject.name]["volatility"]
                this.Dialog.display(false);

                this.eventNumber = this.personaEvents[0]

                // Check and start scene which contains first event
                for (var scene in SceneEventMapping) {
                    if (SceneEventMapping[scene].includes(this.eventNumber)) {
                        this.enterScene(scene)
                        return
                    }
                }
            }

            if (!isSpace) {
                this.time.delayedCall(2000, this.reenableEvent, [this.currentObject], this)
                this.Dialog.display(false);
            }
        }
    }

    reenableEvent(object) {
        this.physics.world.enable(object)
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

        // Create Animation for Quest Marker
        this.anims.create({
            key: 'questMarkerAnim',
            frames: this.anims.generateFrameNames('questMarker', {start: 0, end: 3, zeroPad: 0, prefix: 'questMarker-', suffix: '.png'}),
            frameRate: 6,
            repeat: -1
        })
    }
}