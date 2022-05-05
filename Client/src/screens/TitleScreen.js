import * as PIXI from 'pixi.js'
import Application from '../Application'
import GameScreen from './GameScreen'
import LobbyScreen from './LobbyScreen'
//import ReconnectScreen from './ReconnectScreen'
//import TableScreen from './TableScreen'


export default class TitleScreen extends PIXI.Container {
  constructor (app) {
    super()
    this.app = app;
  //  console.log(app)
    this.loader = app.loader
   // console.log("this.loader",this.loader)


    var id = this.loader.resources["tb"].textures; 
    this.soldier = new PIXI.Sprite(id["soldier.png"])  

    this.title =  new PIXI.Sprite(app.loader.resources.logo.texture);
    this.title.pivot.x = this.title.width / 2
    this.addChild(this.title)
    this.addChild(this.soldier)

    this.instructionText = new PIXI.Text("开始界面", {
      font: "62px JennaSue",
      fill: 0x000,
      textAlign: 'center'
    })
    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = this.instructionText.height / 2
    this.addChild(this.instructionText)
    this.colyseus = new PIXI.Sprite(app.loader.resources.colyseus.texture);
    this.colyseus.pivot.x = this.colyseus.width / 2
    this.addChild(this.colyseus)
    this.interactive = true
    this.once('click', this.startGame.bind(this))
    this.once('touchstart', this.startGame.bind(this))
    this.on('dispose', this.onDispose.bind(this))
    setTimeout(() => {
      //  this.systemTimeout.clear();
        this.startGame();
     }, 1*1000);    


  }

  transitionIn () {
    tweener.add(this.title).from({y: this.title.y - 10, alpha: 0}, 300, Tweener.ease.quadOut)
    tweener.add(this.colyseus).from({ y: this.colyseus.y + 10, alpha: 0 }, 300, Tweener.ease.quadOut)
    return tweener.add(this.instructionText).from({ alpha: 0 }, 300, Tweener.ease.quadOut)
  }

  transitionOut () {
    tweener.remove(this.title)
    tweener.remove(this.colyseus)
    tweener.remove(this.instructionText)
    tweener.add(this.title).to({y: this.title.y - 10, alpha: 0}, 300, Tweener.ease.quintOut)
    tweener.add(this.colyseus).to({ y: this.colyseus.y + 10, alpha: 0 }, 300, Tweener.ease.quintOut)
    return tweener.add(this.instructionText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
  }

  startGame () {
    
   // this.emit('goto', GameScreen,this.loader)
    this.emit('goto', LobbyScreen,this.app)

  }

  onResize () {
    this.title.x = Application.WIDTH / 2;
    this.title.y = Application.MARGIN
    this.instructionText.x = Application.WIDTH / 2
    this.instructionText.y = Application.HEIGHT / 2 - this.instructionText.height / 3.8
    this.colyseus.x = Application.WIDTH / 2
    this.colyseus.y = Application.HEIGHT - this.colyseus.height - Application.MARGIN
  }

  onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
  }

}




