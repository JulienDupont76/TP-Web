# TPClient - Documentation Technique

## Objectif

Le client web affiche les messages du micro-service, permet d'en publier/supprimer, et propose des options d'interface (theme clair/sombre, changement d'URL API).

## Architecture

Le client est organise en 5 fichiers :

- `index.html` : structure de la page (zones UI + composants interactifs).
- `style.css` : design system (variables CSS), layout, animations et responsive.
- `script.js` : orchestration applicative (DOM + appels API + gestion des evenements).
- `APIClient.js` : couche d'acces HTTP autour de `fetch`.
- `endpoints.js` : registre central des routes du serveur.

Cette separation permet :

- de modifier l'API sans toucher la logique UI (via `endpoints.js`) ;
- de remplacer l'URL serveur a chaud (via `ApiClient.getInstance`) ;
- de garder le code front lisible en separant transport reseau et logique metier.

## Flux Technique

### 1) Initialisation

Au chargement de la page (`script.js`) :

1. creation du client HTTP avec `baseUrl` ;
2. appel `loadMessages()` ;
3. liaison des handlers de boutons/clavier ;
4. pre-remplissage du champ URL API avec la valeur courante.

### 2) Lecture des messages

`loadMessages()` :

- appelle `GET /msg/getAll` ;
- si `code === 1`, stocke la reponse dans `msgs` puis appelle `update(msgs)` ;
- met a jour le compteur avec `updateCount()` (`GET /msg/nber`).

### 3) Publication d'un message

`sendMessage()` :

- lit pseudo + texte depuis le DOM ;
- refuse un message vide ;
- encode les valeurs (`encodeURIComponent`) ;
- appelle `GET /msg/post/{message}?pseudo={pseudo}` ;
- recharge la liste si succes.

### 4) Suppression d'un message

Dans `update()`, chaque carte message ajoute un bouton `X` :

- animation locale (`.removing`) ;
- appel `GET /msg/del/{id}` ;
- rechargement complet de la liste.

## Choix d'Architecture et Justifications

### Cote API

- Singleton `ApiClient` : une seule instance active, reconfigurable dynamiquement.
- `parseResponse()` centralise le parsing JSON/texte/blobs et les erreurs HTTP.
- Routes centralisees dans `endpoints.js` pour limiter les strings dupliquees.

### Cote UI

- Rendu dynamique par creation d'elements DOM (`createElement`) au lieu de HTML statique.
- Etat minimal : `msgs` contient les donnees utiles au rendu.
- Strategy simple et robuste : apres POST/DELETE, on relit l'etat serveur avec `loadMessages()`.

### Cote UX

- Toast de feedback (succes/erreur) pour chaque action importante.
- Etat vide explicite (`Aucun message`).
- Animation d'entree/sortie des messages pour lisibilite visuelle.

## Changement de Theme (clair/sombre)

Le theme repose sur des variables CSS :

- Theme par defaut : variables dans `:root`.
- Theme clair : surcharge via `[data-theme='light']`.
- Le bouton theme execute `toggleTheme()` qui ajoute/enleve l'attribut `data-theme` sur `<html>`.

Impact :

- pas de duplication de feuilles CSS ;
- bascule instantanee de toutes les couleurs/composants ;
- implementation simple a maintenir.

## Connexion a l'API et Configuration Runtime

Le panneau API de l'entete permet de modifier l'URL serveur sans redeployer le client :

- bouton `API` : ouvre/ferme le panneau (`.api-panel.open`) ;
- bouton Enregistrer ou touche Entree : `updateApiUrl()` ;
- recreation du singleton `ApiClient` avec la nouvelle base URL ;
- rechargement immediat des messages.

Ce choix facilite les tests : local (`http://localhost:8080`) vs production (`https://tp-web-ngua.onrender.com`).

## Accessibilite et Responsive

- attributs ARIA sur la liste des messages et le toast (`aria-live`) ;
- viewport mobile actif ;
- media query pour adapter marges et largeur sur petits ecrans.

## Endpoints attendus

Le client consomme les endpoints suivants :

- `GET /msg/getAll`
- `GET /msg/get/{id}`
- `GET /msg/post/{message}?pseudo={pseudo}`
- `GET /msg/del/{id}`
- `GET /msg/nber`

## Lancement

Ouvrir `index.html` dans un navigateur moderne.
Si necessaire, changer l'URL API via le panneau `API` en haut de page.
