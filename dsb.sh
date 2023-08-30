#!/bin/bash

#----------------------------------------------------------------------------
# This is setup, deploy and run script for
# Data Solution Blueprint (c) serial number 000002
# Compnents:
# - CouchDB
# - Nginx
# - CertBot
# - APP - CouchDB management
# - APP - Unitiy Bill
#
# @company: DataStema Sarl
# @date: 01.02.2023
# @version: 2.9.0
# @author: dragos.stoica@datastema.io
#----------------------------------------------------------------------------

# Local variables shared with docker compose and each container
source .env

# display usage and help
usage(){
    local __usage="Usage:
    -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
    $0 setup
        setup each container
    $0 ssl
        setup SSL certificates from Lets Encrypt via Cerbot
    $0 redeploy [service_name]
        stop and restart with rebuild the service
    $0 run
        main execution loops, launch Data Solution Blueprint
    $0 dev
        local development execution, no Internet access, no SSL
    $0 stop
        stop execution loop
    $0 cleanup
        clean all folders and data
    $0 build [service name]
        build a specific service
    $0 prune
        prune system for docker
    -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

where [service_name] is:
`docker compose config --services`
"
    echo -e "$__usage"
	return
}

# setup function
setup(){
    echo "Setup stage"
    #create docker folders
    local FOLDERS=( "./dbcouch" "./dbcouch/data" "./dbcouch/etc" "./dbcouch/log" "./nginx" "./nginx/conf")
    for i in "${FOLDERS[@]}"
    do
	if [ ! -d "$i" ]; then
        mkdir -m 0777 -p $i
    fi
    done

    # setup CouchDB
    docker compose up -d couch
    COUCH_URL=http://$COUCHDB_USER:$COUCHDB_PASSWORD@couch.localhost:5984
    sleep 10

    #curl -X PUT $COUCH_URL/_node/_local/_config/couchdb/single_node -d '"true"'
    #curl -X PUT $COUCH_URL/_node/_local/_config/cluster/n -d '"1"'
    #curl -X POST $COUCH_URL/_node/_local/_config/_reload

    curl -X GET $COUCH_URL/_cluster_setup

    curl -H 'Content-Type: application/json' -X POST $COUCH_URL/_cluster_setup --data-binary @- <<EOF
{
  "action":"enable_single_node",
  "singlenode":true,
  "bind_address":"0.0.0.0",
  "port":5984,
  "username":"${COUCHDB_USER}",
  "password":"${COUCHDB_PASSWORD}",
  "ensure_dbs_exist": ["_users", "_replicator", "_global_changes"]
}
EOF

    function setting {
        local NODE_NAME="nonode@nohost"
        echo
        echo "setting: $1 $2 \"$3\""
        echo -n "   prev: "
        curl -H 'Content-Type: application/json' -X PUT $COUCH_URL/_node/$NODE_NAME/_config/$1/$2 -d "\"$3\""
    }

    setting uuids algorithm   "random"
    setting cors  credentials "true"
    setting cors  headers     "accept, authorization, content-type, origin, referer"
    setting cors  methods     "GET, PUT, POST, HEAD, DELETE"
    setting cors  origins     "http://localhost:3000,http://localhost:8080,http://localhost:$WRK_PORT"
    setting chttpd enable_cors "true"
    setting chttpd require_valid_user "true"
    setting chttpd require_valid_user_except_for_up "true"

    # Set session timeout to 8 hours (default is 10 mins)
    setting chttpd_auth timeout "10800"

    curl -X POST $COUCH_URL/_node/_local/_config/_reload
    curl -X GET $COUCH_URL/_cluster_setup


    # Create mandatory databases
    #curl -X PUT $COUCH_URL/_users
    #curl -X PUT $COUCH_URL/_replicator
    #curl -X PUT $COUCH_URL/_global_changes

    # Companies database
    curl -X PUT $COUCH_URL/_users/org.couchdb.user:$APP_USER \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"$APP_USER\", \"password\": \"$APP_PASSWORD\", \"roles\": [\"technical_usr\"], \"type\": \"user\"}"

    curl -X PUT $COUCH_URL/companies
    curl -X PUT $COUCH_URL/companies/_security \
       -H 'content-type: application/json' \
       -H 'accept: application/json' \
       -d '{"admins":{"names":[],"roles":["_admin"]},"members":{"names": [],"roles": ["technical_usr"]}}'

    # Contact and newsletter subscription database
    curl -X PUT $COUCH_URL/contact
    curl -X PUT $COUCH_URL/contact/_security \
       -H 'content-type: application/json' \
       -H 'accept: application/json' \
       -d '{"admins":{"names":[],"roles":["_admin"]},"members":{"names": [],"roles": ["technical_usr"]}}'


    sleep 10
    docker compose down

    echo "DONE >>> Setup stage"
}

