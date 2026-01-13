export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOTPExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

export function getOTPExpiryTime() {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes from now
  return expiry;
}

