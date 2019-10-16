function playerEnterVehicleHandler(player:any, vehicle:any, seat:any) {
    player.outputChatBox(`${player.name} got into the car with ID: ${vehicle.id}. Seat: ${seat}`);
    if (seat === -1)
        player.call("playerIsOnDriverSeat", []);
}
 
mp.events.add("playerEnterVehicle", playerEnterVehicleHandler);





 function playerExitVehicleHandler(player:any, vehicle:any) {
    player.outputChatBox(`${player.name} when out from vehicle with ID: ${vehicle.id}`);
    player.call("playerLeaveDriverSeat", []);
}

mp.events.add("playerExitVehicle", playerExitVehicleHandler);