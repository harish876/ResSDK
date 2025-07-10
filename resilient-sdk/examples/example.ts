/**
 * Example usage of ResilientDB SDK - Get Transactions Only
 */

import { ResilientDB } from '../src';

// Define your TypeScript interfaces
interface User {
  id: number;
  name: string;
  age: number;
  email?: string;
}

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

    // Example 1: Create collection with TypeScript type inference - DEBUG THIS
    console.log('\nCreating products collection with type inference...');
    const requiredFields: (keyof Product)[] = ['id', 'category'];
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
    requiredFields);
    console.log('Products collection created with type inference');

    // Example 2: Insert a new record
    console.log('\nInserting a new product...');
    await db.insert<Product>('products', {
      id: 12,
      name: 'Laptop',
      category: 'electronics',
      price: 999
    });
    console.log('Product inserted successfully');

    // Example 3: Get transactions by filter
    console.log('Getting products with category electronics...');
    const products = await db.find<Product>('products', { category: 'electronics' });
    console.log('Products found:', products);

    // Example 4: Find by ID (new method)
    console.log('\nFinding product with ID 12...');
    const product = await db.findById<Product>('products', 12);
    console.log('Product found:', product);


  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
example().catch(console.error); 