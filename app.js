const tmi = require('tmi.js')
const fs = require('fs')
const commands = require('./commands.js')
const spotify = require('./spotify')

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

// Load chat history from json and store in an array
var chatHistory = fs.readFileSync('chat-history.json', 'utf-8')

var infectedPeople = fs.readFileSync('infected-people.json', 'utf8')
var isInfected = false
var contagious = null

if (!chatHistory.length){
    process.exit(1)
}

chatHistory = JSON.parse(chatHistory)
infectedPeople = infectedPeople.length ? JSON.parse(infectedPeople) : []

// On startup and every 50 minutes, get a new access token for Spotify
spotify.getAccessToken()
setInterval(() => {
    spotify.getAccessToken()
}, 3000000)

const onMessageHandler = (target, context, message, self) => {
    if (self) { return }

    // If message is a command, call that command
    if (message[0] === '!'){
        var parsedMessage = message.slice(1).split(' ')
        var command = parsedMessage[0].toLowerCase()
        console.log(command)
        if (commands[command]) {
            commands[command](
                response => client.say(target, response), 
                {context, extra: parsedMessage.slice(1).join(' ')},
                chatHistory
            )
        }
    }

    if (infectedPeople.includes(context.username)){
        chatRoomInfectedBy(context.username)
    }

    if (isInfected && !infectedPeople.includes(context.username)){
        client.say(target, newInfected(context.username, contagious))
        client.say(target, 'There are currently ' + infectedPeople.length + ' infected people in this chat')
    }

    if((/corona/gi.test(message) || /virus/gi.test(message)) && !infectedPeople.includes(context.username)){
        client.say(target, newInfected(context.username))
        client.say(target, 'There are currently ' + infectedPeople.length + ' infected people in this chat')
    }

    console.log(infectedPeople)
    // Create a message object and push it into the chat history array, then store the array to json
    var newMessage = {message: message, user: context.username, time: new Date()}
    chatHistory.push(newMessage)
    fs.writeFile('chat-history.json', JSON.stringify(chatHistory), () => console.log('message saved'))

}

const chatRoomInfectedBy = username => {
    isInfected = true
    contagious = username
    console.log('infection started at ' + new Date())
    setTimeout(() => {
        if (contagious === username){
            console.log('infection ended at ' + new Date())
            isInfected = false
            contagious = null
        }
        
    }, 30000)
}

const newInfected = (infected, infector) => {
    infectedPeople.push(infected)
    fs.writeFile('infected-people.json', JSON.stringify(infectedPeople), () => {
        console.log('infected people updated')
    })
    chatRoomInfectedBy(infected)
    return infected + ' caught the coronavirus' + (infector ? ' from ' + infector : '')
}

client.on('message', onMessageHandler)

client.on('connected', () => console.log('chatbot connected'))

client.connect()