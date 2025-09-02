server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name cms.sendme123.com;

  ssl_certificate     /etc/letsencrypt/live/cms.sendme123.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/cms.sendme123.com/privkey.pem;

  # Recomendado para uploads de Strapi
  client_max_body_size 50m;
  proxy_read_timeout   120s;
  proxy_send_timeout   120s;

  # Seguridad básica
  add_header X-Frame-Options SAMEORIGIN;
  add_header X-Content-Type-Options nosniff;
  add_header Referrer-Policy strict-origin-when-cross-origin;

  # Gzip opcional
  gzip on;
  gzip_types text/plain application/json application/javascript text/css;

  # Proxy a Strapi
  location / {
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket/Admin live reload
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_pass http://127.0.0.1:1337;
  }

  # (Opcional) servir /uploads directo por Nginx si montas el dir local
  # location ^~ /uploads/ {
  #   alias /var/www/strapi/public/uploads/;
  #   access_log off;
  #   add_header Cache-Control "public, max-age=31536000, immutable";
  # }
}
