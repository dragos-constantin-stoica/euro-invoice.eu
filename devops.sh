#!/bin/bash

#----------------------------------------------------------------------------
# This is setup, deploy and run script for
# Euro Invoice Platform
# Compnents:
# - CouchDB
# - APP - CouchDB management
# - APP - Euro Invoice
#
# @company: DataStema Sarl
# @date: 01.02.2023
# @version: 3.1.4
# @author: dragos.constantin.stoica@outlook.com
#----------------------------------------------------------------------------

# Local variables shared with docker compose and each container
source .env

# Auxiliary functions used to display message on the screen
source emoji_color.sh

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
    $0 test
        test the color and emoji utility functions
    -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

where [service_name] is:
`docker compose config --services`
"
    echo -e "$__usage"
	return
}

# setup function
setup(){
    echocolor "Setup stage" "BYellow" "Construction"
    #create docker folders
    local FOLDERS=( "./dbcouch" "./dbcouch/data" "./dbcouch/etc" "./dbcouch/log")
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

    curl -X GET $COUCH_URL/_cluster_setup

    curl -H 'Content-Type: application/json' \
         -X POST $COUCH_URL/_cluster_setup --data-binary @- <<EOF
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

    setting(){
        local NODE_NAME="nonode@nohost"
        echo "setting: $1 $2 \"$3\""
        COUCH_URL=http://$COUCHDB_USER:$COUCHDB_PASSWORD@couch.localhost:5984
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

    # Add application user with the role of technical user
    curl -X PUT $COUCH_URL/_users/org.couchdb.user:$APP_USER \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d '{"name":"'$APP_USER'", "password": "'$APP_PASSWORD'", "roles": ["technical_usr"], "type": "user"}'

    # Companies database
    curl -X PUT $COUCH_URL/companies
    curl -H 'Content-Type: application/json' \
         -X POST $COUCH_URL/companies/_index \
         -d '{"index":{"fields": ["national_registration_number"]}, "name": "nrn_idx", "type":"json", "ddoc": "nrn_idx"}'
    curl -X PUT $COUCH_URL/companies/_security \
       -H 'content-type: application/json' \
       -H 'accept: application/json' \
       -d '{"admins":{"names":[],"roles":["_admin"]},"members":{"names": [],"roles": ["technical_usr"]}}'
    curl -X PUT $COUCH_URL/companies/_design/audit_log \
        -H 'content-type: application/json' \
        -H 'accept: application/json' \
        -d '{"_id":"_design/audit_log","language":"javascript","updates":{"log_record":"function(doc, req){\n          if (req.method == \"PUT\"){\n              var payload = JSON.parse(req.body);\n              if (doc === null){\n                var newdoc = {};\n                newdoc._id = req.uuid;\n                newdoc.doctype = \"auditlog\";\n                newdoc.who = req[\"userCtx\"][\"name\"];\n                newdoc.timestamp = Date.now();\n                newdoc.user = payload.user;\n                newdoc.action = payload.action;\n                return [newdoc, JSON.stringify({\"action\":\"created\", \"doc\": newdoc})];\n              }else{\n                //This is an update on existing record\n                return [null, JSON.stringify({ \"action\": \"error\", \"error\":\"Tempering existing audit log record.\"})]\n              }\n              //unknown request - send error with request payload\n              return [null, JSON.stringify({\"action\": \"error\",\"req\": req})];\n          }\n        }"}}'

    curl -X PUT $COUCH_URL/companies/_design/audit_log/_update/log_record \
        -H 'content-type: application/json' \
        -H 'accept: application/json' \
        -d '{ "user":"'$COUCHDB_USER'", "action":"Setup companies and contact databases."}'
    # Contact and newsletter subscription database
    curl -X PUT $COUCH_URL/contact
    curl -X PUT $COUCH_URL/contact/_security \
       -H 'content-type: application/json' \
       -H 'accept: application/json' \
       -d '{"admins":{"names":[],"roles":["_admin"]},"members":{"names": [],"roles": ["technical_usr"]}}'


    sleep 10
    docker compose down

    echocolor "DONE >>> Setup stage" "BYellow" "Robot"
}

# redeploy function
redeploy(){
    echocolor "Redeploy stage for service $1" "Green" "HammerRench"
    docker compose stop $1
    docker compose up --build --detach $1
    echocolor "DONE >>> Redeploy stage" "Green" "Robot"
}

# clean up all folders
cleanup(){
    echocolor "Cleanup stage" "BIRed" "NoEntry"
    echo "Do you want to delete ALL data?"
    select yn in "Yes" "No"
    do
        case $yn in
            Yes )
                #delete CouchDB and Lets Encrypt folders
                local FOLDERS=("./dbcouch")
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

    echocolor "DONE >>> Cleanup stage" "BIRed" "Robot"
}

# run function
run(){
    echocolor "Run stage" "BIGreen" "Whale"
    docker compose up -d

    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "Couch Admin Worker have successfully started on http://localhost:$WRK_PORT"
    echo "UnityBill has successfully started on http://localhost:8080"
    echo "Application available at https://$CERT_DOMAIN"
    echo -e "\n\n"
    echocolor "DONE >>> Run stage" "BIGreen" "Whale"
}

# dev function
dev(){
    echocolor "DEV stage" "Blue" "Gear"
    docker compose up -d unitybillapp

    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "Couch Admin Worker have successfully started on http://localhost:$WRK_PORT"
    echo "UnityBill has successfully started on http://localhost:8080"

    echo -e "\n\n"
    echocolor "DONE >>> DEV" "Blue" "Alien"
}

# stop function
stop(){
    echocolor "Stop stage" "On_Red" "Bomb"
    docker compose down
    echocolor "DONE >>> Stop stage" "On_Red" "Bomb"
}

# prune function
prune(){
   echocolor "Prune docker system" "BPurple" "Broom"
   docker system prune -f
   echocolor "DONE >>> Prune stage" "BPurple" "Toilet"
}

# build function
build(){
   echocolor "Build service $1" "On_Green" "Radioactive"
   if [[ ! -z "$1" ]]; then
   	docker compose build  $1
   fi
   echocolor "DONE >>> build service $1" "On_Green" "Biohazard"
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
    "setup")    setup $2;;
    "cleanup")  cleanup ;;
    "redeploy") redeploy $2;;
    "run")      run ;;
    "dev")      dev ;;
    "stop")     stop ;;
    "build")    build $2;;
    "prune")    prune;;
    "test")     test_color; test_emoji;;
    "usage")    usage ;;
    *)      	echocolor "unknown command: $1" "On_IRed" "Poo"
	            usage ;;
esac

exit 0

# end of main script
##############################################################################
