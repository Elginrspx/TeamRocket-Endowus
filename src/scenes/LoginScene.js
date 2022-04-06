import Phaser from 'phaser'
import { WorldProperties, PersonaEvents, SceneEventMapping } from '../settings'
import eventsCenter from './../EventsCenter'
import Scene0 from './Scene0'

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
        this.load.html("form", "form/form.html")
        this.load.image('background', 'images/background.jpg')
    }   

    async create()
    {
        this.persona =  this.persona
        this.personaEvents = this.personaEvents


        //Set Background Image
        this.add.image(400, 320, 'background')
    
        //Load Username input form
        this.usernameInput = this.add.dom(400, 300).createFromCache("form").setPerspective(800)

        //Create ENTER KEY
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        //Input Validation
        this.returnKey.on("down", event => {
            let username = this.usernameInput.getChildByName("username");
            for (let i = 0; i < this.dataJSON.length; i++) {

                if (this.dataJSON[i]["email"] == username.value) {
                    this.persona = this.dataJSON[i]["lifestage"]
                    console.log("Scene Started!")

                    this.scene.start("scene-0", {
                        persona : this.persona
                    })
                    console.log(this.scene)


                    break
                }

                else if (this.dataJSON[i]["email"] != username.value) {
                    console.log("Pls try again")
                    break
                }

              }

            
 
        }) 

        //Calling Game 1 Database from Mongo DB
        try {
            this.dataJSON = await fetch("http://localhost:3000/get")
                .then(response => response.json());
        //this.playerPersona = this.dataJSON[0]["lifestage"]
        } catch (e) {
            console.error(e);
        }

    }
    
    update() 
    {

    }

    
}