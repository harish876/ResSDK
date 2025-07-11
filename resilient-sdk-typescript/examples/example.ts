import { ResilientDB } from '../src';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

async function example() {
  const db = new ResilientDB({
    baseUrl: 'http://54.204.140.141:18000',
    timeout: 5000,
  });

  try {
    console.log('\nCreating products collection with type inference...');
    try {
      await db.createCollection<Product>('products', {
        primary_key: 'id',
        secondary_key: 'category'
      },
      {
        id: 'integer',
        name: 'string',
        price: 'integer',
        category: 'string'
      },
      ['id', 'category']);
      console.log('Products collection created with type inference'); 
    } catch (error) {
      console.log('Error creating collection:', error);
    }

    console.log('\nInserting a new product...');
    await db.insert<Product>('products', {
      id: 12,
      name: 'Laptop',
      category: 'electronics',
      price: 999
    });
    console.log('Product inserted successfully');

    console.log('Getting products with category electronics...');
    const productsByCategory = await db.find<Product>('products', { category: 'electronics'});
    console.log('Products found:', productsByCategory);
    
    console.log('Getting products with name laptop...');
    const productsByName = await db.find<Product>('products', { name: 'laptop'});
    console.log('Products found:', productsByName);

    console.log('\nFinding product with ID 12...');
    const product = await db.findById<Product>('products', 12);
    console.log('Product found:', product);

  } catch (error) {
    console.error('Error:', error);
  }
}

example().catch(console.error); 