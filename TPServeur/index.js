import express from 'express';

const app = express();

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept',
	);
	next();
});

app.get('/', (req, res) => {
	res.send('Hello');
});

app.get('/test/*subPath', (req, res) => {
	res.json({ msg: req.params.subPath });
});

let counter = 0;

app.get('/cpt/query', (req, res) => {
	res.json({ value: counter });
});

app.get('/cpt/inc', (req, res) => {
	const raw = req.query.v;

	if (raw === undefined) {
		counter += 1;
		return res.json({ code: 0 });
	}

	if (!raw.match(/^[+-]?\d+$/)) {
		return res.json({ code: -1 });
	}

	counter += parseInt(raw, 10);
	res.json({ code: 0 });
});

const allMsgs = [
	{
		pseudo: 'alice',
		msg: 'Hello World',
		date: new Date('2025-03-05T08:14:00').toISOString(),
	},
	{
		pseudo: 'bob42',
		msg: 'foobar',
		date: new Date('2025-03-05T09:02:33').toISOString(),
	},
	{
		pseudo: 'celine',
		msg: 'CentraleSupelec Forever',
		date: new Date('2025-03-05T11:45:10').toISOString(),
	},
];

const parseIndex = (str) => {
	if (!str || !str.match(/^\d+$/)) return null;
	return parseInt(str, 10);
};

app.get('/msg/post/*subPath', (req, res) => {
	const raw = req.params.subPath;
	const text = unescape(raw).trim();

	if (!text) {
		return res.json({ code: 0 });
	}

	const pseudo = req.query.pseudo
		? unescape(req.query.pseudo).trim()
		: 'anonyme';

	const newMsg = {
		pseudo: pseudo,
		msg: text,
		date: new Date().toISOString(),
	};

	allMsgs.push(newMsg);
	const id = allMsgs.length - 1;

	console.log(`[post] id=${id} pseudo="${pseudo}" msg="${text}"`);
	res.json({ code: 1, id: id });
});

app.get('/msg/get/:id', (req, res) => {
	const id = parseIndex(req.params.id);

	if (id === null || id >= allMsgs.length) {
		return res.json({ code: 0 });
	}

	res.json({ code: 1, msg: allMsgs[id] });
});

app.get('/msg/getAll', (req, res) => {
	res.json({ code: 1, msgs: allMsgs });
});

app.get('/msg/nber', (req, res) => {
	res.json({ code: 1, nber: allMsgs.length });
});

app.get('/msg/del/:id', (req, res) => {
	const id = parseIndex(req.params.id);

	if (id === null || id >= allMsgs.length) {
		return res.json({ code: 0 });
	}

	allMsgs.splice(id, 1);
	console.log(`[del] id=${id}`);
	res.json({ code: 1 });
});

app.listen(8080, () => {
	console.log('App listening on port 8080...');
});
