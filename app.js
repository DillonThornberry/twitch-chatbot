const tmi = require('tmi.js')
const request = require('request')

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

const onMessageHandler = (target, context, message, self) => {
    if (self) { return }

    console.log('message received')

    if (message == "!test"){
        client.say(target, 'chatbot is working')
    }
    if (message == "!wr"){
        getNmgWr(wrMessage => client.say(target, wrMessage))
    }
}

const getNmgWr = (callback) => {
    request({url: process.env.NMG_RECORD_URL, json: true}, (err, res) => {
        var topRun = res.body.data.runs[0].run
        var bestTime = topRun.times.primary
        var userUrl = topRun.players[0].uri
        var link = topRun.videos.links[0].uri.split('//')[1]

        request({url: userUrl, json: true}, (err, res) => {
            var username = res.body.data.names.international
            callback(`No Major Glitches world record is ${getTimeStr(bestTime)} by ${username} - ${link}`)
        })
    })
}

const getTimeStr = time => {
    var minutes = time.split('M')[0].split('T')[1]
    var seconds = time.split('M')[1].split('S')[0]
    return minutes + ':' + seconds
}

client.on('message', onMessageHandler)

client.on('connected', () => console.log('chatbot connected'))

client.connect()