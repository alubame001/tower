import { matchMaker,ServerError } from "colyseus";
import { DI } from "../config/database.config";
import { User } from "../entities/UserEntity";
import { Character } from "../entities/CharacterEntity";
import logger from "../helpers/logger";
import * as matchmakerHelper from "../helpers/matchmakerHelper";
import { Vector3 } from "../helpers/Vectors";
import { TableNotFoundException } from "@mikro-orm/core";

const bcrypt = require ('bcrypt');
const saltRounds = 10;
// Middleware
//===============================================
/**
 * Character  for consistency
 */

/**
 * Simple function for creating a new user account.
 * With successful account creation the user will be matchmaked into the first room.
 * @param req 
 * @param res 
 * @returns 
 */
export async function add(req: any, res: any) {
    try {
       // console.log(req.body)
        // Check if the necessary parameters exist
        
        if (!req.body.name || !req.body.brief || !req.body.age || !req.body.sexual || !req.body.father || !req.body.mother ) {

            logger.error(`*** Character addError - New Character must have a name, and brief!..........`);
            throw " Character addError !";
            return;
        }      

      
        const characterRepo = DI.em.fork().getRepository(Character);
        let character = await characterRepo.findOne({ name: req.body.name });
        if (!character) {

            //let password = await encryptPassword(req.body.password);
            
            // Create a new user
            character = characterRepo.create({
                name: req.body.name,               
                brief:  req.body.brief,
                age:  req.body.age,
                sexual:  req.body.sexual,
                father:  req.body.father,
                mother:  req.body.mother              
            });
            // Save the new user to the database

            await characterRepo.persistAndFlush(character);        
        }
        else {
            logger.error(`*** Scharacter with that name already exists!`);
            throw "character with that name already exists!";
            return;
        }

        const newUserObj = { ...character };
        //delete newUserObj.password; // Don't send the user's password back to the client

        res.status(200).json({
            error: false,
            output: {             
                user: newUserObj
            }
        });
    }
    catch (error) {
        res.status(400).json({
            error: true,
            output: error
        });
    }

}

export async function list(req: any, res: any) {
    const characterRepo = DI.em.fork().getRepository(Character);
    let characters = await characterRepo.findAll();
    let count = await characterRepo.count();
    try{
        res.status(200).json({
            error: false,
            output: {       
                count:count,      
                result:{characters} 
            }
        });     
    }
    catch (error) {
        res.status(400).json({
            error: true,
            output: error
        });
    }

}
export async function del(req: any, res: any) {
    try {
        const characterRepo = DI.em.fork().getRepository(Character);
        let result;
        if (req.body.id)
          result = await characterRepo.nativeDelete({ id: req.body.id });
       

        res.status(200).json({
            error: false,
            output: {   
                result:result
            }
        });    
    

   } catch (error) {
    res.status(400).json({
        error: true,
        output: error
    }); 
   }
}

/*
const books2 = await orm.em.find(Book, {}, {
  filters: { hasAuthor: false, long: true, writtenBy: { name: 'God' } },
});
*/
export async function update(req: any, res: any) {


         
}
export async function get(_name:string, res: any) {
   try {
        const characterRepo = DI.em.fork().getRepository(Character);

        let character = await characterRepo.findOne({ name: _name });
        if (!character){
            return null;
        } else {
        return character;
        }

   } catch (error) {
    res.status(400).json({
        error: true,
        output: error
    });
    }
   

}

export function prepContent(req: any, res: any, next: any) {
    if (req.body.name) {
        try {
            req.body.name = req.body.name.toLowerCase();
        }
        catch (err) {
            logger.error(`Error converting name to lower case`);
        }
    }

    next();
}