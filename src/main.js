import Phaser from 'phaser'
import { WorldProperties } from './settings'

import Scene0 from './scenes/Scene0'
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
	scene: [Scene0, Scene1, Scene2, Scene3]
}

export default new Phaser.Game(config)
