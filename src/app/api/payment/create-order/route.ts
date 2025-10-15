import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Test key
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
})

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json()

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Amount and order ID are required' },
        { status: 400 }
      )
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'USD',
      receipt: orderId,
      payment_capture: 1
    }

    const razorpayOrder = await razorpay.orders.create(options)

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
    })
  } catch (error) {
    console.error('Failed to create Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}