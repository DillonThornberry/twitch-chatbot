const tmi = require('tmi.js')
const request = require('request')

require('dotenv').config()

const nmgRecordUrl = 'https://www.speedrun.com/api/v1/leaderboards/w6jmm26j/category/zd38jgek'

const opts = {
    identity: {
        username: process.env.BOTCHANNEL,
        password: process.env.TOKEN,
    }, 
    channels: [
        process.env.MYCHANNEL
    ]
}

const client = new tmi.client(opts)

const onMessageHandler = (target, context, message, self) => {
    if (self) { return }
    
    if (message == "!test"){
        console.log('message received')
        console.log(context)

        client.say(target, "bot working")
    }
}

client.on('message', onMessageHandler)

client.on('connected', () => console.log('connected'))

client.connect()