const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

// Créer une facture
router.post('/', auth, async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir toutes les factures
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une facture spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client');
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une facture
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une facture
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Somme des factures par année
router.get('/sum/:year', auth, async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
  
      const result = await Invoice.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalHT: { $sum: "$totalHT" },
            totalTTC: { $sum: "$totalTTC" }
          }
        }
      ]);
  
      res.json({
        year: year,
        totalHT: result[0]?.totalHT || 0,
        totalTTC: result[0]?.totalTTC || 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
// Somme des factures par mois et année
router.get('/sum/:year/:month', auth, async (req, res) => {
try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // Les mois commencent à 0 en JavaScript
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const result = await Invoice.aggregate([
    {
        $match: {
        date: { $gte: startDate, $lte: endDate }
        }
    },
    {
        $group: {
        _id: null,
        totalHT: { $sum: "$totalHT" },
        totalTTC: { $sum: "$totalTTC" }
        }
    }
    ]);

    res.json({
    year: year,
    month: month + 1,
    totalHT: result[0]?.totalHT || 0,
    totalTTC: result[0]?.totalTTC || 0
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});
  
// Somme des factures mois par mois pour une année
router.get('/sum/monthly/:year', auth, async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
  
      const result = await Invoice.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $month: "$date" },
            totalHT: { $sum: "$totalHT" },
            totalTTC: { $sum: "$totalTTC" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
  
      // Création d'un objet avec tous les mois
      const monthlyData = {
        "1": { mois: "Janvier", totalHT: 0, totalTTC: 0 },
        "2": { mois: "Février", totalHT: 0, totalTTC: 0 },
        "3": { mois: "Mars", totalHT: 0, totalTTC: 0 },
        "4": { mois: "Avril", totalHT: 0, totalTTC: 0 },
        "5": { mois: "Mai", totalHT: 0, totalTTC: 0 },
        "6": { mois: "Juin", totalHT: 0, totalTTC: 0 },
        "7": { mois: "Juillet", totalHT: 0, totalTTC: 0 },
        "8": { mois: "Août", totalHT: 0, totalTTC: 0 },
        "9": { mois: "Septembre", totalHT: 0, totalTTC: 0 },
        "10": { mois: "Octobre", totalHT: 0, totalTTC: 0 },
        "11": { mois: "Novembre", totalHT: 0, totalTTC: 0 },
        "12": { mois: "Décembre", totalHT: 0, totalTTC: 0 }
      };
  
      // Mise à jour avec les données réelles
      result.forEach(item => {
        monthlyData[item._id].totalHT = item.totalHT;
        monthlyData[item._id].totalTTC = item.totalTTC;
      });
  
      res.json({
        annee: year,
        factures: Object.values(monthlyData)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;