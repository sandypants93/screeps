function progPercent(site) {
    return (site.progress / site.progressTotal) * 100;
}
function bestSite(sites) {
    var len = sites.length, max = progPercent(sites[0]), index = 0;
    while (len--) {
        if(progPercent(sites[len]) > max) {
            max = progPercent(sites[len]);
            index = len;
        }
    }
    var goodSites = _.filter(sites, (site) => progPercent(site) == max);
    return goodSites;
}
function hitsPercent(struct) {
    return (struct.hits / struct.hitsMax) * 100;
}
function bestStruct(structs) {
    var len = structs.length, min = hitsPercent(structs[0]);
    while (len--) {
        if(hitsPercent(structs[len]) < min) {
            min = hitsPercent(structs[len]);
        }
    }
    var minStructs = _.filter(structs, (struct) => hitsPercent(struct) == min);
    return minStructs;
}
var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.state == 0) {
            var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            var reprsLo = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits <= 10000});
            var reprsHi = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits > 10000});
            if(sites.length || reprsLo.length || reprsHi.length) {
                creep.memory.state = 3;
            }
            else {
                var spawn = Game.getObjectById(creep.memory.home);
                if(creep.pos.getRangeTo(spawn) > 2) {
                    creep.moveTo(spawn, {visualizePathStyle : {stroke : '#00ccff'}});
                }
            }
        }
        else if(creep.memory.state == 1){
            if(creep.carry.energy == 0) {
                creep.memory.state = 3;
                creep.say('harvest');
            }
            else {
                var reprsLo = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits <= 10000});
                var reprsHi = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits > 10000});
                if(reprsLo.length) {
                    var targ = creep.pos.findClosestByPath(bestStruct(reprsLo));
                    if(creep.repair(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ, {visualizePathStyle : {stroke: '#ffffff'}});
                    }
                }
                else if(reprsHi.length) {
                    var targ = creep.pos.findClosestByPath(bestStruct(reprsHi));
                    if(creep.repair(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ, {visualizePathStyle : {stroke: '#ffffff'}});
                    }
                }
                else {
                    creep.memory.state = 0;
                }
            }
        }
        else if(creep.memory.state == 2) {
            if (creep.carry.energy == 0) {
                creep.memory.state = 3;
                creep.say('harvest')
            }
            else {
                var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(sites.length) {
                    var targ = creep.pos.findClosestByPath(bestSite(sites));
                    if(creep.build(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ, {visualizePathStyle : {stroke : '#ffffff'}});
                    }
                }
                else {
                    creep.memory.state = 0;
                }
            }
        }
        else if(creep.memory.state == 3) {
            if(creep.carry.energy == creep.carryCapacity) {
                var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                var reprsLo = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits <= 10000});
                if(sites.length > reprsLo.length * 1.5) {
                    creep.memory.state = 2;
                    creep.say('build');
                }
                else {
                    creep.memory.state = 1;
                    creep.say('repair');
                }
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

module.exports = roleBuilder;