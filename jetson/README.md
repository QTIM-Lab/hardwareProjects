# SQL for JetsonNano 


## install sqlite3

```
sudo apt install sqlite3
```


## create db

Make the database. We'll have dev.db and prod.db.
After creating, set the schema and then populate with some fake data.
I've started running it from the root, but, to do, seems like we need a deployment script.

```
sqlite3 dev.db < schemas/schema.sql
sqlite3 dev.db < schemas/dev_data.sql
```

## Run the server
```
node db_webservice/db_webserver.js
```
