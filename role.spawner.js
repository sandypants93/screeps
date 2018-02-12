function energyTotal(spawn) {
    var extensions = spawn.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_EXTENSION}
        );
    var exEnergy = 0, len = extensions.length;
    while (len--) {
        exEnergy += extensions[len].energy;
    }
    return spawn.energy + exEnergy;
}
var roleSpawner = {
    /** @param {Spawn} spawn **/
    run: function(spawn) {
        var harvesters = 0;
        var upgraders = 0;
        var builders = 0;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.my) {
                switch(creep.memory.role) {
                    case 'harvester':
                        harvesters++;
                        break;
                    case 'upgrader':
                        upgraders++;
                        break;
                    case 'builder':
                        builders++;
                        break;
                }
            }
        }
        var conLvl = spawn.room.controller.level;
        if(harvesters < spawn.memory.maxHarvesters) {
            var en = energyTotal(spawn);
            if(en >= 200) {
                var sources = spawn.room.find(FIND_SOURCES);
                var newName = spawn.name + '_harvester' + Game.time;
                if(en >= 500) {
                    spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                    {memory: {role: 'harvester', state: 1, src: sources[0].id, home: spawn.id}});
                }
                else {
                    spawn.spawnCreep([WORK, CARRY, MOVE], newName, {memory : {role : 'harvester', state: 1, src : sources[0].id, home: spawn.id}});
                }
            }
        }
        else if(upgraders < spawn.memory.maxUpgraders) {
            var en = energyTotal(spawn);
            if(en >= 200) {
                var sources = spawn.room.find(FIND_SOURCES);
                var newName = spawn.name + '_upgrader' + Game.time;
                if(en >= 500) {
                    spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                    {memory: {role: 'upgrader', state: 1, src: sources[0].id, home: spawn.id}});
                }
                else {
                    spawn.spawnCreep([WORK, CARRY, MOVE], newName, {memory : {role : 'upgrader', state: 1, src : sources[0].id, home: spawn.id}});
                }
            }
        }
        else if(builders < spawn.memory.maxBuilders) {
            var en = energyTotal(spawn);
            if(en >= 200) {
                var sources = spawn.room.find(FIND_SOURCES);
                var newName = spawn.name + '_builder' + Game.time;
                if(en >= 500) {
                    spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
                    {memory: {role: 'builder', state: 1, src: sources[0].id, home: spawn.id}});
                }
                else {
                    spawn.spawnCreep([WORK, CARRY, MOVE], newName, {memory : {role : 'builder', state: 1, src: sources[0].id, home: spawn.id}});
                }
            }
        }
        if(spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '[' + spawn.name + '] spawning: ' + spawningCreep,
                spawn.pos.x,
                spawn.pos.y - 1, 
                {align : 'center', opacity : 0.8});
        }
        /* automated construction */
        if(spawn.memory.building == 0) {
            var sources = spawn.room.find(FIND_SOURCES);
            var con = spawn.room.controller;
            var plan = Array(), len = sources.length;
            var max
            while (len--) {
                for(var tile in spawn.pos.findPathTo(sources[len])) {
                    plan.push(String(tile.x) + '|' + String(tile.y));
                }
                for(var tile in con.pos.findPathTo(sources[len])) {
                    plan.push(String(tile.x) + '|' + String(tile.y));
                }
            }
            var sites = spawn.room.lookAtArea(0, 0, 49, 49, true, {
                filter: (site) => (String(site.x) + '|' + String(site.y)) in plan && site.type == 'terrain'});
            if(sites.length) {
                spawn.room.createConstructionSite(sites[0].x, sites[0].y, STRUCTURE_ROAD);
            }
            else {
                spawn.memory.building++;
            }
        }
        if(spawn.memory.building == 1 && conLvl > 1) {
            var sites = spawn.room.lookAtArea((spawn.pos.y - 10), (spawn.pos.x - 10), (spawn.pos.y + 10), (spawn.pos.x + 10), true);
            var check = _.filter(sites, (info) => info.terrain == 'wall' || info.type != 'terrain');
            var bad = Array();
            for(var i = 0; i < check.length; i++) {
                bad.push(String(check[i].x) + '|' + String(check[i].y));
            }
            sites = _.filter(sites, (info) => (!(bad.includes(String(info.x) + '|' + String(info.y)))) && 
                            ((info.y == spawn.pos.y - 10 && (info.x < spawn.pos.x - 2 || info.x > spawn.pos.x + 2)) ||
                             (info.y == spawn.pos.y + 10 && (info.x < spawn.pos.x - 2 || info.x > spawn.pos.x + 2)) ||
                             (info.x == spawn.pos.x - 10 && (info.y < spawn.pos.y - 2 || info.y > spawn.pos.y + 2)) ||
                             (info.x == spawn.pos.x + 10 && (info.y < spawn.pos.y - 2 || info.y > spawn.pos.y + 2))));
            if(sites.length) {
                spawn.room.createConstructionSite(sites[0].x, sites[0].y, STRUCTURE_WALL);
            }
            else {
                spawn.memory.building++;
            }
        }
        else if(spawn.memory.building == 2 && conLvl > 1) {
            var ex_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_EXTENSION});
            var ex_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_EXTENSION});
            if(ex_con.length + ex_str.length < 5) {
                var sites = spawn.room.lookAtArea(spawn.pos.y - 9, spawn.pos.x - 9, spawn.pos.y + 9, spawn.pos.x + 9, true);
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
                if(sites.length) {
                    spawn.room.createConstructionSite(sites[0].x, sites[0].y, STRUCTURE_EXTENSION);
                }
            }
            else {
                spawn.memory.building++;
            }
        }
        else if(spawn.memory.building == 3 && conLvl > 2) {
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            if(tow_str.length + tow_con.length < 1) {
                spawn.room.createConstructionSite(spawn.pos.x + 7, spawn.pos.y, STRUCTURE_TOWER);
            }
            else {
                spawn.memory.building++;
            }
        } 
        else if(spawn.memory.building == 4 && conLvl > 3) {
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            if(tow_str.length + tow_con.length < 2) {
                spawn.room.createConstructionSite(spawn.pos.x - 7, spawn.pos.y, STRUCTURE_TOWER);
            }
            else {
                spawn.memory.building++;
            }
        }
        else if(spawn.memory.building == 5 && conLvl > 6) {
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            if(tow_str.length + tow_con.length < 2) {
                spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y - 7, STRUCTURE_TOWER);
            }
            else {
                spawn.memory.building++;
            }
        }
        else if(spawn.memory.building == 6 && conLvl > 7) {
            var tow_str = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_TOWER});
            var tow_con = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) => site.structureType == STRUCTURE_TOWER});
            if(tow_str.length + tow_con.length < 2) {
                spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y + 7, STRUCTURE_TOWER);
            }
            else {
                spawn.memory.building++;
            }
        }
    }
};

module.exports = roleSpawner;