const request = require('request')
const fs = require('fs')

require('dotenv').config()

var accessToken = null

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
    request.post(authOptions, function(err, res) {
        if (!err && res.statusCode === 200) {
            var token = res.body.access_token;
            accessToken = token
            return console.log('access token set')
        } else {
            return console.log('refresh token invalid')
        }
    })
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
    getAccessToken,
    test
}