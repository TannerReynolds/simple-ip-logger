const locator = require("node-iplocate");
const path = require('path');

async function logger(req, res) {
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    let htmlFile = path.resolve(`${__dirname}/../public/logger.html`)
    res.sendFile(htmlFile);
    res.end();
    let allVisitors = this.db.get('visitors').value();
    let caseNumber = allVisitors.length + 1;
    locator('2601:203:500:4320:d8b:4b53:b7a5:818').then(r => {
        this.db.get('visitors')
                .push({ ip: userIP, case: caseNumber.toString(), userAgent: req.headers['user-agent'], country: r.country, city: r.city, lat: r.latitude, lon: r.longitude, org: r.org, postCode: r.postal_code, date: new Date() })
                .write();
    });
}
module.exports = logger;
