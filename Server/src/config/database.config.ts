import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core';
import options from './mikro-orm.config';

import { User } from "../entities/UserEntity";
import { Character } from "../entities/CharacterEntity";

/**
 * This demo makes use of Mikro ORM to manage the database connection and CRUD operations of our User entity (https://mikro-orm.io/)
 */

export const DI = {} as {
  orm: MikroORM,
  em: EntityManager,
  userRepository: EntityRepository<User>,
  characterRepository: EntityRepository<Character>,
};

/**
 * Initiate connection to the database
 */
export async function connect() {

  options.clientUrl = process.env.DEMO_DATABASE

  DI.orm = await MikroORM.init(options);

  DI.em = DI.orm.em;

}