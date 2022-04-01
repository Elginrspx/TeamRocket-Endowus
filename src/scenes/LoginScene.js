import Phaser from 'phaser'
import { WorldProperties, PersonaEvents, SceneEventMapping } from '../settings'
import eventsCenter from './../EventsCenter'

export default class LoginScene extends Phaser.Scene
{
	constructor()
	{
		super('LoginScene')
	}

    init() 
    {

    }

	preload()
    {
        this.load.html("form", "./src/form.html");
    }   

    async create()
    {
    this.usernameInput = this.add.dom(640, 360).createFromCache("form");

    this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.returnKey.on("down", event => {
        let username = this.usernameInput.getChildByName("username");
        if(username != "") {
            this.scene.start("Scene0");
            this.scene.start("MainScene", { username: username.value });
        }
    })
    }
    
    // Update polls at 60 times a second
    update() 
    {

    }

    
}