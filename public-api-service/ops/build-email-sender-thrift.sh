exec thrift --gen js:node ../email-sender-service/email-sender.thrift
echo "Successfully built email sender thrift."

exec sleep 86400
