déposer le dossier "piste" du dossier dist dans /srv
sudo apt-get install nginx
sudo vi /etc/nginx/sites-available/piste.conf
'''
server {
  server_name piste.buzz
  listen 0.0.0.0:80;
  root /srv/piste;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
'''

sudo ln /etc/nginx/sites-available/piste.conf /etc/nginx/sites-enabled/piste.conf
rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

HTTPS :

sudo snap install core; sudo snap refresh core
sudo apt-get remove certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx --register-unsafely-without-email

configuration aprés certbot :
'''
server {
  server_name piste.buzz
  listen 0.0.0.0:80;
  root /srv/piste;
  location / {
    try_files $uri $uri/ /index.html;
  }


    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/piste.buzz/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/piste.buzz/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = piste.buzz) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


  server_name piste.buzz
  listen 0.0.0.0:80;
    listen 80;
    return 404; # managed by Certbot


}
'''