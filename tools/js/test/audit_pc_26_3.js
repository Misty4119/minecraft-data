/* eslint-env mocha */

const assert = require('assert')
const path = require('path')

const dataPath = path.join(__dirname, '../../../data/pc/26.3')
const read = name => require(path.join(dataPath, name + '.json'))

describe('Minecraft Java 26.3 data integrity', () => {
  it('registers the release and maps the public data surfaces to its own dataset', () => {
    const dataPaths = require('../../../data/dataPaths.json').pc['26.3']
    const versions = require('../../../data/pc/common/versions.json')
    const protocolVersions = require('../../../data/pc/common/protocolVersions.json')

    assert.ok(dataPaths, '26.3 is missing from dataPaths.json')
    for (const name of ['blocks', 'blockCollisionShapes', 'biomes', 'items', 'entities', 'foods', 'protocol', 'version']) {
      assert.strictEqual(dataPaths[name], 'pc/26.3', `${name} must use native 26.3 data`)
    }
    assert.strictEqual(versions.at(-1), '26.3')
    assert.ok(protocolVersions.some(({ minecraftVersion }) => minecraftVersion === '26.3'))
  })

  it('contains release metadata and 26.3-only registries', () => {
    assert.deepStrictEqual(read('version'), {
      version: 777,
      minecraftVersion: '26.3',
      majorVersion: '26.3',
      releaseType: 'release'
    })

    const biome = read('biomes').find(entry => entry.name === 'dappled_forest')
    assert.ok(biome, 'the Dappled Forest biome is missing')
    assert.ok(read('blocks').some(entry => entry.name === 'poplar_log'))
    assert.ok(read('blocks').some(entry => entry.name === 'red_poplar_leaves'))
    assert.ok(read('blocks').some(entry => entry.name === 'shelf_mushroom'))
    assert.ok(read('items').some(entry => entry.name === 'straw_bed'))
    assert.ok(read('items').some(entry => entry.name === 'white_cushion'))
  })

  it('keeps the block and item registries internally consistent', () => {
    const blocks = read('blocks')
    const items = read('items')
    const shapes = read('blockCollisionShapes')

    assert.strictEqual(new Set(blocks.map(({ id }) => id)).size, blocks.length)
    assert.strictEqual(new Set(blocks.map(({ name }) => name)).size, blocks.length)
    assert.strictEqual(new Set(items.map(({ id }) => id)).size, items.length)
    assert.strictEqual(new Set(items.map(({ name }) => name)).size, items.length)
    assert.ok(blocks.every(block => Number.isInteger(block.minStateId) && block.minStateId <= block.defaultState && block.defaultState <= block.maxStateId))
    assert.ok(shapes && typeof shapes === 'object')
    assert.ok(shapes.blocks && typeof shapes.blocks === 'object')
    assert.ok(shapes.shapes && typeof shapes.shapes === 'object')
    assert.ok(Object.values(shapes.shapes).every(shape => Array.isArray(shape)))
  })
})
