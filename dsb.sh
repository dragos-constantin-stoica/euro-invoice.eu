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
# @version: 3.1.4
# @author: dragos.stoica@datastema.io
#----------------------------------------------------------------------------

# Local variables shared with docker compose and each container
source .env

# display usage and help
usage(){
    local __usage="Usage:
    -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
    $0 setup [ssl | null]
        setup each container with ssl or without ssl (for dev environment)
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
    echocolor "Setup stage" "Yellow"
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

    # Companies database
    curl -X PUT $COUCH_URL/_users/org.couchdb.user:$APP_USER \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d '{"name":"$APP_USER", "password": "$APP_PASSWORD", "roles": ["technical_usr"], "type": "user"}'

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

    if [[ ! -z "$1" ]]; then
    	case $1 in
    		"ssl") 
    		    echocolor "Setup SSL" "Yellow"
    			cp nginx/conf/nginx_setup nginx/conf/nginx.conf
			    docker compose up -d
			    sleep 60
			    certbotssl
			    sleep 60
			    docker compose down
			    cp nginx/conf/nginx_ssl nginx/conf/nginx.conf
			    echocolor "SSL setup done!" "Yellow";;

    		*) echo "Unknown paramenter $1"
    		   usage;;
    	esac
    fi

    echocolor "DONE >>> Setup stage" "Yellow"
}

# certbot ssl management
certbotssl(){
    echocolor "Setup SSL certificates from Lets Encrypt using Certbot" "Yellow"
    local FOLDERS=( "./certbot" "./certbot/www" "./certbot/conf")
    for i in "${FOLDERS[@]}"
    do
	if [ ! -d "$i" ]; then
        mkdir -m 0777 -p $i
    fi
    done
    docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --force-renewal --email ${CERT_EMAIL} -d ${CERT_DOMAIN} --agree-tos --non-interactive
    echocolor "DONE >>> SSL certificates" "Yellow"
}

# redeploy function
redeploy(){
    echocolor "Redeploy stage for service $1" "Green"
    docker compose stop $1
    docker compose up --build --detach $1
    echocolor "DONE >>> Redeploy stage" "Green"
}

# clean up all folders
cleanup(){
    echocolor "Cleanup stage" "Red"
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

    echocolor "DONE >>> Cleanup stage" "Red"
}

# run function
run(){
    echocolor "Run stage" "BGreen"
    docker compose up -d

    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "Couch Admin Worker have successfully started on http://localhost:$WRK_PORT"
    echo "UnityBill has successfully started on http://localhost:8080"
    echo "Application available at https://$CERT_DOMAIN"
    echo -e "\n\n"
    echocolor "DONE >>> Run stage" "BGreen"
}

# dev function
dev(){
    echocolor "DEV stage" "Blue"
    docker compose up -d unitybillapp

    echo "CouchDB has successfuly started on http://couch.localhost:5984/_utils"
    echo "        user: $COUCHDB_USER | password: $COUCHDB_PASSWORD"
    echo "Couch Admin Worker have successfully started on http://localhost:$WRK_PORT"
    echo "UnityBill has successfully started on http://localhost:8080"

    echo -e "\n\n"
    echocolo "DONE >>> DEV" "Blue"
}

# stop function
stop(){
    echocolor "Stop stage" "BRed"
    docker compose down
    echocolor "DONE >>> Stop stage" "BRed"
}

# prune function
prune(){
   echocolor "Prune docker system" "Purple"
   docker system prune -f
   echocolor "DONE >>> Prune stage" "Purple"
}

# build function
build(){
   echocolor "Build service $1" "Green"
   docker compose build  $1
   echocolor "DONE >>> build service $1" "Green"
}


# Screen output nice colors
declare -A colors
# Reset
colors[Color_Off]='\033[0m'       # Text Reset

