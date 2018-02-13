/* roleUpgrader is the export of the module and runs the upgrader thinking */
/* the upgrader has 2 states: harvest and upgrade */
/* the upgrader will change states based on different criteria per state */
var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // state 1 is the upgrade state
        if(creep.memory.state == 1) {
            // if the creep has no energy then it changes to the harvest state
            if(creep.carry.energy == 0) {
                creep.memory.state = 2;
                creep.say('harvest');
            }
            // go to and upgrade the room controller
            else if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle : {stroke : '#ffffff'}});
            }
        }
        // state 2 is the harvest state
        else if(creep.memory.state == 2) {
            // if the creep is full of energy it changes to the upgrade state
            if(creep.carry.energy == creep.carryCapacity) {
                creep.memory.state = 1;
                creep.say('upgrade');
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

module.exports = roleUpgrader;