/* roleHarvester is the export of the module and will run harvester thinking */
/* the harvester functions with 3 states: idle, harvest, and transfer */
/* the harvester will change states based on different criteria per state */
var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // state 0 is the idle state
        if(creep.memory.state == 0) {
            // check for structures that need energy
            var targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.energy < structure.energyCapacity});
            // change to transfer state if there is
            if(targets.length) {
                creep.memory.state = 1;
                creep.say('transfer');
            }
            // otherwise go within 2 spaces of the spawn id at memory -> home
            else {
                var spawn = Game.getObjectById(creep.memory.home);
                if(creep.pos.getRangeTo(spawn) > 2) {
                    creep.moveTo(spawn, {visualizePathStyle : {stroke : '#00ccff'}});
                }
            }
        }
        // state 1 is the transfer state
        else if(creep.memory.state == 1) {
            // if the harvester needs energy change to the harvest state
            if(creep.carry.energy == 0) {
                creep.memory.state = 2;
                creep.say('harvest');
            }
            else {
                // get an array of structures that need energy
                var targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.energy < structure.energyCapacity});
                // go to the first structure in the array to transfer energy
                if(targets.length) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle : {stroke : '#ffffff'}});
                    }
                }
                // if there are no targets go fill up on energy for later
                else if(creep.carry.energy < creep.carryCapacity) {
                    creep.memory.state = 2;
                    creep.say('harvest');
                }
                // if there are no targets and the harvester is full of energy go into idle state
                else {
                    creep.memory.state = 0;
                    creep.say('idle');
                }
            }
        }
        // state 2 is the harvest state
        else if(creep.memory.state == 2){
            // if the harvester is full of energy go into the transfer state
            if(creep.carry.energy == creep.carryCapacity) {
                 creep.memory.state = 1;
                 creep.say('transfer');
            }
            else {
                // get the source using the source id in memory -> src
                var src = Game.getObjectById(creep.memory.src);
                // while the creep is five away from the source add to waiting counter
                if(creep.pos.getRangeTo(src) < 5) {
                    if(creep.memory.waiting > 0) {
                        creep.memory.waiting += 1;
                    }
                    // if it doesn't exist make the counter
                    else {
                        creep.memory.waiting = 1;
                    }
                }
                // if the source is depleted or the creep has waited 10 ticks to harvest find a new source
                if(src.energy == 0 || creep.memory.waiting > 10) {
                    // get an array of sources other then the current one
                    var sources = creep.room.find(FIND_SOURCES, {filter: (src) => src.id != creep.memory.src && src.energy > 0});
                    // if there is one make it the creep's src and delete waiting
                    if(sources.length) {
                        creep.memory.src = sources[0].id;
                        src = Game.getObjectById(creep.memory.src);
                        delete creep.memory.waiting;
                    }
                }
                // go to and harvest energy from the src
                if(creep.harvest(src) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(src, {visualizePathStyle : {stroke : '#ffaa00'}});
                }
                // delete waiting if the creep harvests from the source
                else {
                    delete creep.memory.waiting;
                }
            }
        }
    }
};

module.exports = roleHarvester;