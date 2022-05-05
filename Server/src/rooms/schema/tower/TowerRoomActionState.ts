
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";



export class Action extends Schema {   
    @type("string") id: string; 
    @type("string") seatId: string; 
   // @type("string") target: string; 
    @type(["string"]) targets: string[] =   new ArraySchema<string>();
    @type("string") msg: string; 
    @type("number") round: number; 
    @type("number") targetAmount: number =1; 
    @type("boolean") done: boolean= false; 
}

export class ActionManager extends Schema {
    @type({ map: Action }) actions = new MapSchema();  
    addAction(id:string,seatId:string,round:number){
        var action :Action =new Action().assign({    
            id :id,   
            seatId:seatId,  
            done: false,               
            round : round
        }); 
        this.actions.set(action.id,action)
    }
    
}

