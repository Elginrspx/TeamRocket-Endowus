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

        this.load.baseURL = "../assets/"

        // Preload Map
        this.load.image('World Of Solaria', 'tilemaps/World Of Solaria.png')
        this.load.image('Animated', 'tilemaps/Animated.png')
        this.load.tilemapTiledJSON('scene0Tilemap', 'tilemaps/scene-0.json')
        this.load.tilemapTiledJSON('scene1Tilemap', 'tilemaps/scene-1.json')
        this.load.tilemapTiledJSON('scene2Tilemap', 'tilemaps/scene-2.json')
        this.load.tilemapTiledJSON('scene3Tilemap', 'tilemaps/scene-3.json')
        
        // Preload Plugin for Animated Tileset
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

        // Preload Character and NPCs
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
        this.load.image('recurringInvestment', 'images/recurringInvestment.png')

        // Preload Audio
        this.load.audio("gameTheme1", "music/ambience-cave.wav");
        this.load.audio("gameTheme2", "music/adventures-in-adventureland.wav");

        // Preload Input Form
        this.load.html("amountInput", "form/amountInput.html");

        // Preload Scripts for event dialog
        this.load.json('script', 'data/script.json');

        // Preload Miscellaneous
        this.Dialog = this.Dialog
        this.spacePressed = false
        this.shiftPressed = false
    }

    create()
    {
        // Scene Fade In Effect
        this.cameras.main.fadeIn(1000, 0, 0, 0)

        // Create Map
        this.map = this.make.tilemap({ key: 'scene0Tilemap', tileWidth: WorldProperties.tileWidth, tileHeight: WorldProperties.tileHeight })
        const WorldOfSolaria = this.map.addTilesetImage('World Of Solaria', 'World Of Solaria')
        const Animated = this.map.addTilesetImage('Animated', 'Animated')

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

        // Set Collision with <Objects> Layers
        MapObjectsLayer.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, MapObjectsLayer)

        // Set Layer for Depth Perception
        MapDepthLayer.setDepth(1);

        // Set Bounds of the Camera, Follow Movement of Player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.cameras.main.setZoom(WorldProperties.cameraZoom, WorldProperties.cameraZoom)
        this.cameras.main.startFollow(this.player)

        // Amount Input Form
        this.amountInput = this.add.dom(350, 735).createFromCache("amountInput");
        this.amountInput.setDepth(1020)
        this.amountInput.setVisible(false)

        // Get script data preloaded from script.json
        this.script = this.cache.json.get('script');

        this.gameObjects = this.map.createFromObjects('GameObjects', null)

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

        // Run Introductory Script
        this.introductionEvent()

        // Play Game Theme
        this.gameTheme1 = this.sound.add("gameTheme1", { loop: true });
        this.gameTheme2 = this.sound.add("gameTheme2", { loop: true });
        this.gameTheme1.play()

        /* For Debug Purposes */
        if (this.physics.config.debug) {
            const debugGraphics = this.add.graphics().setAlpha(0.7);
            MapObjectsLayer.renderDebug(debugGraphics, {
                tileColor: null,
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            })
        }
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
        // Key: SPACE
        if (this.keys.space.isDown) {
            if (!this.spacePressed) {
                this.dialogManager(true)
                this.spacePressed = true
            }
        }
        if (this.keys.space.isUp) {
            this.spacePressed = false
        }

        // Key: SHIFT
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
                // this.gameTheme2.play()
                this.scene.start(sceneName, {
                    walletAmount: this.wallet.data.values.amount,
                    endowusWalletAmount: this.endowusWallet.data.values.amount,
                    recurringInvestmentAmount: this.recurringInvestment.data.values.amount,
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
        this.dialogEvent = "selectPortfolio", this.scriptNumber = 0, this.currentObject = object
    }

    introductionEvent() {
        this.Dialog.setText(this.script["introduction"]["script"][0], 1)
        this.dialogEvent = "introduction", this.scriptNumber = 0
    }

    dialogManager(isSpace) {
        if (this.Dialog.visible) {
            if (this.dialogEvent == "introduction") {
                if (isSpace) {
                    this.scriptNumber += 1
                    if (this.script["introduction"]["script"][this.scriptNumber] != null) {
                        this.Dialog.setText(this.script["introduction"]["script"][this.scriptNumber], 1)
                    } else {
                        this.amountInput.setVisible(true)
                        this.Dialog.setText("Set the total amount of cash you have on hand")
                        this.dialogEvent = "setWallet"
                    }
                }
            } else if (this.dialogEvent == "setWallet") {
                if (isSpace) {
                    var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                    if (isNaN(amount) || amount < 1000) {
                        this.Dialog.setText("Please set an amount above $1,000!")
                    } else {
                        // Create Wallet
                        this.wallet = this.add.image(570, 130, 'wallet')
                            .setDisplaySize(28, 28)
                            .setScrollFactor(0, 0)
                            .setDepth(100)
                            .setDataEnabled()
                        this.wallet.data.set('amount', amount)

                        this.walletText = this.add.text(585, 120, '', { font: '16px Arial' })
                            .setScrollFactor(0, 0)
                            .setDepth(100)
                            .setText(this.wallet.data.get('amount'))

                        this.Dialog.setText("Out of the total amount of cash you have on hand, how much do you plan to set aside in your investments?", 1)
                        this.dialogEvent = "setEndowusWallet"
                        this.amountInput.getChildByName("amountInput").value = ""
                    }
                }
            } else if (this.dialogEvent == "setEndowusWallet") {
                if (isSpace) {
                    var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                    if (isNaN(amount)) {
                        amount = 0
                    }

                    if (amount > this.wallet.data.values.amount) {
                        this.Dialog.setText("You don't have that much cash on hand!", 1)
                    } else {
                        // Create EndowusWallet
                        this.endowusWallet = this.add.image(540, 150, 'endowusWallet')
                            .setDisplaySize(70, 14)
                            .setScrollFactor(0, 0)
                            .setDepth(100)
                            .setDataEnabled()
                        this.endowusWallet.data.set('amount', amount)

                        this.endowusWalletText = this.add.text(585, 142, '', { font: '16px Arial' })
                            .setScrollFactor(0, 0)
                            .setDepth(100)
                            .setText(this.endowusWallet.data.get('amount'))

                        // Remove stated amount from Cash Wallet
                        this.walletManager(this.wallet, this.walletText, -amount)

                        this.Dialog.setText("Make Investing a habit by setting up Recurring Investments! At the end of every game event, the amount will be automatically transferred from your cash wallet to your investments!", 1)
                        this.dialogEvent = "setRecurring"
                        this.amountInput.getChildByName("amountInput").value = ""
                    }
                }
            } else if (this.dialogEvent == "setRecurring") {
                if (isSpace) {
                    var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                    if (isNaN(amount)) {
                        amount = 0
                    }

                    if (amount > this.wallet.data.values.amount) {
                        this.Dialog.setText("You don't have that much cash on hand!", 1)
                    } else {
                        // Create Recurring Investments
                        this.recurringInvestment = this.add.image(165, 130, 'recurringInvestment')
                            .setDisplaySize(22, 22)
                            .setScrollFactor(0, 0)
                            .setDepth(100)
                            .setDataEnabled()
                            .setInteractive( { useHandCursor: true } )
                            .on('pointerdown', () => { this.setRecurringInvestment() })
                        this.recurringInvestment.data.set('amount', amount)

                        this.recurringInvestmentText = this.add.text(188, 120, '', { font: '16px Arial' })
                            .setScrollFactor(0, 0)
                            .setDepth(100)
                            .setText(this.recurringInvestment.data.get('amount'))

                        this.amountInput.setVisible(false)
                        this.Dialog.setText("To adjust Recurring Investments, click the Icon on the top-left!", 1)
                        this.dialogEvent = ""
                        this.amountInput.getChildByName("amountInput").value = ""
                    }
                }
            } else if (this.dialogEvent == "changeRecurring") {
                if (isSpace) {
                    var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                    if (isNaN(amount)) {
                        amount = 0
                    }

                    if (amount > this.wallet.data.values.amount) {
                        this.Dialog.setText("You don't have that much cash on hand!", 1)
                    } else {
                        this.recurringInvestment.data.set('amount', amount)
                        this.recurringInvestmentText.setText(this.recurringInvestment.data.get('amount'))

                        this.amountInput.setVisible(false)
                        this.Dialog.display(false);
                        this.dialogEvent = ""
                        this.amountInput.getChildByName("amountInput").value = ""
                    }
                }
            } else if (this.dialogEvent == "selectPortfolio") {
                if (isSpace) {
                    this.scriptNumber += 1
                    if (this.script[this.currentObject.name]["script"][this.scriptNumber] != null) {
                        this.Dialog.setText(this.script[this.currentObject.name]["script"][this.scriptNumber], 1)
                    } else {
                        this.dialogEvent = "selectPortfolioQuestion"
                        this.Dialog.setText("Do you want to select this portfolio?", 2)
                    }
                }
            } else if (this.dialogEvent == "selectPortfolioQuestion") {
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
                } else {
                    this.time.delayedCall(2000, this.reenableEvent, [this.currentObject], this)
                    this.Dialog.display(false);
                }
            } else {
                if (isSpace) {
                    this.Dialog.display(false);
                }
            }
        }
    }

    setRecurringInvestment() {
        this.amountInput.setVisible(true)
        this.Dialog.setText("Set the new Recurring Investment Amount!", 1)
        this.dialogEvent = "changeRecurring"
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