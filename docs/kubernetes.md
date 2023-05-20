# Running a Calckey instance with Kubernetes and Helm

This is a [Helm](https://helm.sh/) chart directory in the root of the project
that you can use to deploy calckey to a Kubernetes cluster

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

3. Create the calckey helm release (also used to update existing deployment):
```shell
helm upgrade \
    --install \
    --namespace calckey \
    --create-namespace \
    calckey chart/ \
    -f .config/helm_values.yml
```

4. Watch your calckey instance spin up:
```shell
kubectl -n calckey get po -w
```

5. Initial the admin user and managed config:
```shell
export CALCKEY_USERNAME="my_desired_admin_handle" && \
export CALCKEY_PASSWORD="myDesiredInitialPassword" && \
export CALCKEY_HOST="calckey.example.com" && \
export CALCKEY_TOKEN=$(curl -X POST https://$CALCKEY_HOST/api/admin/accounts/create  -H "Content-Type: application/json" -d "{ \"username\":\"$CALCKEY_USERNAME\", \"password\":\"$CALCKEY_PASSWORD\" }" | jq -r '.token') && \
echo "Save this token: ${CALCKEY_TOKEN}" && \
curl -X POST -H "Authorization: Bearer $CALCKEY_TOKEN" https://$CALCKEY_HOST/api/admin/accounts/hosted
```

6. Enjoy!
