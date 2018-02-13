/* function to get the total energy in all extension and the spawn */
function energyTotal(spawn) {
    // get an array extensions' structure data 
    var extensions = spawn.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_EXTENSION}
        );
    var exEnergy = 0, len = extensions.length;
    // sum up all the energy in the extensions
    while (len--) {
        exEnergy += extensions[len].energy;
    }
    // add that to the spawn's energy
    return spawn.energy + exEnergy;
}
/* function to get an array of totals for each creep role */
function creepNums(spawn) {
    var har = 0, upg = 0, bui = 0;
    // go through each creep
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        // if its my creep
        if(creep.my) {
            // add to the correct total based on the role
            switch(creep.memory.role) {
                case 'harvester':
                    har++;
                    break;
                case 'upgrader':
                    upg++;
                    break;
                case 'builder':
                    bui++;
                    break;
            }
        }
    }
    // return the array
    return [har, upg, bui];
}

/* the roleSpawner will be the export for this module it runs the spawner thinking */
/* it will check creep totals and spawn them up to a certain number per role */
/* each creep spawned will be given their role, a state of 1, the id of an energy source, and the spawn's id in their memory */
/* building will happen in stages and after the controller reaches a certain level */
var roleSpawner = {
    /** @param {Spawn} spawn **/
    run: function(spawn) {
        // get the creep role totals and the controller level 
        var myCreeps = creepNums(spawn);
        var conLvl = spawn.room.controller.level;
        // check harvester total
        if(myCreeps[0] < spawn.memory.maxHarvesters) {
            // make sure we have the base amount of energy
            var en = energyTotal(spawn);
            if(en >= 250) {
                var sources = spawn.room.find(FIND_SOURCES);
                var newName = spawn.name + '_harvester' + Game.time;
                // level 4 harvester
                if(en >= 950) {
                    spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
                    newName, {memory: {role: 'harvester', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 3 harvester
                else if(en >= 500) {
                    spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                    {memory: {role: 'harvester', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 2 harvester
                else if(en >= 350) {
                    spawn.spawnCreep([WORK, WORK, CARRY, MOVE, MOVE], newName, {memory: {role: 'harvester', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 1 harvester
                else {
                    spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {memory : {role : 'harvester', state: 1, src : sources[0].id, home: spawn.id}});
                }
            }
        }
        // check the upgrader total
        else if(myCreeps[1] < spawn.memory.maxUpgraders) {
            // make sure we have the base amount of energy
            var en = energyTotal(spawn);
            if(en >= 250) {
                var sources = spawn.room.find(FIND_SOURCES);
                var newName = spawn.name + '_upgrader' + Game.time;
                // level 4 upgrader
                if(en >= 950) {
                    spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
                    newName, {memory: {role: 'upgrader', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 3 upgrader
                else if(en >= 500) {
                    spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                    {memory: {role: 'upgrader', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 2 upgrader
                else if(en >= 350) {
                    spawn.spawnCreep([WORK, WORK, CARRY, MOVE,  MOVE], newName, {memory: {role: 'upgrader', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 1 upgrader
                else {
                    spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {memory : {role : 'upgrader', state: 1, src : sources[0].id, home: spawn.id}});
                }
            }
        }
        // check the builder total
        else if(myCreeps[2] < spawn.memory.maxBuilders) {
            // make sure we have the base amount of energy
            var en = energyTotal(spawn);
            if(en >= 250) {
                var sources = spawn.room.find(FIND_SOURCES);
                var newName = spawn.name + '_builder' + Game.time;
                // level 4 builder
                if(en >= 950) {
                    spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
                    newName, {memory: {role: 'builder', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 3 builder
                else if(en >= 500) {
                    spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                    {memory: {role: 'builder', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 2 builder
                else if(en >= 350) {
                    spawn.spawnCreep([WORK, WORK, CARRY, MOVE, MOVE], newName, {memory: {role: 'builder', state: 1, src: sources[0].id, home: spawn.id}});
                }
                // level 1 builder
                else {
                    spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {memory : {role : 'builder', state: 1, src: sources[0].id, home: spawn.id}});
                }
            }
        }
        // give a message over the spawner as it spawns a creep
        if(spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '[' + spawn.name + '] spawning: ' + spawningCreep,
                spawn.pos.x,
                spawn.pos.y - 1, 
                {align : 'center', opacity : 0.8});
        }
        /* automated construction for the room is done in stages*/
        // the wall building stage
        if(spawn.memory.building == 0 && conLvl > 1) {
            // get a 21 X 21 square of room postion data
            var sites = spawn.room.lookAtArea((spawn.pos.y - 10), (spawn.pos.x - 10), (spawn.pos.y + 10), (spawn.pos.x + 10), true);
            // make an array to hold the places we will not build
            var check = _.filter(sites, (info) => info.terrain == 'wall' || info.type != 'terrain');
            var bad = Array();
            for(var i = 0; i < check.length; i++) {
                bad.push(String(check[i].x) + '|' + String(check[i].y));
            }
            // filter our sites based on the bad array
            sites = _.filter(sites, (info) => (!(bad.includes(String(info.x) + '|' + String(info.y)))) && 
                            ((info.y == spawn.pos.y - 10 && (info.x < spawn.pos.x - 2 || info.x > spawn.pos.x + 2)) ||
                             (info.y == spawn.pos.y + 10 && (info.x < spawn.pos.x - 2 || info.x > spawn.pos.x + 2)) ||
                             (info.x == spawn.pos.x - 10 && (info.y < spawn.pos.y - 2 || info.y > spawn.pos.y + 2)) ||
                             (info.x == spawn.pos.x + 10 && (info.y < spawn.pos.y - 2 || info.y > spawn.pos.y + 2))));
            // build one site a tick
            if(sites.length) {
                spawn.room.createConstructionSite(sites[0].x, sites[0].y, STRUCTURE_WALL);
            }
            // we move to the next stage
            else {
                spawn.memory.building++;
            }
        }
        // the first extension building stage
        else if(spawn.memory.building == 1 && conLvl > 1) {
            // get an array of built extensions and an array of extension construction sites
            var ex_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_EXTENSION});
            var ex_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_EXTENSION});
            // build these til we have 5
            if(ex_con.length + ex_str.length < 5) {
                // get the room postion data inside the wall
                var sites = spawn.room.lookAtArea(spawn.pos.y - 9, spawn.pos.x - 9, spawn.pos.y + 9, spawn.pos.x + 9, true);
                // make an array to filter out all but the outside of our square
                var check = _.filter(sites, (info) => info.terrain == 'wall' || info.type != 'terrain');
                var bad = Array();
                for(var i = 0; i < check.length; i++) {
                    bad.push(String(check[i].x) + '|' + String(check[i].y));
                }
                sites = _.filter(sites, (info) => (!(bad.includes(String(info.x) + '|' + String(info.y)))) && 
                                ((info.y == spawn.pos.y - 9 && (info.x < spawn.pos.x - 2 || info.x > spawn.pos.x + 2)) ||
                                 (info.y == spawn.pos.y + 9 && (info.x < spawn.pos.x - 2 || info.x > spawn.pos.x + 2)) ||
                                 (info.x == spawn.pos.x - 9 && (info.y < spawn.pos.y - 2 || info.y > spawn.pos.y + 2)) ||
                                 (info.x == spawn.pos.x + 9 && (info.y < spawn.pos.y - 2 || info.y > spawn.pos.y + 2))));
                // build one site per tick
                if(sites.length) {
                    spawn.room.createConstructionSite(sites[0].x, sites[0].y, STRUCTURE_EXTENSION);
                }
            }
            // we move on to the next stage
            else {
                spawn.memory.building++;
            }
        }
        // first tower building stage
        else if(spawn.memory.building == 2 && conLvl > 2) {
            // get an array of the built towers and an array of the tower construction sites
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            // build the tower
            if(tow_str.length + tow_con.length < 1) {
                spawn.room.createConstructionSite(spawn.pos.x + 7, spawn.pos.y, STRUCTURE_TOWER);
            }
            // we move on to the next tower
            else {
                spawn.memory.building++;
            }
        } 
        // the second tower building stage
        else if(spawn.memory.building == 3 && conLvl > 3) {
            // get an array of the built towers and an array of the tower construction sites
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            // build the tower
            if(tow_str.length + tow_con.length < 2) {
                spawn.room.createConstructionSite(spawn.pos.x - 7, spawn.pos.y, STRUCTURE_TOWER);
            }
            // we move on to the next tower
            else {
                spawn.memory.building++;
            }
        }
        else if(spawn.memory.building == 4 && conLvl > 6) {
            // get an array of the built towers and an array of the tower construction sites
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            // build the tower
            if(tow_str.length + tow_con.length < 2) {
                spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y - 7, STRUCTURE_TOWER);
            }
            // we move on to the next tower
            else {
                spawn.memory.building++;
            }
        }
        else if(spawn.memory.building == 5 && conLvl > 7) {
            // get an array of the built towers and an array of the tower construction sites
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            // build the tower
            if(tow_str.length + tow_con.length < 2) {
                spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y + 7, STRUCTURE_TOWER);
            }
            // we move on to the next stage
            else {
                spawn.memory.building++;
            }
        }
    }
};

module.exports = roleSpawner;