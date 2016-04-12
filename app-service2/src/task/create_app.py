from task import app
import task.mongo

@app.task
def create_app(name, creator, db_size=50):
    # just alias the two for now
    task.mongo.add_mongo_replicas(creator, name, db_size)
