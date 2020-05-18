import * as vstatic from "./static";

mp.events.add("playerDeath", (player) => {

    if(player.dimension == 0){
        player.spawn(vstatic.spawnPosition);
    }

});

mp.events.add("playerJoin", (player) => {
    player.model = 2841034142;
    player.spawn(vstatic.spawnPosition);
    player.outputChatBox(vstatic.prefix + "Welcome on the Vaorra Minigames server!");
    player.name = player.socialClub + " ["+player.id+"]";
    console.log(player.name + " ("+player.ip+") connected!");
});

mp.events.add("playerQuit", (player) => {
    console.log(player.name + " ("+player.ip+") disconnected!");
});

mp.events.add("consoleLog", (player, data) => {
    console.log(data);
});