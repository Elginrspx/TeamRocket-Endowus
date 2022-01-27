import Phaser from 'phaser'
import { WorldProperties } from './worldProperties'

import Scene1 from './scenes/Scene1'

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
	scene: [Scene1]
}

export default new Phaser.Game(config)
