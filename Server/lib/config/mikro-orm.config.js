"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserEntity_1 = require("../entities/UserEntity");
const CharacterEntity_1 = require("../entities/CharacterEntity");
/**
 * Mikro ORM Connection options object
 * If using a different database other than Mongo DB change
 * the "type" as necessary following the guidelines here: https://mikro-orm.io/docs/usage-with-sql
 *  */
const options = {
    type: 'mongo',
    entities: [UserEntity_1.User, CharacterEntity_1.Character],
    dbName: 'Colyseus_MMO_Demo'
};
exports.default = options;
