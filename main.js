const DB_NAME = "notasDB";
const DB_VERSION = 1;
const STORE_NAME = "notasStore";

let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                let objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function addClick() {
    openDB()
        .then(() => {
            // Obtener los valores de la nota
            let title = document.querySelector(".note .title input").value;
            let text = document.querySelector(".note .test textarea").value;

            // Añadir los datos a la base de datos
            let data = {
                "title": title,
                "text": text
            };
        })
        .then(() => {
            // Obtener los datos de la base de datos
            let transaction = db.transaction([STORE_NAME], "readonly");
            let objectStore = transaction.objectStore(STORE_NAME);
            let request = objectStore.getAll();
        })
        .then((data) => {
            // Mostrar los datos en la interfaz
            console.log(data);
        })
        .catch((error) => {
            console.error("Error openDB: " + error);
        });

}

function addData(data) {
    if (!db) {
        throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
        let transaction = db.transaction([STORE_NAME], "readwrite");
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

document.addEventListener("DOMContentLoaded", async () => {
    await openDB();
    let transaction = db.transaction([STORE_NAME], "readonly");
    let objectStore = transaction.objectStore(STORE_NAME);
    let request = objectStore.getAll();
    request.onsuccess = (event) => {
        let data = event.target.result;
        console.log(data);
    }

    request.onerror = (event) => {
        console.error("Error openDB: " + event.target.error);
    }
});

let button = document.querySelector("#btnNota");

button.addEventListener("click", addNote);

function addNote() {
    let container = document.querySelector(".container");
    let note = document.createElement("div");
    note.classList.add("note");
    note.innerHTML = `
    <div class="operation">
        <div class="title">
           <input type="text" placeholder="Titulo de la nota" value="">
           <button class="close">X</button>
        </div>
        <div class="test">
            <textarea class="text" placeholder="Escribe una nota" value=""></textarea>
        </div>
    </div>
    `;
    container.appendChild(note);
}

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("close")) {
        removeNoteAndDB(event.target.closest(".note"));
    }
});

function removeNoteAndDB(note) {
    let container = document.querySelector(".container");
    container.removeChild(note);

    // Elimina la nota de la base de datos usando el ID almacenado como clave primaria
    let noteId = note.querySelector(".operation").dataset.id;
    removeNoteFromDB(noteId);
}

function removeNoteFromDB(noteId) {
    if (!db) {
        throw new Error("La base de datos no está abierta.");
    }

    let transaction = db.transaction([STORE_NAME], "readwrite");
    let objectStore = transaction.objectStore(STORE_NAME);
    let request = objectStore.delete(parseInt(noteId));

    request.onsuccess = (event) => {
        console.log("Nota eliminada de la base de datos.");
    };

    request.onerror = (event) => {
        console.error("Error al eliminar la nota de la base de datos:", event.target.error);
    };
}
