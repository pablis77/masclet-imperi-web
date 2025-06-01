param (
    [string]$EC2_IP = "108.129.139.119",
    [string]$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
)

# Crear la configuración Nginx
$nginxConfig = @'
server {
    listen 80;
    server_name localhost;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API proxy - NUEVA RUTA PARA API
    location /api/ {
        proxy_pass http://masclet-api:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log;
}
'@

# Guardar configuración en archivo temporal
$configFile = New-TemporaryFile
$nginxConfig | Out-File -FilePath $configFile -Encoding utf8

# Transferir archivo al servidor
$scpCommand = "scp -i `"$PEM_PATH`" `"$configFile`" ec2-user@${EC2_IP}:/tmp/nginx.conf"
Invoke-Expression $scpCommand

# Comando directo sin tonterías 
$sshCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'docker cp /tmp/nginx.conf masclet-frontend:/etc/nginx/conf.d/default.conf && docker exec masclet-frontend nginx -t && docker exec masclet-frontend nginx -s reload && echo "Configuración aplicada correctamente"'"
Invoke-Expression $sshCommand

Remove-Item -Path $configFile -Force
