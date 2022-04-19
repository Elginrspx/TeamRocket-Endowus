import Phaser from 'phaser'
import { WorldProperties, PersonaEvents, SceneEventMapping } from '../settings'
import eventsCenter from '../eventscenter'

export default class Scene0 extends Phaser.Scene
{
	constructor()
	{
		super('scene-0')
	}

    init(data) {
        //From Login Scene
        this.persona = data.persona
    }

	preload()
    {       
        this.load.baseURL = "../assets/"

        // Preload Map
        this.load.tilemapTiledJSON('scene0Tilemap', 'tilemaps/scene-0.json')

        // Preload Plugin for Animated Tileset
        this.load.scenePlugin('AnimatedTiles', 'https://raw.githubusercontent.com/nkholski/phaser-animated-tiles/master/dist/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    async create()
    {
        // Set Persona Events based on Persona Type
        this.personaEvents = PersonaEvents[this.persona]

        // Get script data preloaded from script.json
        this.script = this.cache.json.get('script');

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

        // Create All Character Animations
        this.createAnimations()
        
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

                this.add.text(object.x - 40, object.y + 20, this.script[object.name]["description"], { font: '11px Arial' , align: 'center'})

                this.physics.world.enable(object)
                this.physics.add.overlap(this.player, object, () => {
                    this.physics.world.disable(object)
                    eventsCenter.emit('selectPortfolio', object)
                })
            }
        })

        // Add Text for Risk Tolerance Area
        this.add.text(600, 515, "High Risk Tolerance Portfolios", { font: '11px Arial', color: '#8a0000', align: 'center'})
        this.add.text(615, 625, "Medium Risk Tolerance Portfolios", { font: '11px Arial', color: '#96a100', align: 'center'})
        this.add.text(430, 610, "Low Risk Tolerance Portfolios", { font: '11px Arial', color: '#00520b', align: 'center'})

        // Create key inputs for movement
        this.keys = this.input.keyboard.createCursorKeys();

        // Set Starting Animation
        this.player.play("idleDown")

        // Play Game Theme
        this.gameTheme1 = this.sound.add("gameTheme1", { loop: true });
        this.gameTheme2 = this.sound.add("gameTheme2", { loop: true, volume: 0.25 });
        this.gameTheme1.play()

        // Launch HUD scene to run in parallel
        this.scene.launch('HUD')

        // Setup Event Listeners
        eventsCenter.on('HUDReady', () => eventsCenter.emit('introduction', this.persona))
        eventsCenter.on('changeEvent', this.changeEvent , this)
        eventsCenter.on('reenableObject', this.reenableObject, this)
        eventsCenter.on('dialogVisible', (isDialogVisible) => this.dialogVisible = isDialogVisible)

        // Create Miscellaneous Variables
        this.spacePressed = false
        this.shiftPressed = false
        this.dialogVisible = false

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
    }

    changeEvent() {
        this.gameObjects.forEach(object => {
            object.destroy()
        })

        // Check and start scene which contains first event
        for (var scene in SceneEventMapping) {
            if (SceneEventMapping[scene].includes(this.personaEvents[0])) {
                let newScene = scene

                // Camera Transition
                this.cameras.main.fadeOut(1000, 0, 0, 0)
                this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    // Upon Fadeout Complete, change Game Theme, start scene containing next event
                    this.gameTheme1.stop()
                    this.gameTheme2.play()

                    this.scene.start(newScene, {
                        personaEvents: this.personaEvents
                    })
                })
            }
        }
    }

    reenableObject(object) {
        if (this.scene.isActive()) {
            // Reenable Object after 2 seconds
            this.time.delayedCall(2000, () => this.physics.world.enable(object))
        }   
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