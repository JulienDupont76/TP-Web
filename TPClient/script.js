import ApiClient from './APIClient.js';
import { ENDPOINTS } from './endpoints.js';

const baseUrl = 'http://localhost:8080';

let APIClient = ApiClient.getInstance(baseUrl, {});

const fact = (n) => {
	if (n < 0) throw new RangeError('fact() : n doit être >= 0');
	if (n === 0 || n === 1) return 1;
	return n * fact(n - 1);
};

console.log('fact(6) =', fact(6));

const applique = (f, tab) => {
	const result = [];
	for (let i = 0; i < tab.length; i++) {
		result.push(f(tab[i]));
	}
	return result;
};

console.log('factorielles :', applique(fact, [1, 2, 3, 4, 5, 6]));

console.log(
	'n+1 :',
	applique((n) => n + 1, [1, 2, 3, 4, 5, 6]),
);

let msgs = [];

const loadMessages = async () => {
	try {
		const response = await APIClient.get(ENDPOINTS.GET_ALL_MESSAGES);
		if (response.code === 1) {
			msgs = response.msgs;
			console.log('Messages chargés :', msgs);
			update(msgs);
		} else {
			showToast('Erreur lors du chargement des messages');
		}
	} catch (error) {
		console.error('Error fetching messages:', error);
		showToast('Erreur serveur');
	}
};

const formatDate = (isoString) => {
	const d = new Date(isoString);
	return d.toLocaleString('fr-FR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const avatarLetter = (pseudo) => {
	return pseudo ? pseudo.charAt(0).toUpperCase() : '?';
};

const update = (tableau) => {
	const ul = document.getElementById('message-list');

	ul.innerHTML = '';

	if (!tableau || tableau.length === 0) {
		ul.innerHTML =
			'<li class="empty-state">Aucun message — soyez le premier !</li>';
		document.getElementById('msg-count').textContent = 0;
		return;
	}

	tableau.forEach((item, index) => {
		const li = document.createElement('li');
		li.style.animationDelay = index * 40 + 'ms';

		const avatar = document.createElement('div');
		avatar.className = 'msg-avatar';
		avatar.setAttribute('aria-hidden', 'true');
		avatar.textContent = avatarLetter(item.pseudo);

		const header = document.createElement('div');
		header.className = 'msg-header';

		const pseudoEl = document.createElement('span');
		pseudoEl.className = 'msg-pseudo';
		pseudoEl.textContent = item.pseudo || 'anonyme';

		const dateEl = document.createElement('time');
		dateEl.className = 'msg-date';
		dateEl.setAttribute('datetime', item.date);
		dateEl.textContent = formatDate(item.date);

		header.appendChild(pseudoEl);
		header.appendChild(dateEl);

		const textEl = document.createElement('p');
		textEl.className = 'msg-text';
		textEl.textContent = item.msg;

		li.appendChild(avatar);
		li.appendChild(header);
		li.appendChild(textEl);
		ul.appendChild(li);
	});

	document.getElementById('msg-count').textContent = tableau.length;
};

const showToast = (texte) => {
	const toast = document.getElementById('toast');
	toast.textContent = texte;
	toast.classList.add('show');
	setTimeout(() => {
		toast.classList.remove('show');
	}, 2200);
};

const sendMessage = async () => {
	const pseudoInput = document.getElementById('pseudo-input');
	const msgInput = document.getElementById('message-input');

	const pseudo = pseudoInput.value.trim();
	const msg = msgInput.value.trim();

	if (!msg) {
		showToast('⚠ Veuillez écrire un message.');
		msgInput.focus();
		return;
	}

	const encodedMsg = encodeURIComponent(msg);
	const encodedPseudo = encodeURIComponent(pseudo || 'anonyme');

	try {
		const response = await APIClient.get(
			`${ENDPOINTS.POST_MESSAGE}/${encodedMsg}?pseudo=${encodedPseudo}`,
		);

		if (response.code === 1) {
			showToast('✓ Message envoyé !');

			msgInput.value = '';
			msgInput.focus();
			loadMessages();
		} else {
			showToast("Erreur lors de l'envoi");
		}
	} catch (error) {
		console.error(err);
		showToast('Erreur serveur');
	}
};

const toggleTheme = () => {
	const html = document.documentElement;
	const icon = document.getElementById('theme-icon');
	const label = document.getElementById('theme-label');
	const isDark = html.getAttribute('data-theme') !== 'light';

	if (isDark) {
		html.setAttribute('data-theme', 'light');
		icon.textContent = '🌙';
		label.textContent = 'Sombre';
	} else {
		html.removeAttribute('data-theme');
		icon.textContent = '☀️';
		label.textContent = 'Clair';
	}
};

const updateApiUrl = () => {
	const url = document.getElementById('api-url').value.trim();

	if (!url) {
		showToast('URL invalide');
		return;
	}

	ApiClient.instance = null;
	APIClient = ApiClient.getInstance(url, {});
	showToast('✓ API changée');

	loadMessages();
};

loadMessages();

document.getElementById('btn-send').addEventListener('click', sendMessage);

document.getElementById('btn-update').addEventListener('click', () => {
	loadMessages();
	showToast('↻ Liste mise à jour.');
});

document.getElementById('message-input').addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage();
});

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

document.getElementById('api-url').addEventListener('change', updateApiUrl);
