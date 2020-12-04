// TODO: updateWithUIを切り離す

function setupDb() {
    let request = window.indexedDB.open("db_kintai", 1)
    request.onerror = () => {
        console.log('Database failed to open')
    }
    request.onsuccess = () => {
        console.log('Database opened successfully');
        db = request.result;
        requestKintaiGetAll((data) => {
            console.log(`setupDb ${data}`)
            topKintai = data
            updateUIWith()
        }, () => {})
    }

    request.onupgradeneeded = (e) => {
        let db = e.target.result
        let objectStore = db.createObjectStore("table-kintai", { keyPath: "id", autoIncrement: true })
        objectStore.createIndex("month", "month", { unique: true })
        console.log('Database setup')
    }
}

function requestKintaiGetAll(success, failure) {
    let transaction = db.transaction(["table-kintai"], "readwrite")
    let objectStore = transaction.objectStore("table-kintai")
    let request = objectStore.getAll()
    request.onerror = (event) => {
        failure()
    }
    request.onsuccess = (event) => {
        let data = event.target.result
        topKintai = data
        success(data)
    }
}

function requestKintaiAdd(info) {
    let transaction = db.transaction(["table-kintai"], "readwrite")
    let objectStore = transaction.objectStore("table-kintai")
    let requestUpdate = objectStore.add(info)
    requestUpdate.onerror = (event) => {
        alert("Database error: " + event.target.errorCode)
        console.log("requestKintaiAdd  onerror")
    }
    requestUpdate.onsuccess = (event) => {
        requestKintaiGetAll((data) => {
            topKintai = data
            updateUIWith()
        }, () => {})
    }
}

function requestKintaiPut(info) {
    let transaction = db.transaction(["table-kintai"], "readwrite")
    let objectStore = transaction.objectStore("table-kintai")
    let requestUpdate = objectStore.put(info)
    requestUpdate.onerror = (event) => {
        console.log("requestKintaiPut  onerror")
    }
    requestUpdate.onsuccess = (event) => {
            console.log("requestKintaiPut  onsuccess")
            updateUIWith()
        }
        // transaction.oncomplete = () => {
        //     console.log("put complete")
        // }
}