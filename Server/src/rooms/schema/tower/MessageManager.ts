import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema,filter,filterChildren} from "@colyseus/schema";
import { RoleCard} from "./TroubleRole";


export class Message extends Schema {   
    @type("string") id: string; 
    @type("string") content: string;
}
export class Reciver extends Schema {   
    @type("string") id: string; 
    @type("string") playerId: string; 
    @type("string") sessionId: string; 
    @filterChildren(function(
        this: Reciver, // the instance of the class `@filter` has been defined (instance of `Card`)
        client: Client, // the Room's `client` instance which this data is going to be filtered to
        value: Reciver['messages'], // the value of the field to be filtered. (value of `number` field)
        root: Schema // the root state Schema instance
    ) {
        return ((this.sessionId === client.sessionId)&&(this.sessionId !='')&&(this.sessionId!=undefined));
    })
   @type(["string"]) messages: string[] =   new ArraySchema<string>(); 
    
}


export class MessageManager extends Schema {   

    @type({ map: Reciver }) recivers = new MapSchema();


    addMessage(roleId:string,content:string){
       
       /*
        if (roleCard.robot){
            let reciver = this.recivers.get(roleCard.id);
            if (reciver) 
            reciver.messages.push(content)
        }



       let reciver2 = this.recivers.get(roleCard.seatId);
       if (reciver2) 
             reciver2.messages.push(content)
             */

             let reciver = this.recivers.get(roleId);
             if (reciver) 
             reciver.messages.push(content)        
    }
}





