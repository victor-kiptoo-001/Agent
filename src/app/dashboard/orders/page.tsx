import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const { phone, amount } = await req.json();

  // 1. Format phone to 254...
  const formattedPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone;

  // 2. M-Pesa Credentials (Get these from Safaricom Developer Portal)
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_PAYBILL_OR_TILL;
  const passkey = process.env.MPESA_PASSKEY;

  try {
    // Generate Auth Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const token = tokenResponse.data.access_token;

    // Generate Timestamp & Password
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

    // Trigger STK Push
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", // or CustomerBuyGoodsOnline
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://your-domain.com/api/mpesa/callback",
        AccountReference: "VaultPremium",
        TransactionDesc: "Payment for Vault App Premium"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return NextResponse.json(stkResponse.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
