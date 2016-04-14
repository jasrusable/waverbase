import rocksdb


db = rocksdb.DB('/db/db', rocksdb.Options())
backup = rocksdb.BackupEngine("/pyrocksdb_backups")

backup.create_backup(db, flush_before_backup=True)
