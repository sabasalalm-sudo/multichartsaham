import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: 'Server Key belum disetel' }, { status: 500 });
    }

    // 1. Validasi Keaslian Notifikasi menggunakan Rumus SHA-512 Bawaan Midtrans
    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    if (calculatedSignature !== signature_key) {
      console.warn('⚠️ Webhook ditolak: Signature Key tidak cocok!');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Jika Pembayaran Sukses (settlement atau capture)
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Ekstrak ID User dari order_id (Format: BOW-TIMESTAMP-USERID)
      console.log(`✅ Pembayaran Berhasil untuk Order: ${order_id}. Mengaktifkan Premium...`);

      // Mengubah status profil menjadi premium selama 30 hari ke depan
      const premiumExpiry = new Date();
      premiumExpiry.setDate(premiumExpiry.getDate() + 30);

      // Contoh update ke Supabase (Jika Anda menyertakan userId di metadata/orderId)
      // await supabase.from('profiles').update({ is_premium: true, premium_until: premiumExpiry.toISOString() }).eq('id', userId);
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Error webhook:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