# certbot ssl management
cerbotssl(){
    echo "Setup SSL certificates from Lets Encrypt using Certbot"
    local FOLDERS=( "./certbot" "./certbot/www" "./certbot/conf")
    for i in "${FOLDERS[@]}"
    do
	if [ ! -d "$i" ]; then
        mkdir -m 0777 -p $i
    fi
    done
    docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --force-renewal --email ${CERT_EMAIL} -d ${CERT_DOMAIN} --agree-tos --non-interactive
    echo "DONE >>> SSL certificates"
}

# redeploy function
redeploy(){
    echo "Redeploy stage for service $1"
    docker compose stop $1
    docker compose up --build --detach $1
    echo "DONE >>> Redeploy stage"
}

# clean up all folders
cleanup(){
    echo "Cleanup stage"
    echo "Do you want to delete ALL data?"
    select yn in "Yes" "No"
    do
        case $yn in
            Yes )
                #delete CouchDB and Lets Encrypt folders
                local FOLDERS=("./dbcouch" "./certbot")
                for i in "${FOLDERS[@]}"
                do
                    if [ -d "$i" ]; then
                        sudo rm -fr $i
                    fi
                done; break ;;
            No )
                echo "Wise decission! This actions would have been irreversible :)"; break;;
            * )
                echo "Select one option from the list." ;;
        esac
    done

    echo "DONE >>> Cleanup stage"
}

# run function
run(){
    echo "Run stage"
    docker compose up -d

    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "Couch Admin Worker have successfully started on http://localhost:$WRK_PORT"
    echo "UnityBill has successfully started on http://localhost:8080"
    echo "Application available at https://$CERT_DOMAIN"
    echo -e "\n\nDONE >>> Run stage"
}

# dev function
dev(){
    echo "DEV stage"
    docker compose up -d unitybillapp
    
    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "Couch Admin Worker have successfully started on http://localhost:$WRK_PORT"
    echo "UnityBill has successfully started on http://localhost:8080"
    
    echo -e "\n\nDONE >>> DEV"
}

# stop function
stop(){
    echo "Stop stage"
    docker compose down
    echo "DONE >>> Stop stage"
}

# prune function
prune(){
   echo "Prune docker system"
   docker system prune -f
   echo "DONE >>> Prune stage"
}

# build function
build(){
   echo "Build service $1"
   docker compose build  $1
   echo "DONE >>> build service $1"
}

##############################################################################
# main script

# process command line parameters
if [ $# -lt 1 ]; then
	usage
	exit 0
fi
#echo $1, $2, $3, $4

case $1 in
    "setup")    setup ;;
    "ssl")      cerbotssl ;;
    "cleanup")  cleanup ;;
    "redeploy") redeploy $2;;
    "run")      run ;;
    "dev")      dev ;;
    "stop")     stop ;;
    "build")    build $2;;
    "prune")    prune;;
    "usage")    usage ;;
    *)      	echo "unknown command: $1"
	            usage ;;
esac

exit 0

# end of main script
##############################################################################
