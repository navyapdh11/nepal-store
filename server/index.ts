import express from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';

const app = express();
const port = 3001;

app.use(express.json());

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const result = AuthService.register(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = AuthService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
});

const products = [
  { id: '1', name: 'Ultra Light Down Jacket', price: 99.9, category: 'MEN' },
  { id: '2', name: 'Premium Pashmina Scarf', price: 129.0, category: 'WOMEN' },
  { id: '3', name: 'Cotton Crew Neck T-Shirt', price: 19.9, category: 'KIDS' },
  { id: '4', name: 'HEATTECH Thermal Leggings', price: 24.9, category: 'BABY' },
];

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    return res.json(products.filter(p => p.category === category));
  }
  res.json(products);
});

app.listen(port, () => {
  console.log(`NEPAL STORE API running at http://localhost:${port}`);
});
