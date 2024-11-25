const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  nomFacturation: String,
  adresse: String,
  codePostal: String,
  ville: String,
  siret: String,
  email: String,
  statut: { type: String, enum: ['Actif', 'Inactif'], default: 'Actif' }
});

module.exports = mongoose.model('Client', clientSchema);