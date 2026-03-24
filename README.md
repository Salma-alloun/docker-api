# docker-api

API Node.js pour récupérer et stocker le **top 10 musique** depuis Deezer dans **MongoDB**, avec affichage des titres et images dans un design compact et moderne.

---

## 🚀 Fonctionnalités

- Récupération du top 10 musique via l'API Deezer.  
- Stockage des données dans MongoDB.  
- Affichage du classement avec :  
  - Titre, artiste, album  
  - Images des albums et artistes  
  - Durée, date de sortie, badge “explicit” si nécessaire  
- Interface web moderne et responsive.  
- Bouton de rafraîchissement pour mettre à jour les données.  

---

## 💻 Prérequis

- [Node.js](https://nodejs.org/) v18+  
- [MongoDB](https://www.mongodb.com/) (ou via Docker)  
- [Docker](https://www.docker.com/) si tu souhaites containeriser l’application  

---

# 🚀 Installation et lancement du projet Top Music API

## 📋 Prérequis

* Docker installé → Docker
* (Optionnel) Docker Desktop pour interface graphique

---

## 🧱 1. Créer un réseau Docker

Créer un réseau pour permettre la communication entre les conteneurs :

```bash
docker network create my-network
```

---

## 🗄️ 2. Lancer MongoDB

### 📥 Télécharger l’image MongoDB

```bash
docker pull mongo:latest
```

### ▶️ Démarrer le conteneur MongoDB

```bash
docker run -d \
  --name mongodb \
  --network my-network \
  -p 27017:27017 \
  mongo:latest
```

---

## 🧠 3. Construire l’image de l’API (api-client)

Depuis le dossier du projet (où se trouve le Dockerfile) :

```bash
docker build -t api-client .
```

---

## ▶️ 4. Lancer l’API

```bash
docker run -d \
  --name api-container \
  --network my-network \
  --dns 8.8.8.8 \
  -p 5000:5000 \
  api-client
```

---

## 🌐 5. Accéder à l’application

Ouvrir dans le navigateur :

```text
http://localhost:5000
```

👉 Redirection automatique vers :

```text
http://localhost:5000/top-music
```

---

## 🔄 6. Charger les données depuis l’API Deezer

Cliquer sur :

```text
http://localhost:5000/fetch-top-music
```

👉 Cette route :

* appelle l’API Deezer API
* récupère le **Top 10 musique**
* stocke les données dans MongoDB

---

## 🧪 7. Vérifier les données MongoDB

### Accéder au shell MongoDB :

```bash
docker exec -it mongodb mongosh
```

### Commandes utiles :

```js
show dbs
use api_database
show collections
db.topmusic.find().limit(5)
```

---

## 📸 8. Debug des images (optionnel)

```text
http://localhost:5000/debug-images
```

👉 Permet de vérifier :

* URL des images album
* images artistes

---

## 📊 9. Vérifier les conteneurs

```bash
docker ps
```

---

## 🛑 10. Arrêter les conteneurs

```bash
docker stop api-container mongodb
```

---

## 🗑️ 11. Supprimer les conteneurs

```bash
docker rm api-container mongodb
```

---

## ⚠️ Remarques importantes

* Connexion MongoDB utilisée par l’application :

```text
mongodb://mongodb:27017
```

👉 `mongodb` correspond au **nom du conteneur**

---

* L’option suivante est importante :

```bash
--dns 8.8.8.8
```

👉 utile si :

* problèmes réseau Docker
* accès API externe (Deezer)

---

* Le réseau `my-network` est obligatoire pour :

- communication API ↔ MongoDB

---

## 💡 Astuces

### Voir les logs :

```bash
docker logs api-container
docker logs mongodb
```

---

### Redémarrer un conteneur :

```bash
docker restart api-container
```

---


