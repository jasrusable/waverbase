* Manages the client app lifecycle. *

Responsible for creating all client resources.

Resources we create
1. Mongo cluster
2. Parse server (to be done)

Metadata we store
1. Mongo cluster external ip's
2. mongo passwords

Limitations
service is written in a single-threaded blocking way. So we can only create one app a minute or so.
