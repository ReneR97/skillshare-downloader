const { http, https } = require('follow-redirects');
const fs = require('fs');

let classID = '';
let phpsessid = '';
let skillshare_user_ = '';

scrapeVideos();

async function scrapeVideos() {
    let classData = await fetchFromApi(`https://api.skillshare.com/classes/${classID}`);

    let dir = `./skillshare_courses/${convertToValidFilename(classData['title'])}/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let maxItems = classData['_embedded']['sessions']['_embedded']['sessions'].length;
    let downloaded = 0;

    classData['_embedded']['sessions']['_embedded']['sessions'].forEach((session) => {
        req = https.request(
            {
                method: 'GET',
                hostname: 'api.skillshare.com',
                path: session['_links']['download']['href'],
                headers: {
                    Cookie: `PHPSESSID=${phpsessid}; skillshare_user_=${skillshare_user_}`,
                    'User-Agent': 'Skillshare/5.3.0; Android 9.0.1',
                    Accept: 'application/vnd.skillshare.class+json;,version=0.8',
                    Host: 'api.skillshare.com',
                    Referer: 'https://www.skillshare.com/',
                },
            },
            (res) => {
                if (!res.responseUrl.includes('api.skillshare.com')) {
                    const path = `${dir}${session['index']}_${convertToValidFilename(session['_links']['download']['title'])}.mp4`;
                    const writeStream = fs.createWriteStream(path);

                    res.pipe(writeStream);

                    writeStream.on('finish', () => {
                        writeStream.close();
                        downloaded++;
                        console.log(`Download ${downloaded}/${maxItems} Completed!`);
                    });
                } else {
                    console.log('COOKIE ERROR');
                }
            },
        );

        req.end();
    });
}

async function fetchFromApi(apiURL) {
    const response = await fetch(apiURL, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    return data;
}

function convertToValidFilename(string) {
    string = string.replace(/[\/|\\:*?"<>]/g, ' ');
    string = string.replace(':', '');
    return string;
}
