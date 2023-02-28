const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const handledChats = new Set();


// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    authStrategy: new LocalAuth({   
        session: sessionData, clientId: "client-one"
    })
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    if (session) {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
});


// qr code 
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});


client.on('ready', () => {
    console.log('Client is ready!');



});

client.on('message', async msg => {
    if (msg.type === 'chat' && !handledChats.has(msg.from)) {
        handledChats.add(msg.from);
        const chat = await msg.getChat();
        const reply = `You said: ${msg.body}`;
        await chat.sendMessage(reply);

        // Send a message back to the user in 5 minutes
        setTimeout(async () => {
            const chat = await msg.getChat();
            const reply = `Thanks for your message!`;
            await chat.sendMessage(reply);
        }, 1 * 60 * 1000);
    }
});




client.initialize();
