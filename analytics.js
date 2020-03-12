const fs = require('fs')

const chatHistory = JSON.parse(fs.readFileSync('chat-history.json', 'utf8')).filter(chat => 
    chat.user !== 'americanape' && chat.user !== 'americanape1' && chat.user !== 'robot_ape'
)

const commandsByUsage = () => {
    var output = {}
    for (var chat of chatHistory){
        if (chat.message[0] === '!'){
            const command = chat.message.slice(1).split(' ')[0]
            if (output[command]){
                output[command]++
            } else {
                output[command] = 1
            }
        }
    }
    return output
}

const chatsByUser = () => {
    var output = {}
    for (var chat of chatHistory) {
        var user = chat.user
        if (!output[user]) {
            output[user] = { chat: 0, commands: 0}
        }
        if (chat.message[0] === '!'){
            output[user].commands++
        } else {
            output[user].chat++
        }
    }
    return output
}

console.log(commandsByUsage())
console.log(chatsByUser())