# Regular Colors
colors[Black]='\033[0;30m'        # Black
colors[Red]='\033[0;31m'          # Red
colors[Green]='\033[0;32m'        # Green
colors[Yellow]='\033[0;33m'       # Yellow
colors[Blue]='\033[0;34m'         # Blue
colors[Purple]='\033[0;35m'       # Purple
colors[Cyan]='\033[0;36m'         # Cyan
colors[White]='\033[0;37m'        # White

# Bold
colors[BBlack]='\033[1;30m'       # Black
colors[BRed]='\033[1;31m'         # Red
colors[BGreen]='\033[1;32m'       # Green
colors[BYellow]='\033[1;33m'      # Yellow
colors[BBlue]='\033[1;34m'        # Blue
colors[BPurple]='\033[1;35m'      # Purple
colors[BCyan]='\033[1;36m'        # Cyan
colors[BWhite]='\033[1;37m'       # White

# Underline
colors[UBlack]='\033[4;30m'       # Black
colors[URed]='\033[4;31m'         # Red
colors[UGreen]='\033[4;32m'       # Green
colors[UYellow]='\033[4;33m'      # Yellow
colors[UBlue]='\033[4;34m'        # Blue
colors[UPurple]='\033[4;35m'      # Purple
colors[UCyan]='\033[4;36m'        # Cyan
colors[UWhite]='\033[4;37m'       # White

# Background
colors[On_Black]='\033[40m'       # Black
colors[On_Red]='\033[41m'         # Red
colors[On_Green]='\033[42m'       # Green
colors[On_Yellow]='\033[43m'      # Yellow
colors[On_Blue]='\033[44m'        # Blue
colors[On_Purple]='\033[45m'      # Purple
colors[On_Cyan]='\033[46m'        # Cyan
colors[On_White]='\033[47m'       # White

# High Intensity
colors[IBlack]='\033[0;90m'       # Black
colors[IRed]='\033[0;91m'         # Red
colors[IGreen]='\033[0;92m'       # Green
colors[IYellow]='\033[0;93m'      # Yellow
colors[IBlue]='\033[0;94m'        # Blue
colors[IPurple]='\033[0;95m'      # Purple
colors[ICyan]='\033[0;96m'        # Cyan
colors[IWhite]='\033[0;97m'       # White

# Bold High Intensity
colors[BIBlack]='\033[1;90m'      # Black
colors[BIRed]='\033[1;91m'        # Red
colors[BIGreen]='\033[1;92m'      # Green
colors[BIYellow]='\033[1;93m'     # Yellow
colors[BIBlue]='\033[1;94m'       # Blue
colors[BIPurple]='\033[1;95m'     # Purple
colors[BICyan]='\033[1;96m'       # Cyan
colors[BIWhite]='\033[1;97m'      # White

# High Intensity backgrounds
colors[On_IBlack]='\033[0;100m'   # Black
colors[On_IRed]='\033[0;101m'     # Red
colors[On_IGreen]='\033[0;102m'   # Green
colors[On_IYellow]='\033[0;103m'  # Yellow
colors[On_IBlue]='\033[0;104m'    # Blue
colors[On_IPurple]='\033[0;105m'  # Purple
colors[On_ICyan]='\033[0;106m'    # Cyan
colors[On_IWhite]='\033[0;107m'   # White

# Emoji
declare -A emoji
emoji[Robot]='\U1F916'           #Robot


echocolor(){
    # $1 - the text, $2 - color
    color=${colors[White]}
    if [[ ! -z "$2" ]]; then
    	color=${colors[$2]}
    fi

	echo -e "\U1F916 $color $1 ${colors[Color_Off]}"
}

# end of screen colors

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
    "ssl")      certbotssl ;;
    "cleanup")  cleanup ;;
    "redeploy") redeploy $2;;
    "run")      run ;;
    "dev")      dev ;;
    "stop")     stop ;;
    "build")    build $2;;
    "prune")    prune;;
    "usage")    usage ;;
    *)      	echocolor "unknown command: $1" On_IRed
	            usage ;;
esac

exit 0

# end of main script
##############################################################################
