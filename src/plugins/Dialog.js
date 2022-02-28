import Phaser from 'phaser';

export class Dialog extends Phaser.Plugins.ScenePlugin {

	constructor(scene, pluginManager, pluginKey) {
		super(scene, pluginManager, pluginKey);
		this.scene = scene;
		this.systems = scene.sys;

		this.borderThickness = 5;
		this.borderColor = 0xffffff;
		this.borderAlpha = 1;
		this.windowAlpha = 0.95;
		this.windowColor = 0x000000;
		this.windowHeight = 150;
		this.padding = 32;
		this.dialogSpeed = 15;
		this.scrollFactor = 0; //scrollFactor of 0 fixes to the camera

		// if the dialog window is shown
		this.visible = false;
		// the text that will be displayed in the window
		this.graphics = {
			background: null,
			text: null,
			command: null
		};
	}

	//  Called when the Plugin is booted by the PluginManager.
	boot() {
		// Create the dialog window
		this._drawBackground();
		this._drawText();
		this._drawCommand();
		
		this.display(false);
		
		let eventEmitter = this.systems.events;
		eventEmitter.on('shutdown', this.shutdown, this);
	}

	//  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
	shutdown() {
		if (this.timedEvent) this.timedEvent.remove();
		if (this.graphics.text) this.graphics.text.destroy();
		if (this.graphics.command) this.graphics.command.destroy();
	}

	//  Called when a Scene is destroyed by the Scene Manager. There is no coming back from a destroyed Scene, so clear up all resources here.
	destroy() {
		this.shutdown();
		this.scene = undefined;
	}


	// Hide/Show the dialog window
	display(showMe) {
		if(typeof showMe === 'undefined') this.visible = !this.visible;
		else this.visible = showMe;

		if (this.graphics.text) this.graphics.text.visible = this.visible;
		if (this.graphics.command) this.graphics.command.visible = this.visible;
		if (this.graphics.background) this.graphics.background.visible = this.visible;
	}

	// Sets the text for the dialog window
	setText(text, commandType) {
		if(!text || !text.split) return;
		if (this.timedEvent) this.timedEvent.remove();

		this.display(true);
		const charArray = text.split('');
		
		this.graphics.text.setText('');
		if (commandType == 1) {
			this.graphics.command.setText('Spacebar: Continue');
		} else if (commandType == 2) {
			this.graphics.command.setText('Spacebar: Yes    Shift: No');
		} else if (commandType == 3) {
			this.graphics.command.setText('Spacebar: Invest    Shift: Cash');
		}
		
		
		this.timedEvent = this.scene.time.addEvent({
			delay: 150 - (this.dialogSpeed * 30),
			callback: (charArray)=>{
				this.graphics.text.setText(this.graphics.text.text + charArray[this.graphics.text.text.length]);
				if (this.graphics.text.text.length === charArray.length) {
					this.timedEvent.remove();
				}
			},
			args: [charArray],
			callbackScope: this,
			loop: true
		});
	}

	// Calculates where to place the dialog window based on the game size
	_calculateWindowDimensions() {
		var gameHeight = this.scene.sys.game.config.height;
		var gameWidth = this.scene.sys.game.config.width;
		var x = 135;
		var y = gameHeight - this.windowHeight - this.padding;
		var width = gameWidth - (x*2);
		var height = this.windowHeight;
		return {
			x,
			y,
			width,
			height
		};
	}

	// Creates the dialog window
	_drawBackground() {
		let dimensions = this._calculateWindowDimensions();
		this.graphics.background = this.scene.add.graphics().setScrollFactor(this.scrollFactor);

		this.graphics.background.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
		this.graphics.background.fillStyle(this.windowColor, this.windowAlpha);
		this.graphics.background.strokeRoundedRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height, 5);
		this.graphics.background.fillRoundedRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height, 5);

		// Ensure the dialog box renders above everything else
		this.graphics.background.setDepth(1000);
	}

	// Creates text holder within the dialog window
	_drawText() {
		let dimensions = this._calculateWindowDimensions();
		let x = dimensions.x + (this.padding * 0.5);
		let y = dimensions.y + (this.padding * 0.5);
		let text = '';
	   
		this.graphics.text = this.scene.make.text({
			x,
			y,
			text,
			style: {
				wordWrap: { width: dimensions.width - this.padding },
				fontFamily: 'pressstart',
				fontSize: '12px',
				lineSpacing: '1'
			}
		}).setScrollFactor(this.scrollFactor);

		// Ensure the dialog text renders above the background
		this.graphics.text.setDepth(1010);
	}

	// Creates text holder within the dialog window
	_drawCommand() {
		let dimensions = this._calculateWindowDimensions();
		let x = dimensions.x + (this.padding * 0.5) + 325;
		let y = dimensions.y + (this.padding * 0.5) + 45;
		let command = '';
	   
		this.graphics.command = this.scene.make.text({
			x,
			y,
			command,
			style: {
				wordWrap: { width: dimensions.width - this.padding },
				fontFamily: 'pressstart',
				fontSize: '12px',
				lineSpacing: '1'
			}
		}).setScrollFactor(this.scrollFactor);

		// Ensure the dialog text renders above the background
		this.graphics.command.setDepth(1020);
	}

}



