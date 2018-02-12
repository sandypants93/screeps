var roleSpawner = require('role.spawner');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function() {
    /* make sure dead creeps aren't in memory */
    for(var name in Memory.creeps) {
        if(Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
            console.log('Clearing non-existent creep: ' + name)
        }
    }
    /* run every spawner */
    for(var name in Game.spawns) {
        if(!(Game.spawns[name].memory.maxBuilders >= 0)) {
            Game.spawns[name].memory = {maxBuilders: 3, maxHarvesters: 2, maxUpgraders: 2, building: 0};
        }
        roleSpawner.run(Game.spawns[name]);
    }
    /* run every creep */
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}