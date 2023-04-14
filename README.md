# Epson-printer-bruteforcer
### A very hacky script for brute-forcing Epson printer's  Admin Panel username/password.

I forgot our Username and Password for our Epson SC-P9500 printer.
To both reset or change password of the printer, you need to know the old password. Apparently the only other way to "fix" this is to send the printer to Epson.

So instead I quickly hacked together a basic brute-forcer that would try combinations I think could be correct.
Sure enough, it worked and I managed to find the username and password.


## Usage
If you know NodeJS, you only need to require the `BruteForce.js` file.

If not:
1. You need to have NodeJS installed
2. Save both `BruteForcer.js` and `example.js` files in the same folder
3. Open `example.js` with any editor, like Notepad
4. Edit Usernames/Passwords by adding any combinations you think might also be possible (*keeping the quotes and style like examples, of course*).
5. Edit the IP of the printer to whatever your printer's IP is
6. To start the cracking, open Command Prompt
7. Write `node ` (*space included*) then drag and drop the `example.js` file into the Command Prompt, and hit enter.
