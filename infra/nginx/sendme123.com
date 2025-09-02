server {
  listen 80;
  listen [::]:80;
  server_name new.sendme123.com;
  location ^~ /.well-known/acme-challenge/ { 
    root /var/www/html; 
    allow all; 
    default_type "text/plain"; 
  }
  location / { 
    return 301 https://$host$request_uri; 
  }
}

server {
  listen 80;
  listen [::]:80;
  server_name cms.sendme123.com;
  location ^~ /.well-known/acme-challenge/ { 
    root /var/www/html; 
    allow all; 
    default_type "text/plain"; 
  }
  location / { 
    return 301 https://$host$request_uri; 
  }
}

# Bloquear cualquier otro dominio en puerto 80
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  return 444;
}
