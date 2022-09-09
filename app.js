import express from 'express';
const app = express();

import { getData } from './client.js';
import fs from 'fs';
import imageToBase64 from 'image-to-base64';

app.get('/', (req, res) => {
    const html = fs.readFileSync('./home.html', 'utf8');
    res.send(html);
});

let card
app.get('/:id', async (req, res) => {
    getData(req.params.id).then(async data => {
        let user 
        let username , firstName , lastName , bio , isVerified , timeCreated , pfp , banner
        let pfp64 , banner64

        try {
            user = data.userByUsername;
            username = user.username;
            firstName = user.firstName;
            lastName = user.lastName;
            bio = user.bio;
            isVerified = user.isVerified;
            timeCreated = user.timeCreated;
            
            pfp = req.query.pfp || "https://cdn.discordapp.com/attachments/1017778549169590372/1017806356188762162/replit.png";
            banner = req.query.banner || "https://cdn.discordapp.com/attachments/1017778549169590372/1017782722963460146/repl_code.png";
        } catch (error) {
            res.send('User not found or something went wrong.\n' + error);
            return;
        }

        // lastName
        lastName = lastName ? lastName : ''; 
        
        // bio
        try {
            bio = bio.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            bio = bio.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
        } catch (error) {
            bio = '';
        }

        if (bio.length > 100) {
            bio = bio.replace(/(.{40})/g, '$1\n');
        } else if (bio.length > 50) {
            bio = bio.replace(/(.{30})/g, '$1\n');
        } 

        // verified
        isVerified = isVerified ? '✅' : '❎';

        // time created
        let date = new Date(timeCreated);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        timeCreated = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        // pfp
        if(pfp) {
            pfp64 = await imageToBase64(pfp)
            pfp64 = `data:image/png;base64,${pfp64}`;
        } else {
            pfp64 = '';
        }

        // banner
        if (banner) {
            banner64 = await imageToBase64(banner)
            banner64 = `data:image/png;base64,${banner64}`
        } else {
            banner64 = ""
        }

        // card
        card = fs.readFileSync('./assets/repl.svg', {encoding: 'utf-8'}).toString()
        card = card.replace('[username]', "@"+username);
        card = card.replace('[bio]', bio);
        card = card.replace('[tick]', isVerified);
        card = card.replace('[time]', "Created on : "+ timeCreated);
        card = card.replace('[firstName]', firstName);
        card = card.replace('[lastName]', lastName);
        card = card.replace('[pfp]', pfp64);
        card = card.replace('[banner]', banner64);
        
        res.writeHead(200, {'Content-Type': 'image/svg+xml'})
        res.end(card)
    });
});

app.listen(3000, () => {
    console.log('http://localhost:3000');
});