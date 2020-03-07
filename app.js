const tmi = require('tmi.js')
const request = require('request')
const fs = require('fs')

require('dotenv').config()

const opts = {
    identity: {
        username: process.env.BOT_CHANNEL,
        password: process.env.PASS,
    }, 
    channels: [
        process.env.MY_CHANNEL
    ]
}

const client = new tmi.client(opts)

var chatHistory = fs.readFileSync('chat-history.json', 'utf-8')
chatHistory = chatHistory.length ? JSON.parse(chatHistory) : []


//console.log(chatHistory)


//console.log(JSON.parse(chatHistory))

const onMessageHandler = (target, context, message, self) => {
    if (self) { return }

    var newMessage = {message: message, user: context.username, time: new Date()}
    //console.log(typeof chatHistory)
    chatHistory.push(newMessage)
    fs.writeFile('chat-history.json', JSON.stringify(chatHistory), () => console.log('message saved'))

    if (message == "!test"){
        client.say(target, 'chatbot is working')
    }
    if (message == "!wr"){
        getNmgWr(wrMessage => client.say(target, wrMessage))
    }

    if(message == "!follow"){
        client.say(target, 'Follow me')
    }

    if(message == "!moan"){
        client.say(target, 'oooooh yeeeeeaaah so nice! mmmmmmmmmmmmm')
    }

    if(message == "!squad"){
        client.say(target, 'Follow the homies - FTSN_Nation : twitch.tv/ftsn_nation // HypnoticRL : youtube.com/c/hypnoticRL')
    }

    if(message.startsWith('!ban')){
        client.say(target, (message.split(' ')[1] || context.username) + ' is officially banned for life')
    }

    if(message.startsWith('!shoutout') && (context.mod || context.badges.broadcaster)){
        client.say(target, 'Shout out to ' + message.split(' ')[1] + ' for following!')
    }

    if(message == "!hypno" && context.username === "hypnotic_rl"){
        client.say(target, 'The chat has been hypnotized')
    }
    
    if(message == "!rules"){
        client.say(target, 'No spamming and no talking shit on anyone but the streamer')
    }

    if(message == '!history'){
        client.say(target, seeMyHistory(context.username))
    }
} 

const getNmgWr = (callback) => {
    // Make request to Speedrun.com to get the leaderboard
    request({url: process.env.NMG_RECORD_URL, json: true}, (err, res) => {
        var topRun = res.body.data.runs[0].run
        var bestTime = topRun.times.primary
        var userUrl = topRun.players[0].uri
        var link = topRun.videos.links[0].uri.split('//')[1]

        // Make a second request to get username of first place speedrun
        request({url: userUrl, json: true}, (err, res) => {
            var username = res.body.data.names.international
            callback(`No Major Glitches world record is ${getTimeStr(bestTime)} by ${username} - ${link}`)
        })
    })
}

const seeMyHistory = username => {
    const myMessages = chatHistory.filter(message => message.user === username && message.message[0] !== '!')
    if (!myMessages){
        return 'No message history'
    }
    return myMessages.map(obj => obj.message)[Math.floor(Math.random() * myMessages.length)]

    // filter out commands from history
    // add date to history 
    // be able check other peoples history
}

const getTimeStr = time => {
    var minutes = time.split('M')[0].split('T')[1]
    var seconds = time.split('M')[1].split('S')[0]
    return minutes + ':' + seconds
}

client.on('message', onMessageHandler)

client.on('connected', () => console.log('chatbot connected'))

client.connect()