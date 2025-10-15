import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get basic analytics
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      recentOrders,
      topProducts
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count(),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }),
      db.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ])

    // Get product details for top products
    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId }
        })
        return {
          product,
          totalSold: item._sum.quantity || 0
        }
      })
    )

    // Calculate total revenue
    const orders = await db.order.findMany({
      select: { totalAmount: true }
    })
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      topProducts: topProductDetails
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json()

    // Log analytics events (you could store these in a separate analytics table)
    console.log('Analytics Event:', {
      event,
      data,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log analytics event:', error)
    return NextResponse.json(
      { error: 'Failed to log analytics event' },
      { status: 500 }
    )
  }
}