var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.state == 1 && creep.carry.energy == 0) {
            creep.memory.state = 2;
            creep.say('harvest');
        }
        if(creep.memory.state == 2 && creep.carry.energy == creep.carryCapacity) {
            creep.memory.state = 1;
            creep.say('upgrade')
        }
        if(creep.memory.state == 1) {
            if(creep.carry.energy == 0) {
                creep.memory.state = 2;
                creep.say('harvest');
            }
            else if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle : {stroke : '#ffffff'}});
            }
        }
        else {
            if(creep.carry.energy == creep.carryCapacity) {
                creep.memory.state = 1;
                creep.say('upgrade');
            }
            else {
                var src = Game.getObjectById(creep.memory.src);
                if(creep.pos.getRangeTo(src) < 5) {
                    if(creep.memory.waiting > 0) {
                        creep.memory.waiting += 1;
                    }
                    else {
                        creep.memory.waiting = 1;
                    }
                }
                if(src.energy == 0 || creep.memory.waiting > 10) {
                    var sources = creep.room.find(FIND_SOURCES, {filter: (src) => src.id != creep.memory.src && src.energy > 0});
                    if(sources.length) {
                        creep.memory.src = sources[0].id;
                        src = Game.getObjectById(creep.memory.src);
                        delete creep.memory.waiting;
                    }
                }
                if(creep.harvest(src) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(src, {visualizePathStyle : {stroke : '#ffaa00'}});
                }
                else {
                    delete creep.memory.waiting;
                }
            }
        }
    }
};

module.exports = roleUpgrader;