const express = require('express')
const port = 8000
const bodyParser = require('body-parser')
const Game = require('src/game')
const db = require('db/models')
const WebSocket = require('ws');
const Sequelize = require('sequelize');

COLORS = ["red", "yellow", "green", "blue"]

var gameApp = new Game();
const app = express()

app.use(bodyParser.json())
app.get('/api/game', async (req, res)=>{

    game = await db.Game.findOne();
    res.json(game);
})
app.post('/api/create', async(req, res) => {
    // Reset
    await db.Player.destroy({where: {}},{truncate: false})
    await db.Game.destroy({where: {}},{truncate: false})
    await db.Card.destroy({where: {}},{truncate: false})

    // Create Players
    var players = req.body['players']
    players = players.map((x,i)=>{ return {name: x.name, position: i, active: true, won: false, playerId: x.playerId} })
    players = await db.Player.bulkCreate(players, {returning: true})
    
    // Create Cards
    var cards = []
    for( color of COLORS ){
        for(var k=0; k<2; k++){
            for(var i=0; i<=9; i++)
                cards.push({color: color, value: i, special: false, possesion: "DECK"})
            cards.push( {color: color, value: "+2", special: false, possesion: "DECK"} )
            cards.push( {color: color, value: "reverse", special: false, possesion: "DECK"} )
            cards.push( {color: color, value: "skip", special: false, possesion: "DECK"} )
        }
    }
    for(var i=0; i<4; i++)
        cards.push( {color: null, value: "+4", special: true, possesion: "DECK"} )
    for(var i=0; i<4; i++)
        cards.push( {color: null, value: "Change color", special: false, possesion: "DECK"} )
    var cardNumbers = [...Array(104).keys()]
    for(var player of players){
        for(var cn=0; cn<4; cn++){
            var index = Math.floor(Math.random() * cardNumbers.length)
            var i = cardNumbers[index];
            var card = cards[i];
            card.possesion = player.name;
            cards[i] = card;
            cardNumbers.splice(index,1)
        }
    }
    var currentColor;
    {
        var index = Math.floor(Math.random() * cardNumbers.length)
        var i = cardNumbers[index];
        card = cards[i];
        card.possesion = "current";
        if(card.color==null)
            currentColor="red"
        else
            currentColor=card.color;
        cards[i] = card;
        cardNumbers.splice(index, 1)
    }
    await db.Card.bulkCreate(cards, {returning: true})
    res.send("No")

    // Create Game
    await db.Game.create({currentPlayer: 0, players: players.length, direction: true, color: currentColor}, {returning: true})
    res.send("No")
})

async function move(){
    console.log("moving")
    //Move to next player
    var game = await db.Game.findOne()
    var activePlayers = await db.Player.findAll()
    var noOfPlayers = activePlayers.length
    if(noOfPlayers<2){
        game.currentPlayer = -1;
    }else{
        console.log("Two or more players, ", typeof(noOfPlayers), noOfPlayers)
        var increment = game.direction?1:noOfPlayers-1;
        var currentPosition = parseInt(game.currentPlayer);
        var nextPosition = ( currentPosition+increment )%noOfPlayers;
        console.log("Found next player position, ", {position: nextPosition})
        var nextPlayer = await db.Player.findOne({
            where: {position: nextPosition}
        });
        console.log("Found next player position, ", {position: nextPosition})
        console.log("Found player")
        while(!nextPlayer.active){
            nextPosition = ( nextPosition+increment )%noOfPlayers;
            nextPlayer = await db.Player.findOne({
                where: {position: nextPosition}
            });
        }
        game.currentPlayer=nextPosition;
    }
    await game.save();
}


app.post('/api/skip', async(req, res) => {
    await move()
    gameApp.emit('update');
    res.send("Done")
})


app.post('/api/play-card', async(req, res) => {
    console.log("Request body: ", req.body)
    var card = req.body
    var id = card['id']
    var color = card['color']

    //Play the card
    var game = await db.Game.findOne();
    var playedCard = await db.Card.findOne({
        where: {'id': id }
    })
    if(["+2", "+4"].indexOf(playedCard.value) > -1){
        game.drawable+=parseInt(playedCard.value)
    }else{
        game.drawable=0
    }
    if(playedCard.value=="reverse"){
        game.direction = !game.direction
    }
    var currentCard = await db.Card.findOne({
        where: {'possesion': 'current' }
    })
    currentCard.possesion = "DECK";
    playedCard.possesion = "current";
    game.color = color;
    await game.save()
    await currentCard.save()
    await playedCard.save()
    console.log(playedCard.possesion)

    //Update player state
    var player = await db.Player.findOne({
        where: { position: game.currentPlayer }
    })
    var playerCards = await db.Card.findAll({
        where: {possesion: player.name}
    })
    if(playerCards.length==0){
        player.active = false;
        await player.save()
    }
    console.log("moving")


    var activePlayers = await db.Player.findAll({
        where: { 'active': true }
    })
    var noOfPlayers = activePlayers.length
    if(noOfPlayers<2){
        game.currentPlayer = -1;
    }else if(noOfPlayers==2 && ["skip", "reverse"].indexOf(playedCard.value)>-1){
        gameApp.emit('update')
    }else if(playedCard.value=="skip"){
        await move()
        await move()
        console.log("moved")
        gameApp.emit('update')
    }else{
        await move()
        gameApp.emit('update')
    }

    res.send("Done")
})
app.post('/api/draw-card', async(req, res) => {
    console.log("Request body: ", req.body)
    var game = await db.Game.findOne()
    var noOfCards = game.drawable==0?1:game.drawable
    currentPlayer = await db.Player.findOne({
        where: {position: game.currentPlayer}
    })
    console.log(noOfCards);
    var newCards = await db.Card.findAll({
        where: {'possesion': "DECK"},
        order: [
            Sequelize.fn( 'RANDOM' ),
          ],
        limit: noOfCards
    })
    for(var card of newCards){
        card.possesion = currentPlayer.name;
        await card.save()
    }
    game.drawable = 0;
    await game.save();

    if(noOfCards > 1){
        await move()
    }
    gameApp.emit('update');
    res.send("Done")
})

const wss = new WebSocket.Server({port: 9000});

wss.on('connection', function connection(connection) {
    var player = null;
    gameApp.on('update', async()=>{
        console.log("updating")
        var state = await gameApp.update();
        for(var i in state.players){
            if(state.players[i]['playerId']!=player){
                var playerobj = state.players[i];
                playerobj['cards'] = playerobj['cards'].length
                state.players[i] = playerobj;
            }
        }
        connection.send(JSON.stringify(state))
        state=null;
    })
    connection.on('message', (message)=>{
        player = (JSON.parse(message))["player"];
        gameApp.emit('update');
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
