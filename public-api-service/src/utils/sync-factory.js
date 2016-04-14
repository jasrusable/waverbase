class SyncFactory {
  constructor(constructor: Function): void {
    this._constructor = constructor;
    this._instance = null;
  }

  replaceConstructor(constructor: Function): void {
    this._constructor = constructor;
    this._instance = null;
  }

  getInstance(): Object {
    if (this._instance === null) {
      this._instance = this._constructor();
    }
    return this._instance;
  }
}


module.exports = SyncFactory;
