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
		this.dialogSpeed = 5;
		this.scrollFactor = 0; //scrollFactor of 0 fixes to the camera

		// if the dialog window is shown
		this.visible = false;
		// Normal Dialog Box
		this.dialogBox = {
			background: null,
			text: null,
			command: null
		};
		
		// Summary Dialog Box
		this.summaryDialogBox = {
			background: null,
			text: null,
			command: null
		};
	}

	//  Called when the Plugin is booted by the PluginManager.
	boot() {
		// Create the Dialog window
		this._drawBackground();
		this._drawText();
		this._drawCommand();
		
		this.display(false);

		// Create the Summary Dialog window
		this._drawSummaryBackground();
		this._drawSummaryText();
		this._drawSummaryCommand();
		
		this.displaySummary(false);
		
		let eventEmitter = this.systems.events;
		eventEmitter.on('shutdown', this.shutdown, this);
	}

	//  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
	shutdown() {
		if (this.timedEvent) this.timedEvent.remove();
		if (this.dialogBox.text) this.dialogBox.text.destroy();
		if (this.dialogBox.command) this.dialogBox.command.destroy();

		if (this.summaryDialogBox.text) this.summaryDialogBox.text.destroy();
		if (this.summaryDialogBox.command) this.summaryDialogBox.command.destroy();
	}

	//  Called when a Scene is destroyed by the Scene Manager. There is no coming back from a destroyed Scene, so clear up all resources here.
	destroy() {
		this.shutdown();
		this.scene = undefined;
	}

	// Hide/Show the Dialog window
	display(showMe) {
		if(typeof showMe === 'undefined') this.visible = !this.visible;
		else this.visible = showMe;

		if (this.dialogBox.text) this.dialogBox.text.visible = this.visible;
		if (this.dialogBox.command) this.dialogBox.command.visible = this.visible;
		if (this.dialogBox.background) this.dialogBox.background.visible = this.visible;
	}

	// Sets the text for the dialog window
	setText(text, commandType) {
		if(!text || !text.split) return;
		if (this.timedEvent) this.timedEvent.remove();

		this.display(true);
		const charArray = text.split('');
		
		this.timedEvent = this.scene.time.addEvent({
			delay: 150 - (this.dialogSpeed * 30),
			callback: (charArray)=>{
				if (charArray[this.dialogBox.text.text.length + 1]) {
					this.dialogBox.text.setText(this.dialogBox.text.text + charArray[this.dialogBox.text.text.length] + charArray[this.dialogBox.text.text.length + 1]);
				} else {
					this.dialogBox.text.setText(this.dialogBox.text.text + charArray[this.dialogBox.text.text.length]);
				}
				
				if (this.dialogBox.text.text.length >= charArray.length) {
					this.timedEvent.remove();
				}
			},
			args: [charArray],
			callbackScope: this,
			loop: true
		});

		this.dialogBox.text.setText('');
		switch(commandType) {
			case 1:
				this.dialogBox.command.setText('Spacebar: Continue');
				break;
			case 2:
				this.dialogBox.command.setText('Spacebar: Yes    Shift: No');
				break;
			case 3:
				this.dialogBox.command.setText('Spacebar: Continue    Up: Savings    Down: Investment');
				break;
		}
	}

	// Calculates where to place the dialog window based on the game size
	_calculateWindowDimensions() {
		var gameHeight = this.scene.sys.game.config.height;
		var gameWidth = this.scene.sys.game.config.width;
		var x = 5;
		var y = gameHeight - this.windowHeight - 5;
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
		this.dialogBox.background = this.scene.add.graphics().setScrollFactor(this.scrollFactor);

		this.dialogBox.background.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
		this.dialogBox.background.fillStyle(this.windowColor, this.windowAlpha);
		this.dialogBox.background.strokeRoundedRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height, 5);
		this.dialogBox.background.fillRoundedRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height, 5);

		// Ensure the dialog box renders above everything else
		this.dialogBox.background.setDepth(1000);
	}

	// Creates text holder within the dialog window
	_drawText() {
		let dimensions = this._calculateWindowDimensions();
		let x = dimensions.x + (this.padding * 0.5);
		let y = dimensions.y + (this.padding * 0.5);
		let text = '';
	   
		this.dialogBox.text = this.scene.make.text({
			x,
			y,
			text,
			style: {
				wordWrap: { width: dimensions.width - this.padding },
				fontFamily: 'pressstart',
				fontSize: '18px',
				lineSpacing: '1'
			}
		}).setScrollFactor(this.scrollFactor);

		// Ensure the dialog text renders above the background
		this.dialogBox.text.setDepth(1010);
	}

	// Creates text holder within the dialog window
	_drawCommand() {
		let dimensions = this._calculateWindowDimensions();
		let x = dimensions.x + (this.padding * 0.5) + 360;
		let y = dimensions.y + (this.padding * 0.5) + 105;
		let command = '';
	   
		this.dialogBox.command = this.scene.make.text({
			x,
			y,
			command,
			style: {
				wordWrap: { width: dimensions.width - this.padding },
				fontFamily: 'pressstart',
				fontSize: '18px',
				lineSpacing: '1'
			}
		}).setScrollFactor(this.scrollFactor);

		// Ensure the dialog text renders above the background
		this.dialogBox.command.setDepth(1020);
	}

	/* For Summary Dialog */

	// Hide/Show the Summary window
	displaySummary(showMe) {
		if(typeof showMe === 'undefined') this.visible = !this.visible;
		else this.visible = showMe;

		if (this.summaryDialogBox.text) this.summaryDialogBox.text.visible = this.visible;
		if (this.summaryDialogBox.command) this.summaryDialogBox.command.visible = this.visible;
		if (this.summaryDialogBox.background) this.summaryDialogBox.background.visible = this.visible;
	}

	// Sets the text for the dialog window
	setSummaryText(text, commandType) {
		if(!text || !text.split) return;

		this.displaySummary(true);
		this.summaryDialogBox.text.setText(text)

		switch(commandType) {
			case 1:
				this.summaryDialogBox.command.setText('Spacebar: Continue');
				break;
			case 2:
				this.summaryDialogBox.command.setText('Spacebar: Yes    Shift: No');
				break;
			case 3:
				this.summaryDialogBox.command.setText('Spacebar: Continue    Up: Savings    Down: Investment');
				break;
		}
	}

	// Calculates where to place the Summary Dialog window based on the game size
	_calculateSummaryWindowDimensions() {
		var gameHeight = this.scene.sys.game.config.height;
		var gameWidth = this.scene.sys.game.config.width;
		var x = 15;
		var y = 140;
		var width = gameWidth - (x*2);
		var height = gameHeight - (y*2);
		return {
			x,
			y,
			width,
			height
		};
	}

	// Creates the Summary Dialog window
	_drawSummaryBackground() {
		let dimensions = this._calculateSummaryWindowDimensions();
		this.summaryDialogBox.background = this.scene.add.graphics().setScrollFactor(this.scrollFactor);

		this.summaryDialogBox.background.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
		this.summaryDialogBox.background.fillStyle(this.windowColor, this.windowAlpha);
		this.summaryDialogBox.background.strokeRoundedRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height, 5);
		this.summaryDialogBox.background.fillRoundedRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height, 5);

		// Ensure the Summary Dialog box renders above everything else
		this.summaryDialogBox.background.setDepth(1000);
	}

	// Creates text holder within the Summary Dialog window
	_drawSummaryText() {
		let dimensions = this._calculateSummaryWindowDimensions();
		let x = dimensions.x + (this.padding * 0.5);
		let y = dimensions.y + (this.padding * 0.5);
		let text = '';
	   
		this.summaryDialogBox.text = this.scene.make.text({
			x,
			y,
			text,
			style: {
				wordWrap: { width: dimensions.width - this.padding },
				fontFamily: 'pressstart',
				fontSize: '18px',
				lineSpacing: '1'
			}
		}).setScrollFactor(this.scrollFactor);

		// Ensure the Summary Dialog text renders above the background
		this.summaryDialogBox.text.setDepth(1010);
	}

	// Creates text holder within the Summary Dialog window
	_drawSummaryCommand() {
		let dimensions = this._calculateSummaryWindowDimensions();
		let x = dimensions.x + (this.padding * 0.5) + 360;
		let y = dimensions.y + (this.padding * 0.5) + 275;
		let command = '';
	   
		this.summaryDialogBox.command = this.scene.make.text({
			x,
			y,
			command,
			style: {
				wordWrap: { width: dimensions.width - this.padding },
				fontFamily: 'pressstart',
				fontSize: '18px',
				lineSpacing: '1'
			}
		}).setScrollFactor(this.scrollFactor);

		// Ensure the Summary Dialog text renders above the background
		this.summaryDialogBox.command.setDepth(1020);
	}
}



