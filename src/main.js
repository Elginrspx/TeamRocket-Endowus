import Phaser from 'phaser'
import { WorldProperties } from './worldProperties'

import Scene1 from './scenes/Scene1'
import Scene2 from './scenes/Scene2'

const config = {
	type: Phaser.AUTO,
	width: WorldProperties.width,
	height: WorldProperties.height,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	scene: [Scene1, Scene2]
}

export default new Phaser.Game(config)
