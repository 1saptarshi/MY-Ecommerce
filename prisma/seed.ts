import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'USER'
    }
  })

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  // Create sample products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
      price: 199.99,
      category: 'electronics',
      stock: 15,
      featured: true
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor and GPS',
      price: 299.99,
      category: 'electronics',
      stock: 8,
      featured: true
    },
    {
      name: 'Running Shoes',
      description: 'Comfortable running shoes with advanced cushioning',
      price: 89.99,
      category: 'sports',
      stock: 25,
      featured: false
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip exercise mat for yoga and pilates',
      price: 29.99,
      category: 'sports',
      stock: 30,
      featured: false
    },
    {
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with thermal carafe',
      price: 79.99,
      category: 'home',
      stock: 12,
      featured: true
    },
    {
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      price: 39.99,
      category: 'home',
      stock: 20,
      featured: false
    },
    {
      name: 'Winter Jacket',
      description: 'Warm and waterproof winter jacket with hood',
      price: 149.99,
      category: 'clothing',
      stock: 10,
      featured: false
    },
    {
      name: 'Running T-Shirt',
      description: 'Moisture-wicking athletic t-shirt',
      price: 24.99,
      category: 'clothing',
      stock: 35,
      featured: false
    },
    {
      name: 'Programming Book',
      description: 'Complete guide to modern web development',
      price: 49.99,
      category: 'books',
      stock: 18,
      featured: false
    },
    {
      name: 'Design Patterns',
      description: 'Essential software design patterns and principles',
      price: 59.99,
      category: 'books',
      stock: 14,
      featured: false
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  // Create some sample reviews
  const createdProducts = await prisma.product.findMany()
  
  for (let i = 0; i < 5; i++) {
    const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)]
    
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: demoUser.id,
          productId: randomProduct.id
        }
      },
      update: {},
      create: {
        userId: demoUser.id,
        productId: randomProduct.id,
        rating: Math.floor(Math.random() * 3) + 3, // Rating between 3-5
        comment: 'Great product! Highly recommended.'
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })