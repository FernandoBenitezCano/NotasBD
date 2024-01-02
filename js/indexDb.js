import { INDEXDB_NAME, INDEXDB_VERSION, STORE_NAME } from "./constant.js"
export class DatabaseManager {

  counter = 1;

  constructor(databaseName, databaseVersion) {
    this.databaseName = databaseName;
    this.databaseVersion = databaseVersion;
    this.db = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseManager(INDEXDB_NAME, INDEXDB_VERSION);
    }
    return this.instance;
  }

  open() {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(this.databaseName, this.databaseVersion);
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };

      request.onupgradeneeded = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };

    });
  }

  addData(data) {
    if (!this.db) {
      throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.add(data);
      request.onsuccess = (event) => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  getData(id) {
    if (!this.db) {
      throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readonly");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.get(id);

      request.onsuccess = (event) => {
        let data = event.target.result;
        if (data) {
          resolve(data);
        } else {
          reject(new Error("El objeto con el id: " + id + ", no se encontró en la base de datos."));
        }
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  deleteData(id) {
    if (!this.db) {
      throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  updateData(id, newData) {
    if (!this.db) {
      throw new Error("La base de datos no está abierta.");
    }
  
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
  
      let getRequest = objectStore.get(id);
      
      getRequest.onsuccess = () => {
        let existingData = getRequest.result;
        console.log(existingData);
        console.log(newData);
        // Combinar datos existentes con nuevos datos
        let updatedData = { ...existingData, ...newData };
        
        // No es necesario proporcionar la clave (id) en la operación put
        let putRequest = objectStore.put(updatedData);
  
        putRequest.onsuccess = () => {
          resolve();
        };
  
        putRequest.onerror = (event) => {
          reject(event.target.error);
        };
      };
  
      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  

  getAllData() {
    if (!this.db) {
      throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readonly");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.getAll();

      request.onsuccess = (event) => {
        let data = event.target.result;
        resolve(data);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
}
