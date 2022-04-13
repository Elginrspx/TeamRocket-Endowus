import Phaser from 'phaser'

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
                    console.log("Scene Started!")
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
    
    update() 
    {

    }

    
}