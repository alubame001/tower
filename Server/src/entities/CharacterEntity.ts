import { Entity, Property } from "@mikro-orm/core";
import { AvatarState } from "../rooms/schema/AvatarState";
import { BaseEntity } from './BaseEntity';

/**
 * Entity to represent the character in the database and throughout the server 
 */
@Entity()
export class Character extends BaseEntity {    
    @Property() name!: string;   
    @Property() brief: string;
    @Property() age: string;
    @Property() sexual: string;
    @Property() father: string ;
    @Property() mother: string ;
}