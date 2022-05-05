//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";

export class WishRole extends Schema {   
    @type("string") id: string; 
    @type("string") rid: string; 
    @type("string") name: string;
    @type("string") team: string;
    @type("string") seatId: string;
    @type("string") playerId: string;
    @type("number") idx: number;
    @type("boolean") happened: boolean=false;
    @type("boolean") assigned: boolean=false;
    @type("boolean") done: boolean=false;
    title():string{
        
         return "("+this.seatId+")"+ this.name;
  
    }

}
