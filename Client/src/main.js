import * as PIXI from 'pixi.js'
import Application from './Application';
import TitleScreen from './screens/TitleScreen'
var size = [1920, 1080];
var ratio = size[0] / size[1];
//var stage = new PIXI.Stage(0x333333, true);
//var renderer = PIXI.autoDetectRenderer(size[0], size[1], null);

const app = new PIXI.Application({ transparent: true ,size:size,ratio:ratio});
var renderer = PIXI.autoDetectRenderer(size[0], size[1], null);
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);



app.loader.add('logo', 'images/logo.png')
app.loader.add('background', 'images/background.jpg')
app.loader.add('colyseus', 'images/colyseus.png')

app.loader.add('clock-icon', 'images/clock-icon.png')
app.loader.add('board', 'images/board.png')

app.loader.add('cards', 'images/card/cards.json');
app.loader.add('table', 'images/card/table.png');
app.loader.add('timerBoard', 'images/timer-board.png');
app.loader.add('playerBoard', 'images/player-board2.png');
app.loader.add('deckBoard', 'images/deck-board.png');
app.loader.add('messageBoard', 'images/message-board.png');
app.loader.add('deckBoardMask', 'images/deck-board-mask.png');
app.loader.add('playerSlot', 'images/player-slot.png');
app.loader.add('roleBoard', 'images/role-board.png');
app.loader.add('lobbyBoard', 'images/lobbyBoard.jpg');

app.loader.add('test', 'images/tower/test.png');
app.loader.add('testJson', 'images/tower/test.json');
app.loader.add('tb', 'images/tower/tb.json');
app.loader.load((loader, resources) => {
  var loading = document.querySelector('.loading');
  document.body.removeChild(loading);

  console.log("app.loader.load",loader)

  //const bg = new PIXI.Sprite(resources.background.texture);
 // app.stage.addChild(bg);
 // console.log('bg',bg)

  var _app = new Application(app)
   _app.gotoScene(TitleScreen,app)
  _app.update()
  
});


/*
var loader = new PIXI.loaders.Loader();
loader.add('logo', 'images/logo.png')
loader.add('background', 'images/background.jpg')
loader.add('colyseus', 'images/colyseus.png')

loader.add('clock-icon', 'images/clock-icon.png')
loader.add('board', 'images/board.png')

loader.add('cards', 'images/card/cards.json');
loader.add('table', 'images/card/table.png');
loader.add('timerBoard', 'images/timer-board.png');
loader.add('playerBoard', 'images/player-board2.png');
loader.add('deckBoard', 'images/deck-board.png');
loader.add('messageBoard', 'images/message-board.png');
loader.add('deckBoardMask', 'images/deck-board-mask.png');
loader.add('playerSlot', 'images/player-slot.png');
loader.add('roleBoard', 'images/role-board.png');

loader.add('test', 'images/tower/test.png');
loader.add('testJson', 'images/tower/test.json');
loader.add('tb', 'images/tower/tb.json');


loader.on('complete', () => {
  console.log("load complete",loader.resources.testJson)



  var app = new Application(loader)
  

  app.gotoScene(TitleScreen,loader)
  app.update()
}
const sprites = {};

loader.load();
*/
/*

*/