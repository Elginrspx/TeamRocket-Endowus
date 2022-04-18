import Phaser from 'phaser'
import { WorldProperties, SceneEventMapping } from '../settings'
import eventsCenter from '../eventscenter'



export default class Scene1 extends Phaser.Scene
{
	constructor()
	{
		super('scene-1')
	}

    init(data) {
        this.personaEvents = data.personaEvents
    }

	preload()
    {
        // Preload Plugin for Animated Tileset
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    async create() {
        // Scene Fade In Effect
        this.cameras.main.fadeIn(1000, 0, 0, 0)

        // Create Map
        this.map = this.make.tilemap({ key: 'scene1Tilemap', tileWidth: WorldProperties.tileWidth, tileHeight: WorldProperties.tileHeight })
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

        // Create All Animations
        this.createAnimations()

        this.gameObjects = this.map.createFromObjects('GameObjects', null)

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

        // Create key inputs for movement
        this.keys = this.input.keyboard.createCursorKeys();

        // Set Starting Animation
        this.player.play("idleDown")

        // Set Event Waypoints
        this.setEventCollision()

        // Setup Event Listeners
        eventsCenter.removeListener('changeEvent')
        eventsCenter.on('changeEvent', this.changeEvent, this)
        eventsCenter.on('dialogVisible', (isDialogVisible) => this.dialogVisible = isDialogVisible)

        // Create Miscellaneous Variables
        this.spacePressed = false
        this.shiftPressed = false
        this.upPressed = false
        this.downPressed = false
        this.dialogVisible = false

        /* For Debug Purposes, to be deleted */
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
        if (this.keys.right.isDown && !this.dialogVisible) {
            this.player.anims.play('runRight', true)
            this.player.body.velocity.x = WorldProperties.velocity;
            this.keyLastPressed = "right"
        } else if (this.keys.up.isDown && !this.dialogVisible) {
            this.player.anims.play('runUp', true)
            this.player.body.velocity.y = -WorldProperties.velocity;
            this.keyLastPressed = "up"
        } else if (this.keys.left.isDown && !this.dialogVisible) {
            this.player.anims.play('runLeft', true)
            this.player.body.velocity.x = -WorldProperties.velocity;
            this.keyLastPressed = "left"
        } else if (this.keys.down.isDown && !this.dialogVisible) {
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
                eventsCenter.emit('dialogManager', true)
                this.spacePressed = true
            }
        }
        if (this.keys.space.isUp) {
            this.spacePressed = false
        }

        // Key: SHIFT
        if (this.keys.shift.isDown) {
            if (!this.shiftPressed) {
                eventsCenter.emit('dialogManager', false)
                this.shiftPressed = true
            }
        }
        if (this.keys.shift.isUp) {
            this.shiftPressed = false
        }

        // Key: UP
        if (this.keys.up.isDown) {
            if (!this.upPressed) {
                eventsCenter.emit('walletPercentageManager', true)
                this.upPressed = true
            }
        }
        if (this.keys.up.isUp) {
            this.upPressed = false
        }

        // Key: DOWN
        if (this.keys.down.isDown) {
            if (!this.downPressed) {
                eventsCenter.emit('walletPercentageManager', false)
                this.downPressed = true
            }
        }
        if (this.keys.down.isUp) {
            this.downPressed = false
        }
    }

    changeEvent() {
        // Event is completed, remove from events
        this.personaEvents.shift()

        // Check if Next Event exists
        if (this.personaEvents[0] != null) {
            // Check if next Event is available in current scene
            var eventObject = this.gameObjects.find(event => event.name === "event" + this.personaEvents[0])

            // Event does not exist within current scene, find and start scene that contains event
            if (eventObject == null) {
                for (var scene in SceneEventMapping) {
                    let newScene = scene

                    if (SceneEventMapping[scene].includes(this.personaEvents[0])) {
                        // Camera Transition
                        this.cameras.main.fadeOut(1000, 0, 0, 0)
                        this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                            this.scene.start(newScene, {
                                personaEvents: this.personaEvents
                            })
                        })
                    }
                }
            // Event is within current scene
            } else {
                this.setEventCollision()
            }
        // Next Event does not exist == End of Game
        } else {
            this.time.delayedCall(3000, () => eventsCenter.emit('gameOver'))
        }
    }

    setEventCollision() {
        var eventObject = this.gameObjects.find(event => event.name === "event" + this.personaEvents[0])
        var questMarker = this.physics.add.sprite(eventObject.x, eventObject.y - 50, 'questMarker')
            .setScale(0.20, 0.20)
            .setDepth(2)
        questMarker.anims.play('questMarkerAnim', true)

        this.physics.world.enable(eventObject)
        this.physics.add.overlap(this.player, eventObject, () => {
            // Disable Game Object and Quest Marker on collision
            this.physics.world.disable(eventObject)
            questMarker.destroy()

            eventsCenter.emit('playEvent', this.personaEvents[0])
        })
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