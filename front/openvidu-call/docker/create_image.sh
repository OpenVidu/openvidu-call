# Copy compiled openvidu-server.jar
cp ../../../../openvidu/openvidu-server/target/openvidu-server-"$1".jar ./openvidu-server.jar

# Compile and copy openvidu-call files
cd ../
ng build --prod
cp -a ./dist/openvidu-call/. ./docker/web/
cd docker

# Build docker image
docker build -t openvidu/openvidu-call .

# Delete unwanted files
rm -rf ./web
rm -rf ./openvidu-server
rm openvidu-server.jar
