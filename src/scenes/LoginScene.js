import Phaser from 'phaser'

export default class LoginScene extends Phaser.Scene
{
	constructor()
	{
		super('LoginScene')
	}

	preload()
    {
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
        this.load.image('moreInfoBtn', 'images/moreInfoBtn.png')
        this.load.image('background', 'images/background.jpg')

        // Preload Audio
        this.load.audio("gameTheme1", "music/ambience-cave.wav");
        this.load.audio("gameTheme2", "music/adventures-in-adventureland.wav");

        // Preload Email + Input Form
        this.load.html("form", "form/form.html")
        this.load.html("amountInput", "form/amountInput.html");

        // Preload Scripts for event dialog
        this.load.json('script', 'data/script.json');
    }   

    async create()
    {
        //Set Background Image
        this.add.image(400, 320, 'background')
    
        //Load Username input form
        this.usernameInput = this.add.dom(400, 300).createFromCache("form").setPerspective(800)

        //Create ENTER KEY
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

        //Error Msg Upon invalid email
        this.errorMsg = this.add.text(230, 230, '', { font: '22px Arial', color: 'red' }).setText("Please enter a valid email address.")
        this.errorMsg.setVisible(false)

        //Input Validation
        this.returnKey.on("down", event => {
            let username = this.usernameInput.getChildByName("username");
            for (let i = 0; i < this.dataJSON.length; i++) {

                if (this.dataJSON[i]["email"] == username.value) {
                    this.persona = this.dataJSON[i]["lifestage"]
                    this.scene.start("scene-0", {
                        persona : this.persona
                    })
                    break
                }

                else if (this.dataJSON[i]["email"] != username.value) {
                    this.errorMsg.setVisible(true)
                    document.getElementById('user-input').value = ''
                    break
                }
              }
        }) 

        //Calling Game 1 Database from Mongo DB
        try {
            this.dataJSON = await fetch("http://localhost:3000/get")
                .then(response => response.json());
        } catch (e) {
            console.error(e);
        }

    }
}