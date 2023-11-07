# euro-invoice.eu
Invoicing platform for EU companies.  
This platform is a web application designer for freelancers and small businesses across Europe in order to facilitate the invoicing process.


# Install

## Initial Setup
0. Clone the repository to your local computer
    ```
    git clone git@github.com:dragos-constantin-stoica/euro-invoice.eu.git
    ```
1. Open a terminal and go to the folder that you cloned your application from the above step.
2. Create a `.env` file in the root of the folder. Here is an example of `.env` file:
    ```
    #Project global variables
    COMPOSE_PROJECT_NAME=euro-invoice

    #Couchdb setup
    COUCHDB_USER=superuser
    COUCHDB_PASSWORD=SuperUserPassword

    #Application setup
    APP_USER=euinvoice_apptu
    APP_PASSWORD=VeryStrongPassword
    APP_PORT=9091

    #Couch Admin
    WRK_PORT=8090
    WRK_HOST='0.0.0.0'
    ```
3. Create the intial setup for **CouchDB**, and after a couple of seconds you are ready to go:
    ```
    ./devops.sh setup
    ```  
4. Launch **Euro Invoice**. This should start: **CouchDB**, **Couch Admin**, **Euro Invoice App** containers. **Couch Admin** and **Euro Invoice App** are not public images and are not available on *Docker HUB*, they are build and available only on the local machine. The application is avaliable at `http://localhost:8080/app`.
    ```
    ./devops.sh run
    ```

## Runing Operations

- Stopping the **Euro Invoice**:
    ```
    ./devops.sh stop
    ```
- Cleaning the unused images and containers:
    ```
    ./devops.sh prune
    ```
- Building the image for a specifi service:
    ```
    ./devops.sh build [couch_admin | euinvoiceapp]
    ```
- For development you can build and redeploy on local machine:
    ```
    ./devops.sh redeploy [couch_admin | euinvoiceapp]
    ```
- Development on local machine:
    ```
    ./devops.sh dev
    ```
- If you want to delete the data and cleanup local folders.  
 **ATTENTION: this operation will delete all your data and is irreversible. Do this on your own risk. You are fully responsible for the safety of your local data.**
    ```
    ./devops.sh cleanup
    ```

 # Internet setup

## Initial one time setup
Configure in the DNS registry the correct FQDN to IP address association. This should be available on line on Goddady or NoIP or your DNS registrar platform. You get the IP from the public IP exposed by the Cloud provider. It is better to have a fixed public IP for PROD. Open ports **80** and **443** to the Internet. This is done in the firewall of the Cloud provider. We will use Let's Encrypt with Certbot in order to generate the SSL certificates. You can also bring your own SSL certificates and install and configure **nginx** manually.

1. **Use Nginx helper for inital setup**  
    First time when we have to obtain the SSL certificates we need a minimal configuration for our **nginx** server. This configuration is in `nginx/conf/nginx_setup`. The **nginx** server loads the file `nginx.conf` at start.

## SSL certificate renewal
This procedure is identical with step 2 from Inital setup. While the application is running - we need Nginx server to be running, launch SSL setup.
```
# launch the application, if not running
./devops.sh run

# renew the SSL certificate
./devops.sh ssl
```
There is no need to restart the application, but if the renewed SSL certificates are not show then restart the application:
```
./devops.sh stop
./devops.sh run
```
