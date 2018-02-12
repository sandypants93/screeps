var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.state == 0) {
            var targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.energy < structure.energyCapacity});
            if(targets.length) {
                creep.memory.state = 1;
                creep.say('transfer');
            }
            else {
                var spawn = Game.getObjectById(creep.memory.home);
                if(creep.pos.getRangeTo(spawn) > 2) {
                    creep.moveTo(spawn, {visualizePathStyle : {stroke : '#00ccff'}});
                }
            }
        }
        else if(creep.memory.state == 1) {
            if(creep.carry.energy == 0) {
                creep.memory.state = 2;
                creep.say('harvest');
            }
            else {
                var targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.energy < structure.energyCapacity});
                if(targets.length) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle : {stroke : '#ffffff'}});
                    }
                }
                else if(creep.carry.energy < creep.carryCapacity) {
                    creep.memory.state = 2;
                    creep.say('harvest');
                }
                else {
                    creep.memory.state = 0;
                    creep.say('idle');
                }
            }
        }
        else if(creep.memory.state == 2){
            
            if(creep.carry.energy == creep.carryCapacity) {
                 creep.memory.state = 1;
                 creep.say('transfer');
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

module.exports = roleHarvester;