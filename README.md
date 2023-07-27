# unitybill.eu
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
3. Create the intial setup for **CouchDB**
```
./dsb.sh setup
```
after a couple of seconds you are ready to go.
4. Launch **DSB 000 002**
```
./dsb.sh run
```
This should start: **CouchDB**, **Couch Admin**, **UnityBill App**. The application is avaliable at `http://localhost:8080/app`.

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
- If you want to delete the data and cleanup local folders.  
 **ATTENTION: this operation will delete all your data and is irreversible. Do this on your own risk. You are fully responsible for the safety of your local data.**
 ```
 ./dsb.sh cleanup
 ```

 # Internet setup

 TODO - nginx and https certificate setup. Use docker image and certbot (see links bellow):  
 https://mpolinowski.github.io/docs/DevOps/NGINX/2020-08-28--nginx-docker-certbot/2020-08-27/  
https://mindsers.blog/post/https-using-nginx-certbot-docker/  
https://www.programonaut.com/setup-ssl-with-docker-nginx-and-lets-encrypt/