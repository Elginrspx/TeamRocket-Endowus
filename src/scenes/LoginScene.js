import Phaser from 'phaser'
import { WorldProperties, PersonaEvents, SceneEventMapping } from '../settings'
import eventsCenter from './../EventsCenter'
import Scene0 from './Scene0';

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
        this.load.baseURL = "../assets/"
        // this.load.html("form", "src/form.html");
        this.load.html("form", "form/form.html");
    }   

    async create()
    {
    
        this.usernameInput = this.add.dom(640, 360).createFromCache("form").setPerspective(800)

        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.returnKey.on("down", event => {
            //let username = this.usernameInput.getChildByName("username");
            //if(username.value != "") {
                this.scene.start("Scene0", { });
                //console.log("press enter")
                //username: username.value 
            //}
        }) 

        //Calling Player's Persona from Game 1 Mongo DB
        try {
            this.playerJSON = await fetch("http://localhost:3000/get")
                .then(response => response.json());
        this.playerPersona = this.playerJSON[0]["lifestage"]
        } catch (e) {
            console.error(e);
        }

    }
    
    // Update polls at 60 times a second
    update() 
    {

    }

    
}