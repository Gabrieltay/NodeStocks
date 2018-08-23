const Slimbot = require('slimbot');
const express = require('express');
const request = require('request');
const debug = require('debug')('app:debug');
const app = express();
// Configure express server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => debug(`Listening on port ${PORT}`));

const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN'] || '570759765:AAFYXd4HeeD7uAwpD4dVto-rXeTT_cwwrRE');

const optionalParams = {
	parse_mode: 'Markdown',
	reply_markup: JSON.stringify({
		inline_keyboard: [
			[{ text: 'Straits Times Index ETF', callback_data: 'ES3.SI' }],
			[{ text: 'SPDR S&P 500 ETF', callback_data: 'SPY' }],
			[{ text: 'PowerShares QQQ ETF', callback_data: 'QQQ' }],
			[{ text: 'SPDR Dow Jones Industrial Average ETF', callback_data: 'DIA' }],
		],
	}),
};

// Register listener
slimbot.on('message', message => {
	console.log(message.text);
	slimbot.sendMessage(message.chat.id, 'Pick Your ETF 😎', optionalParams);
});

slimbot.on('callback_query', query => {
	getStockPrice(query);
});

// Call API
slimbot.startPolling();

async function getStockPrice(query) {
	await request(
		`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${query.data}&apikey=${
			process.env['ALPHA_API_KEY']
		}`,
		function(error, response, body) {
			console.log('Status:', response.statusCode);
			console.log('Headers:', JSON.stringify(response.headers));
			console.log('Response:', body);
			slimbot.editMessageText(query.message.chat.id, query.message.message_id, body).then(message => {
				slimbot.sendMessage(query.message.chat.id, '/start');
			});
		}
	);
}
