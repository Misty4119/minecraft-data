/* eslint-env mocha */

const assert = require('assert')
const path = require('path')

const dataPath = path.join(__dirname, '../../../data/pc/26.2')
const read = name => require(path.join(dataPath, name + '.json'))

describe('Minecraft Java 26.2 data integrity', () => {
  it('contains the official version and registry counts', () => {
    assert.deepStrictEqual(read('version'), {
      version: 776,
      minecraftVersion: '26.2',
      majorVersion: '26.2',
      releaseType: 'release'
    })
    assert.strictEqual(read('blocks').length, 1196)
    assert.strictEqual(read('items').length, 1537)
    assert.strictEqual(read('entities').length, 158)
    assert.strictEqual(read('sounds').length, 1968)
    assert.strictEqual(read('particles').length, 125)
    assert.strictEqual(read('attributes').length, 40)
    assert.strictEqual(read('biomes').length, 66)
  })

  it('preserves the 26.2 block-state registry shift', () => {
    const blocks = read('blocks')
    const byState = new Map()
    for (const block of blocks) {
      for (let stateId = block.minStateId; stateId <= block.maxStateId; stateId++) {
        byState.set(stateId, block.name)
      }
    }

    assert.strictEqual(byState.get(24687), 'sulfur')
    assert.strictEqual(byState.get(24688), 'potent_sulfur')
    assert.strictEqual(byState.get(24689), 'potent_sulfur')
    assert.ok(blocks.find(block => block.name === 'cinnabar'))
    assert.ok(blocks.find(block => block.name === 'sulfur_spike'))
  })

  it('contains Sulfur Cube metadata including inherited and local fields', () => {
    const entity = read('entities').find(entity => entity.name === 'sulfur_cube')
    assert.ok(entity)
    for (const key of ['shared_flags', 'health', 'mob_flags', 'size', 'max_fuse', 'from_bucket']) {
      assert.ok(entity.metadataKeys.includes(key), `missing metadata key ${key}`)
    }
  })

  it('uses the 26.2 protocol packet names and field shapes', () => {
    const protocol = read('protocol')
    const login = protocol.login.toClient.types.packet_success
    const playClient = protocol.play.toClient.types
    const playServer = protocol.play.toServer.types

    assert.strictEqual(login[1][3].name, 'sessionId')
    assert.strictEqual(playClient.packet_login[1].find(field => field.name === 'onlineMode').type, 'bool')
    assert.ok(playClient.packet_teams[1][2].type[1].fields.add[1][6].type[0] === 'bitflags')
    assert.ok(playClient.packet_update_time[1].find(field => field.name === 'gameTime'))
    assert.strictEqual(playServer.packet_spectator_action[1][0].type[0], 'option')
    assert.strictEqual(playServer.packet_use_entity[1][3].name, 'usingSecondaryAction')
    assert.ok(playClient.packet_game_rule_values)
    assert.ok(playClient.packet_low_disk_space_warning)
    assert.strictEqual(playServer.packet_spectate_entity, undefined)
  })
})
