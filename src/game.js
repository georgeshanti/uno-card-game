var events = require('events');
const { Op } = require('sequelize');
const db = require('db/models');

class Game extends events.EventEmitter{
    constructor(){
        super()
    }
    async update(){
        var players = await db.Player.findAll();
        var playerNames = players.map(x=>x.name);
        var cards = await db.Card.findAll({
            where: {
                possesion:{
                    [Op.in]: playerNames
                }
            }
        });
        var currentCard = await db.Card.findOne({
            where: {
                possesion: "current"
            }
        });
        var game = await db.Game.findOne();
        var gameState = {
            currentPlayer: game.currentPlayer,
        }
        var _players = {};
        for(var player of players){
            _players[player.name] ={
                "name": player.name,
                "playerId": player.playerId,
                "position": player.position,
                "won": player.won,
                "active": player.active,
                "cards": []
            }
        }
        for(var card of cards){
            var player = card.possesion;
            _players[player]["cards"].push(card)
        }
        gameState['players'] = _players;
        gameState['currentCard'] = currentCard
        gameState['currentPlayer'] = game.currentPlayer
        gameState['color'] = game.color
        gameState['direction'] = game.direction
        gameState['drawable'] = game.drawable
        return gameState;
    }
}

module.exports = Game;