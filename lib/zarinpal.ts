const ZARINPAL_API = "https://api.zarinpal.com/pg/v4/payment";

export function getZarinpalStartUrl(authority: string) {
  const sandbox = process.env.ZARINPAL_SANDBOX === 'true';
  return sandbox
    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
    : `https://www.zarinpal.com/pg/StartPay/${authority}`;
}

export async function zarinpalRequest(params: {
  merchant_id: string;
  amount: number; // Toman
  description: string;
  callback_url: string;
  email?: string;
  mobile?: string;
}) {
  const body: any = {
    merchant_id: params.merchant_id,
    amount: params.amount,
    description: params.description,
    callback_url: params.callback_url,
    metadata: {},
  };
  if (params.email) body.metadata.email = params.email;
  if (params.mobile) body.metadata.mobile = params.mobile;

  const res = await fetch(`${ZARINPAL_API}/request.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Zarinpal request failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  // Expected shape: { data: { code: 100, authority: 'xxxx' }, errors: [] }
  const code = data?.data?.code;
  if (code !== 100) {
    throw new Error(`Zarinpal request code ${code}: ${JSON.stringify(data)}`);
  }
  return {
    authority: data.data.authority as string,
  };
}

export async function zarinpalVerify(params: {
  merchant_id: string;
  amount: number; // Toman
  authority: string;
}) {
  const res = await fetch(`${ZARINPAL_API}/verify.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: params.merchant_id,
      amount: params.amount,
      authority: params.authority,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Zarinpal verify failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const code = data?.data?.code;
  if (code !== 100) {
    return { ok: false, code, data };
  }
  return {
    ok: true,
    ref_id: data?.data?.ref_id as number | undefined,
    data,
  } as const;
}
