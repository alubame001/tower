"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepContent = exports.get = exports.update = exports.del = exports.list = exports.add = void 0;
const database_config_1 = require("../config/database.config");
const CharacterEntity_1 = require("../entities/CharacterEntity");
const logger_1 = __importDefault(require("../helpers/logger"));
const bcrypt = require('bcrypt');
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
function add(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log(req.body)
            // Check if the necessary parameters exist
            if (!req.body.name || !req.body.brief || !req.body.age || !req.body.sexual || !req.body.father || !req.body.mother) {
                logger_1.default.error(`*** Character addError - New Character must have a name, and brief!..........`);
                throw " Character addError !";
                return;
            }
            const characterRepo = database_config_1.DI.em.fork().getRepository(CharacterEntity_1.Character);
            let character = yield characterRepo.findOne({ name: req.body.name });
            if (!character) {
                //let password = await encryptPassword(req.body.password);
                // Create a new user
                character = characterRepo.create({
                    name: req.body.name,
                    brief: req.body.brief,
                    age: req.body.age,
                    sexual: req.body.sexual,
                    father: req.body.father,
                    mother: req.body.mother
                });
                // Save the new user to the database
                yield characterRepo.persistAndFlush(character);
            }
            else {
                logger_1.default.error(`*** Scharacter with that name already exists!`);
                throw "character with that name already exists!";
                return;
            }
            const newUserObj = Object.assign({}, character);
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
    });
}
exports.add = add;
function list(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const characterRepo = database_config_1.DI.em.fork().getRepository(CharacterEntity_1.Character);
        let characters = yield characterRepo.findAll();
        let count = yield characterRepo.count();
        try {
            res.status(200).json({
                error: false,
                output: {
                    count: count,
                    result: { characters }
                }
            });
        }
        catch (error) {
            res.status(400).json({
                error: true,
                output: error
            });
        }
    });
}
exports.list = list;
function del(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const characterRepo = database_config_1.DI.em.fork().getRepository(CharacterEntity_1.Character);
            let result;
            if (req.body.id)
                result = yield characterRepo.nativeDelete({ id: req.body.id });
            res.status(200).json({
                error: false,
                output: {
                    result: result
                }
            });
        }
        catch (error) {
            res.status(400).json({
                error: true,
                output: error
            });
        }
    });
}
exports.del = del;
/*
const books2 = await orm.em.find(Book, {}, {
  filters: { hasAuthor: false, long: true, writtenBy: { name: 'God' } },
});
*/
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.update = update;
function get(_name, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const characterRepo = database_config_1.DI.em.fork().getRepository(CharacterEntity_1.Character);
            let character = yield characterRepo.findOne({ name: _name });
            if (!character) {
                return null;
            }
            else {
                return character;
            }
        }
        catch (error) {
            res.status(400).json({
                error: true,
                output: error
            });
        }
    });
}
exports.get = get;
function prepContent(req, res, next) {
    if (req.body.name) {
        try {
            req.body.name = req.body.name.toLowerCase();
        }
        catch (err) {
            logger_1.default.error(`Error converting name to lower case`);
        }
    }
    next();
}
exports.prepContent = prepContent;
