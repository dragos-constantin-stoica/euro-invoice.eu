#!/bin/bash

#----------------------------------------------------------------------------
# This is setup, deploy and run script for
# Data Solution Blueprint (c) serial number 000002
# Compnents:
# - CouchDB
# - gearmand
# - APP - CouchDB management
# - APP - Unitiy Bill
#
# @company: DataStema Sarl
# @date: 01.02.2023
# @version: 2.1.0
# @author: dragos.stoica@datastema.io
#----------------------------------------------------------------------------

source .env

# display usage and help
usage(){
    local __usage="Usage:
    -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
    $0 setup
        setup each container
    $0 redeploy [service_name]
        stop and restart with rebuild the service
    $0 run
        main execution loops, launch Data Solution Blueprint
    $0 stop
        stop execution loop
    $0 cleanup
        clean all folders and data
    $0 build [service name]
        build a specific service
    $0 prune
        prune system for docker
    -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~"
    echo -e "$__usage"
	return
}

# setup function
setup(){
    echo "Setup stage"
    #create docker folders
    local FOLDERS=( "./dbcouch" "./dbcouch/data" "./dbcouch/etc" "./dbcouch/log" )
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

    curl -X PUT $COUCH_URL/_node/_local/_config/couchdb/single_node -d '"true"'
    curl -X PUT $COUCH_URL/_node/_local/_config/cluster/n -d '"1"'
    curl -X POST $COUCH_URL/_node/_local/_config/_reload

    curl -X PUT $COUCH_URL/_users
    curl -X PUT $COUCH_URL/_replicator
    curl -X PUT $COUCH_URL/_global_changes

    curl -X PUT $COUCH_URL/_users/org.couchdb.user:$APP_USER \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"$APP_USER\", \"password\": \"$APP_PASSWORD\", \"roles\": [\"technical_usr\"], \"type\": \"user\"}"

    curl -X PUT $COUCH_URL/companies
    curl -X PUT $COUCH_URL/companies/_security \
       -H 'content-type: application/json' \
       -H 'accept: application/json' \
       -d '{"admins":{"names":[],"roles":["_admin"]},"members":{"names": [],"roles": ["technical_usr"]}}'

    sleep 10
    docker compose down

    echo "DONE >>> Setup stage"
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
    #delete docker folders
    local FOLDERS=("./dbcouch")
    for i in "${FOLDERS[@]}"
    do
	    if [ -d "$i" ]; then
            sudo rm -fr $i
        fi
    done

    echo "DONE >>> Cleanup stage"
}

# run function
run(){
    echo "Run stage"
    docker compose up -d

    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "GearmanD, Couch Admin Worker have successfully started"
    echo "UnityBill has successfully started on http://localhost:8080"
    echo -e "\n\nDONE >>> Run stage"
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
    "cleanup")  cleanup ;;
    "redeploy") redeploy $2;;
    "run")      run ;;
    "stop")     stop ;;
    "build")    build $2;;
    "prune")    prune;;
    "usage")    usage ;;
	*)      echo "unknown command: $1"
	        usage ;;
esac

exit 0

# end of main script
##############################################################################

