import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, email, amount = 100000 } = await request.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aplikasi-anda.vercel.app';

    if (!serverKey) {
      return NextResponse.json({ error: 'Server Key Midtrans belum dikonfigurasi' }, { status: 500 });
    }

    const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
    const midtransUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const orderId = `BOW-${Date.now()}-${userId ? userId.slice(0, 4) : 'USR'}`;

    // Payload Midtrans dengan OVERRIDE NOTIFICATION URL
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        email: email || 'user@example.com'
      },
      // KUNCI MULTI-APP: Mengarahkan notifikasi khusus transaksi ini ke URL aplikasi Anda
      override_notification_url: `${appUrl}/api/webhooks/midtrans`
    };

    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authHeader}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error_messages || 'Gagal membuat snap token' }, { status: 400 });
    }

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: orderId
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
