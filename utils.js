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

const getFollowage = (username, callback) => {
    let followersUrl = "https://api.twitch.tv/helix/users/follows?to_id=" + process.env.MY_CHANNEL_ID
    getUserId(username, id => {
        followersUrl += "&from_id=" + id
        request({ url: followersUrl, headers: { "Client-ID": process.env.TWITCH_CLIENT_ID }, json: true }, (err, res) => {
            if (!res.body.data.length){
                return callback(null)
            }
            callback(getTimeDifference(new Date(res.body.data[0].followed_at)))
        })
    })
}

const getTimeDifference = date => {
    var diffInSeconds = Math.floor((new Date() - date) / 1000)
    const days = Math.floor(diffInSeconds / 86400)
    diffInSeconds -= days * 86400
    const hours = Math.floor(diffInSeconds / 3600)
    diffInSeconds -= hours * 3600
    const minutes = Math.floor(diffInSeconds / 60)
    var dayString = days ? days + ' day' + (days !== 1 ? 's' : '') + ', ' : ''
    return `${dayString}${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`
}

const getUptime = callback => {
    const getStreamUrl = "https://api.twitch.tv/helix/streams?user_id=" + process.env.MY_CHANNEL_ID 
    request({ url: getStreamUrl, headers: {"Client-ID": process.env.TWITCH_CLIENT_ID }, json: true }, (err, res) => {
        if (!res.body.data.length){
            return callback("we ain't even live!")
        }
        callback(getTimeDifference(new Date(res.body.data[0].started_at)))
    })
}

const getUserId = (username, callback) => {
    const getUserUrl = "https://api.twitch.tv/helix/users?login=" + username
    request({ url: getUserUrl, headers: { "Client-ID": process.env.TWITCH_CLIENT_ID }, json: true }, (err, res) => {
        callback(res.body.data[0].id)
    })
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
    getUptime,
    getFollowage,
    seeMyHistory
}