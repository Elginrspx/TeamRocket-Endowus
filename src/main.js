import Phaser from 'phaser'

import Scene1 from './scenes/Scene1'

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	scene: [Scene1]
}

export default new Phaser.Game(config)
