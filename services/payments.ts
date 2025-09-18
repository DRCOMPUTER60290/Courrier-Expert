export type PaymentDetails = {
  fullName: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type PaymentResult = {
  status: 'succeeded' | 'failed';
  message?: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function confirmPremiumSubscriptionPayment(
  details: PaymentDetails,
): Promise<PaymentResult> {
  const { fullName, email, cardNumber, expiry, cvc } = details;

  if (!fullName || !email || !cardNumber || !expiry || !cvc) {
    return { status: 'failed', message: 'Veuillez remplir tous les champs obligatoires.' };
  }

  const sanitizedCard = cardNumber.replace(/\s+/g, '');

  if (!/^\d{12,19}$/.test(sanitizedCard)) {
    return { status: 'failed', message: 'Le numéro de carte semble invalide.' };
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { status: 'failed', message: "La date d'expiration doit être au format MM/AA." };
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    return { status: 'failed', message: 'Le code de sécurité doit contenir 3 ou 4 chiffres.' };
  }

  await wait(1500);

  if (sanitizedCard.endsWith('4242')) {
    return { status: 'succeeded' };
  }

  return {
    status: 'failed',
    message: 'La transaction a été refusée par votre banque. Veuillez essayer une autre carte.',
  };
}
