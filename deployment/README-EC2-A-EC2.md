# Despliegue directo entre instancias EC2

Este documento explica cómo realizar despliegues directos entre instancias EC2, sin tener que usar un ordenador local como intermediario.

## Descripción general

El script `deploy-ec2-to-ec2.ps1` automatiza la transferencia completa de la aplicación Masclet Imperi de una instancia EC2 a otra. Esto es útil para:

- Replicar entornos de producción
- Migrar a nuevas instancias
- Crear copias de seguridad funcionales
- Realizar pruebas en entornos idénticos

## Requisitos previos

- Acceso SSH a ambas instancias EC2 (origen y destino)
- Archivo PEM para autenticación
- Docker y Docker Compose instalados en ambas instancias
- Aplicación Masclet Imperi ya desplegada en la instancia de origen

## Uso

```powershell
.\deploy-ec2-to-ec2.ps1 -SourceEC2_IP "IP-ORIGEN" -TargetEC2_IP "IP-DESTINO" -PEM_PATH "RUTA-A-ARCHIVO-PEM"
```

### Parámetros

- `SourceEC2_IP`: Dirección IP de la instancia EC2 de origen
- `TargetEC2_IP`: Dirección IP de la instancia EC2 de destino
- `PEM_PATH`: Ruta completa al archivo PEM para autenticación SSH

## Proceso detallado

1. **Verificación de conexiones**: Comprueba que se puede acceder a ambas instancias
2. **Respaldo en origen**: Detiene los servicios y crea un archivo tar.gz con todo el contenido
3. **Configuración de autenticación**: Establece conexión segura entre instancias
4. **Transferencia directa**: Mueve el archivo de respaldo de origen a destino
5. **Despliegue en destino**: Descomprime el respaldo y levanta los servicios
6. **Limpieza**: Elimina archivos temporales

## Ejemplo de uso para el despliegue del miércoles

```powershell
.\deploy-ec2-to-ec2.ps1 -SourceEC2_IP "108.129.139.119" -TargetEC2_IP "IP-DE-RAMON" -PEM_PATH "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
```

## Solución de problemas

Si hay errores durante el proceso:

1. **Error de conexión SSH**: Verificar que las IPs sean correctas y que el archivo PEM tenga permisos adecuados
2. **Error de transferencia**: Comprobar que hay suficiente espacio en disco en ambas instancias
3. **Error al desplegar**: Revisar los logs de Docker en la instancia destino

## Notas importantes

- El script detiene temporalmente los servicios en la instancia origen
- Se requiere suficiente espacio en disco para crear el archivo de respaldo
- La transferencia puede tardar varios minutos dependiendo del tamaño de la aplicación
- Se recomienda hacer una copia de seguridad antes de ejecutar este proceso
