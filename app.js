const tmi = require('tmi.js')
const fs = require('fs')
const commands = require('./commands.js')

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

if (!chatHistory.length){
    process.exit(1)
}

chatHistory = JSON.parse(chatHistory)

const onMessageHandler = (target, context, message, self) => {
    if (self) { return }

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

    var newMessage = {message: message, user: context.username, time: new Date()}
    chatHistory.push(newMessage)
    fs.writeFile('chat-history.json', JSON.stringify(chatHistory), () => console.log('message saved'))

}

client.on('message', onMessageHandler)

client.on('connected', () => console.log('chatbot connected'))

client.connect()