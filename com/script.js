// Importer les modules nécessaires
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// Créer une instance d'Express
const app = express();
const port = 3000;

// Middleware pour analyser le corps des requêtes en JSON
app.use(bodyParser.json());

// Créer une connexion à la base de données MySQL distante
const db = mysql.createConnection({
    host: 'votre_hôte_mysql',    // Remplacez par l'adresse IP ou le domaine de votre serveur MySQL
    user: 'votre_utilisateur',   // Remplacez par votre nom d'utilisateur MySQL
    password: 'votre_mot_de_passe', // Remplacez par votre mot de passe MySQL
    database: 'votre_base_de_donnees' // Remplacez par le nom de votre base de données
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connexion à la base de données réussie.');
});

// Créer la table des commentaires si elle n'existe pas déjà
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author VARCHAR(255),
        text TEXT
    );
`;

db.query(createTableQuery, (err) => {
    if (err) {
        console.error('Erreur de création de la table:', err);
    }
});

// Route pour obtenir tous les commentaires
app.get('/comments', (req, res) => {
    db.query('SELECT * FROM comments', (err, results) => {
        if (err) {
            res.status(500).send('Erreur de récupération des commentaires.');
            return;
        }
        res.json(results); // Retourner les commentaires sous forme de JSON
    });
});

// Route pour ajouter un nouveau commentaire
app.post('/comments', (req, res) => {
    const { author, text } = req.body; // Récupérer les données envoyées par le frontend
    
    // Vérifier que l'auteur et le texte sont présents
    if (!author || !text) {
        return res.status(400).send('L\'auteur et le texte sont requis.');
    }

    // Ajouter le commentaire dans la base de données
    db.query('INSERT INTO comments (author, text) VALUES (?, ?)', [author, text], (err, results) => {
        if (err) {
            return res.status(500).send('Erreur d\'ajout du commentaire.');
        }
        res.status(201).send('Commentaire ajouté avec succès.');
    });
});

// Route pour supprimer un commentaire
app.delete('/comments/:id', (req, res) => {
    const commentId = req.params.id; // Récupérer l'ID du commentaire à supprimer

    // Supprimer le commentaire de la base de données
    db.query('DELETE FROM comments WHERE id = ?', [commentId], (err, results) => {
        if (err) {
            return res.status(500).send('Erreur de suppression du commentaire.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Commentaire non trouvé.');
        }
        res.send('Commentaire supprimé avec succès.');
    });
});

// Route pour la validation du mot de passe d'administration (suppression)
app.post('/validate-password', (req, res) => {
    const { password } = req.body;

    const adminPassword = 'valitymdp'; // Mot de passe d'administration pour la suppression des commentaires

    if (password === adminPassword) {
        res.send('Mot de passe correct, vous pouvez supprimer des commentaires.');
    } else {
        res.status(401).send('Mot de passe incorrect.');
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Le serveur fonctionne sur http://localhost:${port}`);
});
