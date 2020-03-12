const request = require('request')
const fs = require('fs')

require('dotenv').config()

var accessToken = null

const addToQueue = (uri, callback) => {
    if (!uri.length){
        return callback('Not a valid Spotify URL or URI')
    }
    var vUri = validUri(uri)
    if (!vUri.length){
        return searchSong(uri,  newUri => {
            addToQueue(newUri, callback)
        })
    }
    
    var options = {
        url: 'https://api.spotify.com/v1/me/player/queue?uri=' + vUri,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    }

    request.post(options, (err, res) => {
        if (err || res.statusCode === '404' || res.statusCode === '403'){
            return callback('Song request failed')
        }
        options.url = 'https://api.spotify.com/v1/tracks/' + uri.split('track:')[1]
        request(options, (err, res) => {
            if (err || res.body.error){
                return callback('Not a valid Spotify URL or URI')
            }
            callback(res.body.name + ' by ' + res.body.artists[0].name + ' was added to the queue')
        })
    })

}

const getAccessToken = () => {
    //Load refresh token from json file
    const refreshToken = JSON.parse(fs.readFileSync('refresh-token.json', 'utf8')).refresh_token

    if (!refreshToken || !refreshToken.length) { 
        return console.log('no refresh token, getAccessToken failed') 
    }

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        json: true
    }
    // Make post request with request token to receive access token, and update it in state
    request.post(authOptions, (err, res) => {
        if (!err && res.statusCode === 200) {
            var token = res.body.access_token;
            accessToken = token
            return console.log('access token set')
        } else {
            return console.log('refresh token invalid')
        }
    })
}

const getCurrentTrack = callback => {
    var options = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    }

    request(options, (err, res) => {
        callback(res.body)
    })
}

const searchSong = (query, callback) => {
    var options = {
        url: 'https://api.spotify.com/v1/search?type=track&q=' + encodeURI(query),
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    }

    request(options, (err, res) => {
        if (!res.body.tracks.items.length){
            return callback('')
        } else {
            return callback(res.body.tracks.items[0].uri)
        }
    })

}

const skipTrack = callback => {
    getCurrentTrack(playInfo => {
        if (!playInfo.is_playing){
            return callback('Can\'t skip while music is paused')
        }

        var options = {
            url: 'https://api.spotify.com/v1/me/player/next',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
        }
    
        request.post(options, (err, res) => {
            callback('Song skipped')
        })
    })
}

const validUri = str => {
    if (str.startsWith('spotify:track:')){
        return str

    } else if (str.startsWith('https://open.spotify.com/track/')){
        var songId = str.split('track/')[1].split('?')[0]
        if (!songId.length){
            return ''
        }
        return 'spotify:track:' + songId

    } else {
        return ''
    }
} 

const test = (callback) => {
    var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };

      request.get(options, function(error, response, body) {
        if (error || response.body.error){
            return callback('Spotify currently unavailable')
        }
        callback(body.display_name + '\'s Spotify is connected');
      });
}

module.exports = {
    addToQueue,
    getAccessToken,
    getCurrentTrack,
    skipTrack,
    test
}