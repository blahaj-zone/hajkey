# Running a iceshrimp server with Kubernetes and Helm

This is a [Helm](https://helm.sh/) chart directory in the root of the project
that you can use to deploy iceshrimp to a Kubernetes cluster

## Deployment

1. Copy the example helm values and make your changes:
```shell
cp .config/helm_values_example.yml .config/helm_values.yml
```

2. Update helm dependencies:
```shell
cd chart
helm dependency list $dir 2> /dev/null | tail +2 | head -n -1 | awk '{ print "helm repo add " $1 " " $3 }' | while read cmd; do $cmd; done;
cd ../
```

3. Create the iceshrimp helm release (also used to update existing deployment):
```shell
helm upgrade \
    --install \
    --namespace iceshrimp \
    --create-namespace \
    iceshrimp chart/ \
    -f .config/helm_values.yml
```

4. Watch your iceshrimp server spin up:
```shell
kubectl -n iceshrimp get po -w
```

5. Initial the admin user and managed config:
```shell
export iceshrimp_USERNAME="my_desired_admin_handle" && \
export iceshrimp_PASSWORD="myDesiredInitialPassword" && \
export iceshrimp_HOST="iceshrimp.example.com" && \
export iceshrimp_TOKEN=$(curl -X POST https://$iceshrimp_HOST/api/admin/accounts/create  -H "Content-Type: application/json" -d "{ \"username\":\"$iceshrimp_USERNAME\", \"password\":\"$iceshrimp_PASSWORD\" }" | jq -r '.token') && \
echo "Save this token: ${iceshrimp_TOKEN}" && \
curl -X POST -H "Authorization: Bearer $iceshrimp_TOKEN" https://$iceshrimp_HOST/api/admin/accounts/hosted
```

6. Enjoy!
