# TPServeur - Documentation Technique

## Objectif

Le serveur fournit un micro-service HTTP pour gerer des messages de forum :

- publier un message ;
- recuperer un message par identifiant ;
- recuperer tous les messages ;
- compter les messages ;
- supprimer un message.

Le serveur contient aussi une partie "compteur" (`/cpt/...`) demandee dans l'enonce.

## Stack et organisation

- Runtime : Node.js
- Framework : Express (`^5.2.1`)
- Module system : ES modules (`"type": "module"`)
- Fichier principal : `index.js`

Le code est volontairement centralise dans un seul fichier pour rester simple dans le cadre du TP.

## Architecture generale

Le serveur suit un schema minimal :

1. Initialisation Express (`const app = express()`).
2. Middleware global CORS (autorise tous les origins).
3. Definition des routes utilitaires/test.
4. Definition des routes metier (`/cpt/...` et `/msg/...`).
5. Demarrage sur le port 8080.

## Choix techniques et decisions

### 1) API en `GET` partout

Choix fait pour coller au sujet de TP et faciliter les tests dans le navigateur (barre d'adresse).

Consequence :

- simple a tester ;
- moins REST pour des operations d'ecriture/suppression (en prod, `POST`/`DELETE` seraient preferables).

### 2) Stockage en memoire (etat serveur)

Les messages sont stockes dans une variable globale : `allMsgs`.

Structure retenue :

```js
{
  pseudo: "alice",
  msg: "Hello World",
  date: "2025-03-05T08:14:00.000Z"
}
```

Justification :

- modele JSON direct ;
- manipulations simples (`push`, acces par index, `splice`) ;
- pas de dependance base de donnees pour un TP court.

Consequence importante :

- donnees volatiles (perdues au redemarrage du processus).

### 3) Identifiant = index de tableau

Les routes utilisent l'indice du message dans `allMsgs` comme identifiant.

Avantages :

- implementation tres simple ;
- cohherent avec un stockage tableau.

Limites :

- apres suppression, les indices suivants se decalant, l'"id" n'est pas stable.

### 4) Format de reponse uniforme

Les routes renvoient des objets JSON avec un champ `code` (`1` succes, `0` echec, `-1` cas invalide pour compteur).

Interet :

- traitement homogène cote client.

### 5) CORS permissif

Le middleware fixe `Access-Control-Allow-Origin: *` pour autoriser l'appel depuis le client deploye sur un autre domaine (Render).

## Description des routes

### Route racine et test

- `GET /` : reponse texte `Hello`.
- `GET /test/*subPath` : echo de la sous-route dans `{ msg: ... }`.

### Compteur d'etat

- `GET /cpt/query`
  - renvoie `{ value: counter }`.
- `GET /cpt/inc`
  - sans query param : incremente de 1, renvoie `{ code: 0 }`.
- `GET /cpt/inc?v=XXX`
  - si `XXX` est un entier signe valide : incremente de `XXX`, renvoie `{ code: 0 }` ;
  - sinon : ne modifie pas l'etat, renvoie `{ code: -1 }`.

### Message board

- `GET /msg/post/*subPath`
  - decode le texte ;
  - lit `pseudo` dans `req.query` (defaut `anonyme`) ;
  - ajoute un message date en ISO ;
  - renvoie `{ code: 1, id: <index> }` si succes, sinon `{ code: 0 }` pour message vide.

- `GET /msg/get/:id`
  - verifie que `id` est un entier positif ;
  - renvoie `{ code: 1, msg: ... }` si trouve, sinon `{ code: 0 }`.

- `GET /msg/getAll`
  - renvoie `{ code: 1, msgs: allMsgs }`.

- `GET /msg/nber`
  - renvoie `{ code: 1, nber: allMsgs.length }`.

- `GET /msg/del/:id`
  - verifie l'id ;
  - supprime avec `splice` ;
  - renvoie `{ code: 1 }` ou `{ code: 0 }`.

## Validation des entrees

- Verif d'entier via regex :
  - `^[+-]?\d+$` pour le compteur ;
  - `^\d+$` pour les indices de message.
- Conversion numerique via `parseInt(..., 10)`.
- Nettoyage texte avec `trim()`.
- Valeur par defaut pour pseudo (`anonyme`).

## Limites actuelles

- pas de persistence (pas de BD) ;
- endpoints d'ecriture en `GET` ;

## Pistes d'amelioration

- remplacer l'index par un identifiant stable (`id` UUID) ;
- passer `post`/`delete` en veritables verbes HTTP ;
- ajouter une persistence (SQLite/PostgreSQL).

## Execution

Dans le dossier serveur :

```bash
npm install
npm start
```

Serveur disponible sur : `http://localhost:8080`.

## Deploiement

Serveur deploye sur Render :

- `https://tp-web-ngua.onrender.com`
