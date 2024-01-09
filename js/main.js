import { DatabaseManager } from "../js/indexDb.js";

const dbManager = DatabaseManager.getInstance();
let mainContainerElement = document.getElementById("container");
let buttonAdd = document.getElementById("add");

showAllAction();
buttonAdd.addEventListener("click", createNote);

function generateUniqueId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}

function createNote() {
    let noteId = generateUniqueId();

    let htmlTemplate = `
    <div class="note" data-note-id="${noteId}">
        <div class="note-header">
            <p class="fas fa-trash-alt delete-icon" data-note-id="${noteId}"></p>
        </div>
        <textarea id="textarea-${noteId}" class="text-note"></textarea>
    </div>
    `;

    let divNote = document.createElement("div");
    divNote.innerHTML = htmlTemplate.trim();

    let deleteIcon = divNote.querySelector('.delete-icon');
    deleteIcon.addEventListener("click", function () {
        
        deleteNote(noteId);
        location.reload();
    });

    mainContainerElement.appendChild(divNote);
    insertNote(noteId);
}

function insertNote(noteId) {
    let textareaElement = document.getElementById(`textarea-${noteId}`);
    dbManager.open()
        .then(() => {
            let data = {
                "id": noteId,
                "text": textareaElement.value
            };
            dbManager.addData(data)
                .then(() => {
                    console.log("Nota añadida a la base de datos");
                })
                .catch((error) => {
                    if (error.name === 'ConstraintError') {
                        updateNote(noteId, textareaElement.value);
                    } else {
                        console.error("Error addData: " + error);
                    }
                });
        })
        .catch((error) => {
            console.error("Error open: " + error);
        });
}

function updateNote(id, text) {
    dbManager.open()
        .then(() => {
            let data = {
                "id": id,
                "text": text
            }
            dbManager.updateData(id, data)
                .then(() => {
                    console.log("Nota actualizada");
                })
                .catch((error) => {
                    console.error("Error al actualizar elemento: " + error);
                });
        })
        .catch((error) => {
            console.error("Error al abrir la base de datos: " + error);
        });
}

function deleteNote(id) {
    dbManager.open()
        .then(() => {
            dbManager.deleteData(id)
                .then(() => {
                    console.log("Nota eliminada de la base de datos");
                    let noteElement = document.querySelector(`[data-note-id="${id}"]`);
                    if (noteElement) {
                        noteElement.parentNode.removeChild(noteElement);
                    }
                })
                .catch((error) => {
                    console.error("Error deleteData: " + error);
                });
        })
        .catch((error) => {
            console.error("Error open: " + error);
        });
}

function showAllAction() {
    try {
        dbManager.open()
            .then(() => dbManager.getAllData())
            .then(allData => {
                mainContainerElement.innerHTML = '';

                allData.forEach(data => {
                    let divNote = document.createElement("div");
                    divNote.className = "note";
                    divNote.setAttribute("data-note-id", data.id);

                    let noteHeader = document.createElement("div");
                    noteHeader.className = "note-header";

                    let deleteIcon = document.createElement("p");
                    deleteIcon.className = "fas fa-trash-alt delete-icon";
                    deleteIcon.setAttribute("data-note-id", data.id);
                    deleteIcon.addEventListener("click", function () {
                        deleteNote(data.id);
                    });

                    noteHeader.appendChild(deleteIcon);
                    divNote.appendChild(noteHeader);

                    let textareaElement = document.createElement("textarea");
                    textareaElement.id = `textarea-${data.id}`;
                    textareaElement.className = "text-note";
                    textareaElement.value = data.text;
                    textareaElement.addEventListener("blur", function () {
                        let id = parseInt(data.id);
                        updateNote(id, textareaElement.value);
                    });

                    divNote.appendChild(textareaElement);

                    mainContainerElement.appendChild(divNote);
                });
            })
            .catch(error => console.error("Error al obtener todos los elementos:", error));
    } catch (error) {
        console.error("Error al mostrar todos los agentes:", error);
    }
}
