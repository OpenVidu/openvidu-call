# Copy compiled openvidu-server.jar
cp ../../../openvidu/openvidu-server/target/openvidu-server-"$1".jar ./openvidu-server.jar

# Copy openvidu-insecure-js web files
cd ..
mkdir web
ng build --prod -o ./web

# Build docker image
docker build -t openvidu/basic-videoconference-demo .

# Delete unwanted files
rm -rf ./web
rm -rf ./openvidu-server
rm openvidu-server.jar
