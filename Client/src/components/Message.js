import * as PIXI from 'pixi.js'
import Application from '../Application'
import BuffBoard from './BuffBoard'


export default class Message extends PIXI.Container {

  constructor (loader) {
    super()   
    this.loader = loader;

    var id = loader.resources["tb"].textures; 
    this.background = new PIXI.Sprite(id["circle.png"])  

     this.addChild( this.background)
    //var maskGraphic = new PIXI.Graphics();
    this.isDraw = false;

  }
  
  reset(){

  }

  setup(){
      
  }








  create(data){
    

    
  }

  



  
  onSelect (sprite) {
    this.select(sprite)
  }

  select(sprite){
    this.playerBoard.selectedPlayerId = sprite.id;
    this.playerBoard.select(sprite);
  }
  
}
