
# Node JS Tool to download full courses from Skillshare

This script is a simple way to download a full course from Skillshare.

> __Warning__
You need an active Premium account to use this tool. with this link: https://skl.sh/3VqX6E5 you can get 1 month for free. So just sign-up, download all the courses you want and cancel the free month.
## Installation

Once you downloaded the Project, open the "index.js" file.

You will find the following variables:

```bash
  let classID = '';
  let phpsessid = '';
  let skillshare_user_ = '';
  let subtitles = '';
```
    
The classID is found in the url of the course you want to downloaded. 

https://www.skillshare.com/en/classes/Find-Your-Style-Five-Exercises-to-Unlock-Your-Creative-Identity/1945270638

In this example URL, the ClassID would be "1945270638"


To get the phpsessid and the skillshare_user_ you will need to install a chrome extension called Cookie-Editor.

After you installed the extension, log into skillshare and open the extension.

In the  window popup, look for "PHPSESSID", click to open it and copy the contents of the Value field into the variable. 

Do the same with "skillshare_user_".

If you want to also download subtitles, just add your preferred language in the subtitles variable. (en for englisch, de for german, etc...).
Be sure that the course supports the subtitles language that you want to download.

After you have done that, just open a terminal and execute the following command:

```bash
  npm i
```

The above command only needs to be executed once.
After that, execute the following command to start the script: 

```bash
  npm run start 
```

All the courses will be downloaded in a folder called "skillshare_courses/{coursename}".
