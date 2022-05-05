import { Command } from "@colyseus/command";
import { TowerRoomState } from "../schema/tower/TowerRoomState";
 
export class OnJoinCommand extends Command<TowerRoomState, {
    sessionId: string,aid:string
}> {
 
  execute({ sessionId ,aid}) {
    console.log("sesssionId!!!!!!!!!!!!!!!!!!!!!!!!",sessionId)
    console.log("aid!!!!!!!!!!!!!!!!!!!!!!!!",aid)
     console.log("start",this.state.dayDelay)
  }
 
}

