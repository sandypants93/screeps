/* this function gets the percentage of the progress of a construction site */
function progPercent(site) {
    return (site.progress / site.progressTotal) * 100;
}
/* this function determines the construction sites with the highest progress percentage */
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
/* this function gets the percentage of health of a structure */
function hitsPercent(struct) {
    return (struct.hits / struct.hitsMax) * 100;
}
/* this function determines the structures with the lowest health percentage  */
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
/* roleBuilder is the export of the module and runs the builder thinking */
/* the builder functions with four states: idle, build sites, repair structures, and harvest */
/* the builder will change states based on different criteria per state */
var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // state 0 is the idle state
        if(creep.memory.state == 0) {
            // get arrays of construction sites, structures with hits below 5000, and structures with hits above 5000
            var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            var reprsLo = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits <= 5000});
            var reprsHi = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits > 5000});
            // if there are any of those change the state to harvest
            if(sites.length || reprsLo.length || reprsHi.length) {
                creep.memory.state = 3;
            }
            //  otherwise move within two tiles of the spawn whose id is memory -> home
            else {
                var spawn = Game.getObjectById(creep.memory.home);
                if(creep.pos.getRangeTo(spawn) > 2) {
                    creep.moveTo(spawn, {visualizePathStyle : {stroke : '#00ccff'}});
                }
            }
        }
        // state 1 is the repair state
        else if(creep.memory.state == 1){
            // if the creep is out of energy then chage to the harvest state
            if(creep.carry.energy == 0) {
                creep.memory.state = 3;
                creep.say('harvest');
            }
            else {
                // get arrays of all the structure with hits below 5000 and all the structures above 5000
                var reprsLo = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits <= 5000});
                var reprsHi = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits > 5000});
                // if there are any with hits below 5000 go to the closest and repair it
                if(reprsLo.length) {
                    var targ = creep.pos.findClosestByPath(bestStruct(reprsLo));
                    if(creep.repair(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ, {visualizePathStyle : {stroke: '#ffffff'}});
                    }
                }
                // otherwise go to the closest with hits above 5000 and repair it
                else if(reprsHi.length) {
                    var targ = creep.pos.findClosestByPath(bestStruct(reprsHi));
                    if(creep.repair(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ, {visualizePathStyle : {stroke: '#ffffff'}});
                    }
                }
                // if there are no structures to repair change to the idle state
                else {
                    creep.memory.state = 0;
                }
            }
        }
        // state 2 is the build state
        else if(creep.memory.state == 2) {
            // if the creep is out of energy change to the harvest state
            if (creep.carry.energy == 0) {
                creep.memory.state = 3;
                creep.say('harvest')
            }
            else {
                // get an array of all the construction sites
                var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(sites.length) {
                    // check for non wall sites
                    var pri = _.filter(sites, (site) => site.structureType != STRUCTURE_WALL);
                    // if those exist then go to the closest and build it
                    if(pri.length) { 
                        var targ = creep.pos.findClosestByPath(bestSite(pri));
                    }
                    // otherwise go to the closest site and build it
                    else {
                        var targ = creep.pos.findClosestByPath(bestSite(sites));
                    }
                    if(creep.build(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ, {visualizePathStyle : {stroke : '#ffffff'}});
                    }
                }
                // if there are no sites change to the idle state
                else {
                    creep.memory.state = 0;
                }
            }
        }
        // state 3 is the harvest state
        else if(creep.memory.state == 3) {
            // if the creep is full of energy the state should change
            if(creep.carry.energy == creep.carryCapacity) {
                // get arrays of all the construction sites and structure with hits below 5000
                var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                var reprsLo = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits <= 5000});
                // if there are construction sites see if there are any that aren't walls
                if(sites.length) {
                    var pri = _.filter(sites, (site) => site.structureType != STRUCTURE_WALL);
                    // if there are priority sites or there are more than 150% of the repairs needed change the state to build
                    if(pri.length || sites.length > reprsLo.length * 1.5) {
                        creep.memory.state = 2;
                        creep.say('build');
                    }
                    //otherwise change the state to repair
                    else {
                        creep.memory.state = 1;
                        creep.say('repair');
                    }
                }
                // if there were no sites change the state to repair
                else {
                    creep.memory.state = 1;
                    creep.say('repair');
                }
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

module.exports = roleBuilder;
