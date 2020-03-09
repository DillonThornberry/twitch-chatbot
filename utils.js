const request = require('request')

require('dotenv').config()

const checkCredentials = (context, option) => {
    if (option === 'mod' && (!context.mod && !context.badges.broadcaster)){
        return false
    }
    return true
}

const getNmgWr = (callback) => {
    // Make request to Speedrun.com to get the leaderboard
    request({url: process.env.NMG_RECORD_URL, json: true}, (err, res) => {
        var topRun = res.body.data.runs[0].run
        var bestTime = topRun.times.primary
        var userUrl = topRun.players[0].uri
        var link = topRun.videos.links[0].uri.split('//')[1]
        //console.log('first request = ' + !!res)

        // Make a second request to get username of first place speedrun
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

const seeMyHistory = (username, chatHistory) => {
    const myMessages = chatHistory.filter(chat => chat.user === username && chat.message[0] !== '!')
    if (!myMessages){
        return 'No message history'
    }
    return myMessages.map(chat => chat.message)[Math.floor(Math.random() * myMessages.length)]
}

module.exports = {
    checkCredentials,
    getNmgWr,
    seeMyHistory
}