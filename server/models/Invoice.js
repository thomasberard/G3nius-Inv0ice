const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  objet: { type: String, required: true },
  date: { type: Date, default: Date.now },
  prestations: [{
    description: String,
    quantite: Number,
    prixUnitaire: Number,
    tva: Number
  }],
  totalHT: Number,
  totalTTC: Number
});

module.exports = mongoose.model('Invoice', invoiceSchema);