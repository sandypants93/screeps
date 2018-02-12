var general = {
    run: function(room) {
        if(room.find(FIND_HOSTILE_CREEPS).length) {
            for(var name in Game.creeps) {
                if(Game.creeps[name].room == room) {
                    Game.creeps[name].memory.state = 1;
                }
            }
        }
        else {
            for(var name in Game.creeps) {
                if(Game.creeps[name].room == room && Game.creeps[name].memory.)
            }
        }
        
    }
}