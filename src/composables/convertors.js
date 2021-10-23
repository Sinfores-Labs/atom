const convertorToVersion1 = (db) => {
    // Added version
    db.value["version"] = 1
}

const convertorToVersion2 = (db) => {
    // Added field.showInHeader
    db.value["version"] = 2
    db.value.fields.forEach(field => {
        field["showInHeader"] = false
    })
}

const convertorToVersion3 = (db) => {
    // Added field type
    db.value["version"] = 3
    db.value.fields.forEach(field => {
        field["type"] = "text"
    })
}

const convertorToVersion4 = (db) => {
    db.value["version"] = 4
    // Adding layers. See #6 (Github)
    db.value["layers"] = [
        {
            id: 1,
            name: "Layer 1"
        }
    ]
    db.value.items.forEach(el => {
        el["layers"] = [
            {
                id: 1,
                color: el.color,
                score: el.score,
                note: el.note
            }
        ]
        delete el.color
        delete el.score
        delete el.note
    })
}

const convertorToVersion5 = (db) => {
    // Added active property
    db.value["version"] = 5
    db.value.items.forEach(item => {
        item["active"] = true
    })
}

const convert = (db, actualVersion) => {
    if (!db.value.hasOwnProperty("version")) {
        convertorToVersion1(db)
    }
    if ((db.value.version === 1) && (actualVersion > 1)) {
        convertorToVersion2(db)
    }
    if ((db.value.version === 2) && (actualVersion > 2)) {
        convertorToVersion3(db)
    }
    if ((db.value.version === 3) && (actualVersion > 3)) {
        convertorToVersion4(db)
    }
    if ((db.value.version === 4) && (actualVersion > 4)) {
        convertorToVersion5(db)
    }
}


const useConvertors = () => {
    return {
        convert
    }
}

export { useConvertors }
