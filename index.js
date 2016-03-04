var random = require("random-js")();
var Guid = require("guid");
var https = require('https');
var crypto = require('crypto');
var config = require('./config.json');

// Event Hubs parameters
var namespace = config.namespace;
var hubname = config.hubname;
var devicename = config.devicename;

// Shared access key
var my_key_name = 'Senders';
var my_key = config.mykey;

// Full Event Hub publisher URI
var azureUri = 'https://' + namespace + '.servicebus.windows.net' + '/' + hubname + '/publishers/' + devicename + '/messages';
console.log(azureUri);

function create_sas_token(uri, key_name, key)
{
	// Token expires in 24 hours
	var expiry = Math.floor(new Date().getTime() / 1000 + 3600 * 24);

	var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
	var hmac = crypto.createHmac('sha256', key);
	hmac.update(string_to_sign);
	var signature = hmac.digest('base64');
	var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;

	return token;
}

var sas_token = create_sas_token(azureUri, my_key_name, my_key)

console.log(sas_token);

// Car Constructor
function Voiture(_Brand, _Model, _NumberPlate, _Speed, _RadarIdentifier)
{
	this.Brand = _Brand;
	this.Model = _Model
	this.NumberPlate = _NumberPlate
	this.Speed = _Speed
	this.RadarIdentifier = _RadarIdentifier
}

// Brand Generator if you didn't got it already
function randomBrand()
{
	var value = random.integer(1, 6);
	switch (value)
	{
		case 1:
			return "Honda";
			break;
		case 2:
			return "Renault";
			break;
		case 3:
			return "Peugeot";
			break;
		case 4:
			return "FIAT SISI";
			break;
		case 5:
			return "Ford";
			break;
		case 6:
			return "Tesla";
			break;
		default:
			return "Honda";
			break;
	}
}

// Car model generator if you didn't got it already
function randomModel()
{
	var value = random.integer(1, 6);
	switch (value)
	{
		case 1:
			return "Twingo";
			break;
		case 2:
			return "206";
			break;
		case 3:
			return "207";
			break;
		case 4:
			return "PUNTO SISI";
			break;
		case 5:
			return "Classe S";
			break;
		case 6:
			return "Espace";
			break;
		default:
			return "Honda";
			break;
	}
}
for (var i = 1; i < 50; i++)
{
    var voiture = new Voiture(randomBrand(), randomModel(), Guid.create().value, random.integer(100, 140), random.integer(1, 728));

	var options = {
		hostname: namespace + '.servicebus.windows.net',
		port: 443,
		path: '/' + hubname + '/publishers/' + devicename + '/messages',
		method: 'POST',
		headers:
		{
			'Authorization': sas_token,
			'Content-Length': JSON.stringify(voiture).length,
			'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
		}
	};

	var req = https.request(options, function(res)
	{
		console.log("statusCode: ", res.statusCode);
		console.log("headers: ", res.headers);

		res.on('data', function(d)
		{
			process.stdout.write(d);
		});
	});

	req.on('error', function(e)
	{
		console.error(e);
	});

	// console.log(voiture);
	var req = https.request(options, function(res)
	{
		console.log("statusCode: ", res.statusCode);
		console.log("headers: ", res.headers);

		res.on('data', function(d)
		{
			process.stdout.write(d);
		});
	});

	req.on('error', function(e)
	{
		console.error(e);
	});

	req.write(JSON.stringify(voiture));
	req.end();
}
