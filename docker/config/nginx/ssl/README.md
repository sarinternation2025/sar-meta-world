# SSL Certificates for Localhost Development

This directory contains self-signed SSL certificates for HTTPS development on localhost.

## Files

- `localhost.crt` - SSL certificate for localhost
- `localhost.key` - Private key for the SSL certificate

## Certificate Details

- **Subject**: CN=localhost
- **Validity**: 365 days from generation
- **Key Size**: 2048-bit RSA
- **Usage**: Development only - not for production

## Regenerating Certificates

To regenerate the certificates (if needed), run:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./config/nginx/ssl/localhost.key \
  -out ./config/nginx/ssl/localhost.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Security Note

These are self-signed certificates intended for development only. Browsers will show a security warning when accessing the site, which is normal for self-signed certificates. For production, use certificates from a trusted Certificate Authority.

## Browser Setup

To avoid security warnings in development:

1. **Chrome/Edge**: Navigate to `chrome://flags/#allow-insecure-localhost` and enable the flag
2. **Firefox**: Click "Advanced" → "Accept the Risk and Continue" when prompted
3. **Safari**: Click "Show Details" → "Visit this website" → "Visit Website"

Alternatively, you can add the certificate to your system's trust store, but this is not recommended for security reasons.
