import https from 'follow-redirects';
import cloudflareScraper from 'cloudflare-scraper';
import fs from 'fs';

let classID = '';
let phpsessid = '';
let skillshare_user_ = '';

let subtitles = ''; //en, de, pt...

(async () => {
    await scrapeVideos();
})();

async function scrapeVideos() {
    let classData = await fetchFromApi(`https://api.skillshare.com/classes/${classID}`);

    let dir = `./skillshare_courses/${convertToValidFilename(classData['title'])}/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let downloaded = 0;
    let maxItems = classData['_embedded']['sessions']['_embedded']['sessions'].length;

    for (let i = 0; i < maxItems; i++) {
        let session = classData['_embedded']['sessions']['_embedded']['sessions'][i];
        let dl = await download(session, dir);

        if (dl) {
            downloaded++;
            console.log(`Download ${downloaded}/${maxItems} Completed!`);

            if (subtitles !== '') {
                let video_hashed_id;
                if (session['video_hashed_id'] != null && session['video_hashed_id'] !== '') {
                    video_hashed_id = session['video_hashed_id'].replace('bc:', '');
                } else {
                    video_hashed_id = /thumbnails\/(.*)\//gm.exec(session['image_thumbnail'])[1];
                }

                let subtitles_data = await fetchSubtitlesInfo(`https://edge.api.brightcove.com/playback/v1/accounts/3695997568001/videos/${video_hashed_id}`);
                console.log(`https://edge.api.brightcove.com/playback/v1/accounts/3695997568001/videos/${video_hashed_id}`);
                if (subtitles_data[0]['error_code']) {
                    //console.log('There was an error getting the subtitles data. ERROR: ' + subtitles_data[0]['message']);
                } else {
                    let subtitles_url = '';

                    subtitles_data['text_tracks'].forEach((el) => {
                        if (el['srclang'].includes(subtitles)) {
                            subtitles_url = el['src'];
                        }
                    });

                    if (subtitles_url === '') {
                        console.log("Couldn't find subtitles for specified language");
                    } else {
                        let dl = await downloadSubtitles(subtitles_url, dir, session);
                        if (dl) {
                            console.log(`Download Subtitles ${downloaded}/${maxItems} Completed!`);
                        } else {
                            console.log('There was an Error when downloading the Subtitles');
                        }
                    }
                }
            }
        } else {
            console.log('COOKIE ERROR');
        }
    }
}

async function downloadSubtitles(url, dir, session) {
    const response = await cloudflareScraper.get(url);
    const path = `${dir}${session['index']}_${convertToValidFilename(session['_links']['download']['title'])}.vtt`;

    fs.writeFileSync(path, response.body);

    return true;
}

function download(session, dir) {
    return new Promise((resolve, reject) => {
        let req = https.https.request(
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
                        resolve(true);
                    });
                } else {
                    reject(false);
                }
            },
        );

        req.end();
    });
}

async function fetchFromApi(apiURL) {
    const response = await fetch(apiURL, {
        method: 'GET',
        hostname: 'api.skillshare.com',
        path: apiURL.replace('https://api.skillshare.com/', ''),
        headers: {
            Cookie: `PHPSESSID=${phpsessid}; skillshare_user_=${skillshare_user_}`,
            'User-Agent': 'Skillshare/5.3.0; Android 9.0.1',
            Accept: 'application/vnd.skillshare.class+json;,version=0.8',
            Host: 'api.skillshare.com',
            Referer: 'https://www.skillshare.com/',
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();

    return data;
}

async function fetchSubtitlesInfo(apiURL) {
    const response = await fetch(apiURL, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json;pk=BCpkADawqM2OOcM6njnM7hf9EaK6lIFlqiXB0iWjqGWUQjU7R8965xUvIQNqdQbnDTLz0IAO7E6Ir2rIbXJtFdzrGtitoee0n1XXRliD-RH9A-svuvNW9qgo3Bh34HEZjXjG4Nml4iyz3KqF',
            accept: 'application/json;pk=BCpkADawqM2OOcM6njnM7hf9EaK6lIFlqiXB0iWjqGWUQjU7R8965xUvIQNqdQbnDTLz0IAO7E6Ir2rIbXJtFdzrGtitoee0n1XXRliD-RH9A-svuvNW9qgo3Bh34HEZjXjG4Nml4iyz3KqF',
        },
    });
    const data = await response.json();

    return data;
}

function convertToValidFilename(string) {
    string = string.replace(/[\/|\\:*?"<>]/g, ' ');
    string = string.replace(':', '');
    return string;
}
