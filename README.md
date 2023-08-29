# DSB 000 002 - unitybill.eu
Invoicing platform for EU companies.  
DSB 000 002 - CouchDB based data solution blueprint.


# Install

## Initial Setup
0. Clone the repository to your local computer
```
git clone git@github.com:DataStema/unitybill.eu.git
```
1. Open a terminal and go to the folder that you cloned your application from the above step.
2. Create a `.env` file in the root of the folder. Here is an example of `.env` file:
```
#Project global variables
COMPOSE_PROJECT_NAME=dsb000002
CERT_EMAIL=contact@unitybill.eu
CERT_DOMAIN=unitybill.eu

#Couchdb setup
COUCHDB_USER=superuser
COUCHDB_PASSWORD=SuperUserPassword

#Application setup
APP_USER=unitybill_apptu
APP_PASSWORD=VeryStrongPassword

#Couch Admin
WRK_PORT=8090
WRK_HOST='0.0.0.0'
```
3. Create the intial setup for **CouchDB**, and after a couple of seconds you are ready to go:
```
./dsb.sh setup
```  
4. Initial setup for SSL certificates. See full details here: [Initial one time setup](#initial-one-time-setup). This is one time setup and needs the machine that you are using to have ports **80** and **443** open for Internet. Once this procedure is done, you do not have to performit again.  
Rename file `nginx/conf/nginx.conf` to `nginx/conf/nginx_ssl`. Rename file `nginx/conf/nginx_setup` to `nginx/conf/nginx.conf`. Launch the application, setup SSL, stop the appication, and undo the file renaming and your application with SSL setup and ready to go.
```
mv nginx/conf/nginx.conf nginx/conf/nginx_ssl
mv nginx/conf/nginx_setup nginx/conf/nginx.conf

./dsb.sh run
./dsb.sh ssl
./dsb.sh stop

mv nginx/conf/nginx.conf nginx/conf/nginx_setup
mv nginx/conf/nginx_ssl nginx/conf/nginx.conf
```
5. Launch **DSB 000 002**. This should start: **CouchDB**, **Couch Admin**, **UnityBill App** containers. **Couch Admin** and **UnityBill App** are not public images and are not available on *Docker HUB*, they are build and available only on the local machine. The application is avaliable at `http://localhost:8080/app`.
```
./dsb.sh run
```

## Runing Operations

- Stopping the **DSB 000 002**:
```
./dsb.sh stop
```
- Cleaning the unused images and containers:
```
./dsb.sh prune
```
- Building the image for a specifi service:
```
./dsb.sh build [couch_admin | unitybillapp]
```
- For development you can build and redeploy on local machine:
```
./dsb.sh redeploy [couch_admin | unitybillapp]
```
- Renew SSL certificates
```
./dsb.sh ssl
```
- If you want to delete the data and cleanup local folders.  
 **ATTENTION: this operation will delete all your data and is irreversible. Do this on your own risk. You are fully responsible for the safety of your local data.**
 ```
 ./dsb.sh cleanup
 ```

 # Internet setup

## Initial one time setup
Configure in the DNS registry the correct hostname to IP address association. This should be available on line on Goddady or NoIP platform. You get the IP from the public IP exposed by the Cloud provider. It is better to have a fixed public IP for PROD. Open ports **80** and **443** to the Internet. This is done in the firewall of the Cloud provider. We will use Let's Encrypt with Certbot in order to generate the SSL certificates.

1. **Configure Nginx for inital setup**  
    First time when we have to obtain the SSL certificates we need a minimal configuration for our Nginx server. This configuration is in `nginx/conf/nginx_setup`. The Nginx server loads the file `nginx.conf` at start, so we need to do the following file name swaping:
    ```
    mv nginx/conf/nginx.conf nginx/conf/nginx_ssl
    mv nginx/conf/nginx_setup nginx/conf/nginx.conf
    ```
    This will load the simplest webserver setup that is need to obtain the SSL certificate.

2. **Obtain the SSL certificate**  
    Run the setup commands that will allow the initial SSL certificate setup. We need to start the Nginx server, run the Certbot container, once, and then stop the Nginx server.
    ```
    ./dsb.sh run
    ./dsb.sh ssl
    ./dsb.sh stop
    ```
    Aftre successfull SSL certifcate configuration we can proceed to setup Nginx server with final configuration.

3. **Configure Nginx for SSL use**  
    This is the Business as Usual mode and should stay as such until the end of operations. The SSL certificates are in place and now we can revert the Nginx configuration to the usual configuration.
    ```
    mv nginx/conf/nginx.conf nginx/conf/nginx_setup
    mv nginx/conf/nginx_ssl nginx/conf/nginx.conf

    ./dsb.sh run
    ```
    The application shoud be available via Internet at the address `https://unitybill.eu`

## SSL certificate renewal
This procedure is identical with step 2 from Inital setup. While the application is running - we need Nginx server to be running, launch SSL setup.
```
# launch the application, if not running
./dsb.sh run

# renew the SSL certificate
./dsb.sh ssl
```
There is no need to restart the application, but if the renewed SSL certificates are not show then restart the application:
```
./dsb.sh stop
./dsb.sh run
```