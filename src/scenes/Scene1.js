import Phaser from 'phaser'

export default class Scene1 extends Phaser.Scene
{
	constructor()
	{
		super('scene-1')
	}

	preload()
    {
        this.load.image('hyptosis_tile-art-batch-1', '../assets/tilemaps/hyptosis_tile-art-batch-1.png')
        this.load.image('hyptosis_tile-art-batch-2', '../assets/tilemaps/hyptosis_tile-art-batch-2.png')

        this.load.tilemapTiledJSON('tilemap', '../assets/tilemaps/level-1.json')
    }

    create()
    {
        var map = this.make.tilemap({ key: 'tilemap' })
        var hyptosisTileset1 = map.addTilesetImage('hyptosis_tile-art-batch-1', 'hyptosis_tile-art-batch-1')
        var hyptosisTileset2 = map.addTilesetImage('hyptosis_tile-art-batch-2', 'hyptosis_tile-art-batch-2')
        
        map.createLayer('Ground', [hyptosisTileset1, hyptosisTileset2])
        map.createLayer('Objects', [hyptosisTileset1, hyptosisTileset2])
    }
}
