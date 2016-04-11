from tasks import app

@app.task
def create_app(name, creator, db_size='50GB'):
    pass
