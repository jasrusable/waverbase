class AsyncFactory {
  constructor(constructor: Function, ...args: Array<any>): void {
    this._args = args;
    this._constructor = constructor;
    this._instance = null;
  }

  replaceConstructor(constructor: Function): void {
    this._constructor = constructor;
    this._instance = null;
  }

  getInstance(): Object {
    return new Promise((resolve: Function, reject: Function): Promise => {
      if (this._instance !== null) {
        resolve(this._instance);
      }
      this._constructor(...this._args)
      .then((instance: Object) => {
        this._instance = instance;
        resolve(instance);
      })
      .catch((error: any) => reject(error));
    });
  }
}


module.exports = AsyncFactory;
