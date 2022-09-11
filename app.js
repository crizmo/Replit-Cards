import express from 'express';
const app = express();

import { getData } from './client.js';
import { isImage } from './val_url.js';
import fs from 'fs';
import imageToBase64 from 'image-to-base64';

import dotenv from 'dotenv';
dotenv.config();

import { Webhook, MessageBuilder } from 'discord-webhook-node';
const hook = new Webhook(process.env.WEBHOOK_URL);

app.get('/', (req, res) => {
    const html = fs.readFileSync('./home.html', 'utf8');
    res.send(html);
});

let card
app.get('/card/:id', async (req, res) => {
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

            if(req.query.pfp){
                if(isImage(req.query.pfp)){
                    pfp = req.query.pfp;
                } else {
                    pfp = "https://cdn.discordapp.com/attachments/1017778549169590372/1017806356188762162/replit.png";
                }
            } else {
                pfp = "https://cdn.discordapp.com/attachments/1017778549169590372/1017806356188762162/replit.png";
            }

            if(req.query.banner){
                if(isImage(req.query.banner)){
                    banner = req.query.banner;
                } else {
                    banner = "https://cdn.discordapp.com/attachments/1017778549169590372/1017782722963460146/repl_code.png";
                }
            } else {
                banner = "https://cdn.discordapp.com/attachments/1017778549169590372/1017782722963460146/repl_code.png";
            }
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

        if (bio.length > 50) {
            bio = bio.replace(/(.{45})/g, '$1\n');
            bio = bio.substring(0, 145) + ' ...';
        } else {
            bio = bio.substring(0, 50);
        }

        // verified
        isVerified = isVerified ? '&#x2705;' : '&#10062;';

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
        card = fs.readFileSync('./assets/large.svg', {encoding: 'utf-8'}).toString()
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

app.get('/mini/:id', async (req, res) => {
    getData(req.params.id).then(async data => {
        let user 
        let username , bio , isVerified , timeCreated , pfp , banner
        let pfp64 , banner64

        try {
            user = data.userByUsername;
            username = user.username;
            bio = user.bio;
            isVerified = user.isVerified;
            timeCreated = user.timeCreated;
            
            pfp = req.query.pfp || "https://cdn.discordapp.com/attachments/1017778549169590372/1017806356188762162/replit.png";
            banner = req.query.banner || "https://cdn.discordapp.com/attachments/1017778549169590372/1017782722963460146/repl_code.png";
        } catch (error) {
            res.send('User not found or something went wrong.\n' + error);
            return;
        }
        
        // bio
        try {
            bio = bio.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            bio = bio.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
        } catch (error) {
            bio = '';
        }

        if (bio.length > 27) {
            bio = bio.replace(/(.{27})/g, '$1\n');
            bio = bio.substring(0, 77) + ' ...';
        } else {
            bio = bio.substring(0, 27);
        }

        // verified
        isVerified = isVerified ? '&#x2705;' : '&#10062;';

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
        card = fs.readFileSync('./assets/minicard.svg', {encoding: 'utf-8'}).toString()
        card = card.replace('[username]', username);
        card = card.replace('[bio]', bio);
        card = card.replace('[tick]', isVerified);
        card = card.replace('[time]', "Created on : "+ timeCreated);
        card = card.replace('[pfp]', pfp64);
        card = card.replace('[banner]', banner64);
        
        try {
            res.writeHead(200, {'Content-Type': 'image/svg+xml'})
            res.end(card)
        } catch (error) {
            res.send('Something went wrong.\n' + error);
        }

    });
});

process.on('unhandledRejection', async (reason, p, origin) => {
    const embed = new MessageBuilder()
        .setTitle('Unhandled Rejection')
        .addField('Reason', reason)
        .addField('Promise', p)
        .addField('Origin', origin)
        .setColor('RED')
        .setTimestamp()
        .setFooter('Unhandled Rejection')
    hook.send(embed);
});

process.on('uncaughtExceptionMonitor', async (err, origin) => {
    const embed = new MessageBuilder()
        .setTitle('Uncaught Exception')
        .addField('Error', err)
        .addField('Origin', origin)
        .setColor('RED')
        .setTimestamp()
        .setFooter('Uncaught Exception')
    hook.send(embed);
});

app.listen(3000, () => {
    console.log('Replit Cards is Online!');
});
