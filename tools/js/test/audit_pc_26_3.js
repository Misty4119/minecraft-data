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

  it('matches the 26.3 team, explosion, and interaction wire fields', () => {
    const protocol = read('protocol')
    const teamAddFields = protocol.play.toClient.types.packet_teams[1][2].type[1].fields.add[1].map(({ name }) => name)
    const explosionFields = protocol.play.toClient.types.packet_explosion[1].map(({ name }) => name)
    const interactionFields = protocol.play.toServer.types.packet_use_entity[1].map(({ name }) => name)

    assert.deepStrictEqual(teamAddFields, [
      'displayName',
      'prefix',
      'suffix',
      'nameTagVisibility',
      'collisionRule',
      'color',
      'flags'
    ])
    assert.strictEqual(explosionFields.at(-1), 'playSound')
    assert.strictEqual(interactionFields.at(-1), 'usingSecondaryAction')
  })

  it('matches the official 26.3 hashed-item component stream codecs', () => {
    const protocol = read('protocol')
    const slotComponent = protocol.types.SlotComponent[1]
    const slotFields = Object.fromEntries(slotComponent.map(({ name, type }) => [name, type]))
    const componentTypes = slotFields.data[1].fields

    assert.strictEqual(componentTypes.damage_resistant, 'IDSet')
    assert.strictEqual(componentTypes.provides_banner_patterns, 'IDSet')
    assert.deepStrictEqual(
      componentTypes.pot_decorations[1].map(({ name, type }) => [name, type]),
      [
        ['back', ['option', 'ItemStackTemplate']],
        ['left', ['option', 'ItemStackTemplate']],
        ['right', ['option', 'ItemStackTemplate']],
        ['front', ['option', 'ItemStackTemplate']]
      ]
    )

    const effectFields = protocol.types.ItemConsumeEffect[1]
    const variants = effectFields.find(({ anon }) => anon).type[1].fields
    assert.deepStrictEqual(
      variants.teleport_randomly[1].map(({ name, type }) => [name, type]),
      [['diameter', 'f32'], ['directionalParticles', 'bool']]
    )
  })

  it('encodes the 26.3 player skin model as a boolean flag', () => {
    const protocol = read('protocol')
    const model = protocol.types.PlayerSkinPatch[1].find(({ name }) => name === 'model')
    assert.deepStrictEqual(model.type, ['option', 'bool'])
  })

  it('writes each bee occupant as entity type ID, NBT, and two hive tick counts', () => {
    const protocol = read('protocol')
    const slotFields = Object.fromEntries(protocol.types.SlotComponent[1].map(({ name, type }) => [name, type]))
    const bees = slotFields.data[1].fields.bees[1][0].type[1].type[1]

    assert.deepStrictEqual(
      bees.map(({ name, type }) => [name, type]),
      [
        ['entityType', 'varint'],
        ['nbtData', 'anonymousNbt'],
        ['ticksInHive', 'varint'],
        ['minTicksInHive', 'varint']
      ]
    )
  })

  it('preserves exact and partial data-component matcher stream payloads', () => {
    const protocol = read('protocol')
    const matcher = protocol.types.PartialComponentMatcher
    const matcherFields = matcher[1].map(({ name, type }) => [name, type])
    const typeIds = protocol.types.DataComponentPredicateType[1].mappings

    assert.deepStrictEqual(matcherFields, [
      ['isPredicate', 'bool'],
      ['type', ['switch', {
        compareTo: 'isPredicate',
        fields: {
          true: 'DataComponentPredicateType',
          false: 'SlotComponentType'
        }
      }]],
      ['data', 'anonymousNbt']
    ])
    assert.deepStrictEqual(Object.values(typeIds), [
      'damage', 'enchantments', 'stored_enchantments', 'potion_contents', 'custom_data',
      'container', 'bundle_contents', 'firework_explosion', 'fireworks', 'writable_book_content',
      'written_book_content', 'attribute_modifiers', 'trim', 'jukebox_playable', 'villager/variant'
    ])
    assert.deepStrictEqual(protocol.types.DataComponentMatchers[1].map(({ name, type }) => [name, type]), [
      ['exactMatchers', 'ExactComponentMatcher'],
      ['partialMatchers', ['array', { countType: 'varint', type: 'PartialComponentMatcher' }]]
    ])
  })
})
