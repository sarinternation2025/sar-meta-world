# SSL Setup Documentation

This document describes the complete SSL configuration for the HTTPS setup in the application.

## Directory Structure

```
./config/nginx/ssl/
├── README.md              # SSL certificates documentation
├── localhost.crt          # SSL certificate for localhost
├── localhost.key          # Private key for SSL certificate
├── ssl-params.conf        # SSL security configuration
├── security-headers.conf  # Security headers configuration
└── cors.conf             # CORS configuration
```

## What Was Configured

### 1. SSL Certificates
- **Generated**: Self-signed SSL certificates for localhost development
- **Location**: `./config/nginx/ssl/localhost.crt` and `./config/nginx/ssl/localhost.key`
- **Validity**: 365 days (valid until July 18, 2026)
- **Key Size**: 2048-bit RSA
- **Subject**: CN=localhost

### 2. Nginx Configuration Updates
- **Updated**: `./docker/config/nginx/conf.d/frontend.conf`
- **Added**: HTTP to HTTPS redirect (port 80 → 443)
- **Configured**: HTTPS server block with SSL settings
- **Enabled**: HTTP/2 support

### 3. Security Headers
The following security headers are now configured:
- **HSTS**: Strict Transport Security with 1-year max-age
- **X-Frame-Options**: SAMEORIGIN to prevent clickjacking
- **X-Content-Type-Options**: nosniff to prevent MIME type sniffing
- **X-XSS-Protection**: 1; mode=block for XSS protection
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Content-Security-Policy**: Restrictive CSP for XSS prevention
- **Permissions-Policy**: Restricts browser features
- **X-Permitted-Cross-Domain-Policies**: none

### 4. CORS Configuration
- **Allow-Origin**: * (all origins)
- **Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Allow-Headers**: Comprehensive list including Authorization
- **Max-Age**: 86400 seconds (24 hours)
- **Preflight**: Proper OPTIONS request handling

### 5. SSL Security Settings
- **Protocols**: TLSv1.2 and TLSv1.3 only
- **Ciphers**: Modern, secure cipher suites
- **Session Cache**: Shared SSL session cache (10MB)
- **Session Timeout**: 10 minutes
- **Session Tickets**: Disabled for security
- **OCSP Stapling**: Enabled for better performance

## Testing the Configuration

### 1. Certificate Verification
```bash
# Verify certificate details
openssl x509 -in ./config/nginx/ssl/localhost.crt -text -noout

# Check certificate and key match
openssl x509 -noout -modulus -in ./config/nginx/ssl/localhost.crt | openssl md5
openssl rsa -noout -modulus -in ./config/nginx/ssl/localhost.key | openssl md5
```

### 2. Nginx Configuration Test
```bash
# Test Nginx configuration syntax
nginx -t

# Reload Nginx configuration
nginx -s reload
```

### 3. SSL/TLS Testing
```bash
# Test SSL connection
openssl s_client -connect localhost:443 -servername localhost

# Test HTTP to HTTPS redirect
curl -I http://localhost/

# Test HTTPS response
curl -k -I https://localhost/
```

## Browser Access

1. Navigate to `https://localhost/`
2. Accept the self-signed certificate warning
3. Verify the secure connection (padlock icon)
4. Check security headers in browser dev tools

## Security Notes

- These certificates are for **development only**
- Browsers will show security warnings for self-signed certificates
- For production, use certificates from a trusted Certificate Authority
- The CSP policy may need adjustment based on your application's needs
- CORS settings are permissive (`*`) for development - restrict in production

## Next Steps

1. Test the SSL configuration with your application
2. Adjust CSP and CORS policies as needed
3. Consider generating stronger DH parameters for production
4. Implement certificate rotation strategy for production
5. Set up monitoring for certificate expiration
