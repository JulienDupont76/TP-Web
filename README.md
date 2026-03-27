# TP Web - MessageBoard (Client + Micro-service Node.js)

## Déploiement Render

Le projet a été déployé sur Render :

- Client : `https://tp-web-client.onrender.com`
- Serveur : `https://tp-web-ngua.onrender.com`

## Objectif du TP

Ce TP avait pour but de construire une petite application de messagerie web en deux parties :

- un client web (HTML/CSS/JavaScript) pour afficher et publier des messages ;
- un micro-service Node.js (Express) pour stocker les messages en mémoire et exposer des routes HTTP.

## Organisation du projet

- `TPClient/`
  - `index.html` : structure de la page (liste des messages, formulaire de publication, contrôles UI)
  - `style.css` : styles, thèmes clair/sombre, animations et responsive
  - `script.js` : logique front-end (chargement, envoi, suppression, thème, rafraîchissement)
  - `APIClient.js` : client HTTP générique basé sur `fetch`
  - `endpoints.js` : centralisation des chemins d'API
- `TPServeur/`
  - `index.js` : serveur Express et routes du micro-service
  - `package.json` : dépendances et scripts

## Choix de mise en oeuvre

### 1) Côté serveur

Le serveur est implémenté avec Express.

Choix principaux :

- utilisation de routes `GET` pour toutes les actions (conforme au sujet, même si un vrai `POST` serait plus naturel pour publier) ;
- activation de CORS (`Access-Control-Allow-Origin: *`) pour permettre au client de consommer l'API ;
- retour systématique de JSON avec un champ de statut (`code`) pour simplifier le traitement côté client ;
- stockage **en mémoire** dans une variable JavaScript globale (pas de base de données).

Routes implémentées :

- `/test/*subPath` : renvoie la sous-route dans `{ msg: ... }`
- `/cpt/query` et `/cpt/inc` : micro-service d'état (compteur)
- `/msg/post/*subPath` : ajoute un message
- `/msg/get/:id` : récupère un message par indice
- `/msg/getAll` : récupère tous les messages
- `/msg/nber` : nombre total de messages
- `/msg/del/:id` : suppression par indice

Validation/robustesse :

- vérification des entiers via regex + `parseInt` pour les routes compteur/id ;
- refus des messages vides au post (`trim`) ;
- pseudo facultatif, valeur par défaut `anonyme`.

### 2) Structure de donnée des messages

La structure retenue est un **tableau d'objets** :

```js
[
  {
    pseudo: "alice",
    msg: "Hello World",
    date: "2025-03-05T08:14:00.000Z"
  },
  ...
]
```

Justification :

- modèle simple à manipuler côté JS ;
- compatible avec les besoins du sujet (texte + métadonnées pseudo/date) ;
- sérialisation JSON directe sans transformation complexe.

Conséquences :

- l'identifiant d'un message est son **indice dans le tableau** ;
- après suppression (`splice`), les indices des messages suivants changent ;
- les données sont perdues au redémarrage du serveur (stockage volatil).

### 3) Côté client

Le client est en JavaScript avec séparation des responsabilités :

- `APIClient.js` encapsule `fetch` et le parsing des réponses ;
- `endpoints.js` évite les routes codées en dur partout ;
- `script.js` gère uniquement la logique métier/UI.

Fonctionnalités réalisées :

- chargement asynchrone des messages (`/msg/getAll`) au démarrage ;
- affichage dynamique dans la liste (`update`) ;
- publication d'un message (texte + pseudo) via `/msg/post/...` ;
- suppression d'un message via `/msg/del/:id` ;
- bouton de rafraîchissement manuel ;
- affichage du nombre de messages via `/msg/nber` ;
- thème clair/sombre ;
- panneau de configuration de l'URL d'API ;
- retours utilisateur avec toast et états visuels (empty state, animation de suppression).

Le format de date est affiché au format local français (`toLocaleString('fr-FR', ...)`).

## Limites actuelles

- persistance absente (données en RAM uniquement) ;
- usage de `GET` pour poster/supprimer (acceptable pour le TP, moins REST en production) ;
- ID basé sur l'indice de tableau (peut varier après suppression) ;
- gestion d'erreur encore simple.

## Pistes d'amélioration

- passer à une base de données ;
- introduire de vrais identifiants stables (`id`) ;
- utiliser `POST`/`DELETE` côté API ;

## Lancement

### Serveur

Dans `TPServeur/` :

```bash
npm install
npm start
```

Serveur sur `http://localhost:8080`.

### Client

Ouvrir `TPClient/index.html` dans un navigateur, puis configurer l'URL d'API (bouton "API") si nécessaire.
Par défaut, le client pointe vers une URL distante (`https://tp-web-ngua.onrender.com`).
Pour travailler en local, utiliser `http://localhost:8080`.
