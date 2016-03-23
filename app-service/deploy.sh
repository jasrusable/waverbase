set -e
POD=$(kubectl get pods -o jsonpath="{@.items[*].metadata.name}"|grep -E "app-service-[^ ]*" -o)
echo $POD
kubectl delete pod/$POD
# new pod will automatically download the latest docker stuff
