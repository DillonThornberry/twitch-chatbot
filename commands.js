const utils = require('./utils.js')
const spotify = require('./spotify')

const ban = (callback, info) => {
    callback((info.extra || info.context.username) + ' is officially banned for life')
}

const commands = (callback, info) => {
    if (utils.checkCredentials(info.context, 'mod')){
        return callback(Object.keys(module.exports).reduce((a,c) => a + c + ', ', ''))
    }
    callback('Mobile: see "info" tab | Desktop: scroll down')
}

const follow = callback => {
    callback('Follow this channel if you like to party')
}

const followage = (callback, info) => {
    utils.getFollowage(info.context.username, followTime => {
        if (!followTime){
            return follow(callback)
        }
        callback(info.context.username + ' has been following for ' + followTime)
    })
}

const history = (callback, info, history) => {
    if (utils.checkCredentials(info.context, 'mod') && info.extra){
        var user = info.extra[0] === '@' ? info.extra.slice(1) : info.extra
        return callback(utils.seeMyHistory(user, history) || `no history to show for ${user}`)
    }
    callback(utils.seeMyHistory(info.context.username, history) || 'you have no chat history')
}

const hypno = (callback, info) => {
    if (info.context.username !== 'hypnotic_rl'){
        return 
    }
    callback('The chat has been hypnotized')
}

const moan = callback => {
    callback('oooooh yeeeeeaaah so nice! mmmmmmmmmmmmm')
}

const rules = callback => {
    callback('No spamming and no talking shit on anyone but the streamer')
}

const shoutout = (callback, info) => {
    if (!utils.checkCredentials(info.context, 'mod')){
        console.log('credentials failed')
        return
    }
    console.log('creds passed')
    callback('Shoutout to ' + (info.extra || 'that guy') + ' for following!')
}

const squad = callback => {
    const homies = ['FTSN_Nation: twitch.tv/ftsn_nation', 'HypnoticRL: youtube.com/u/hypnoticrl']
    callback('Follow the squad:')
    for (var homie of homies){
        callback(homie)
    }
}

const test = callback => {
    callback('test')
}

const testspotify = callback => {
    spotify.test(callback)
}

const uptime = callback => {
    utils.getUptime(callback)
}

const wr = callback => {
    utils.getNmgWr(callback)
}

module.exports = {
    ban,
    commands,
    follow,
    followage,
    history,
    hypno,
    moan,
    rules,
    shoutout,
    squad,
    test,
    testspotify,
    uptime,
    wr,
}