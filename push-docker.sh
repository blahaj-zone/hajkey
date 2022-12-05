sudo systemctl start docker.service
sudo docker rmi $(docker images -q)
sudo docker compose build
sudo docker tag thatonecalculator/calckey:latest thatonecalculator/calckey:$(git describe --tags --exact-match)
sudo docker images
echo "\nPress enter to continue\n"
read
sudo docker push thatonecalculator/calckey:$(git describe --tags --exact-match)
sudo docker push thatonecalculator/calckey:latest
sudo systemctl stop docker.service
