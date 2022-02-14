import Phaser from 'phaser'
import { WorldProperties } from './worldProperties'

import Scene1 from './scenes/Scene1'
import Scene2 from './scenes/Scene2'
import Scene3 from './scenes/Scene3'

const config = {
	type: Phaser.AUTO,
	width: WorldProperties.width,
	height: WorldProperties.height,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false
		}
	},
	scene: [Scene1, Scene2, Scene3]
}

export default new Phaser.Game(config)
