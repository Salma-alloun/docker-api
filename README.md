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

## ⚙️ Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/Salma-alloun/docker-api.git
cd docker-api
