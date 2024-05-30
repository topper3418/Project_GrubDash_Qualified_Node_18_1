const fieldIsMinInt = (minValue, failError) => {
    return (foundField) => {
        if (!Number.isInteger(foundField)) return failError;
        if (Number(foundField) < minValue) return failError;
        return true;
    }
}

const fieldIsPopArray = (failError) => {
    return (foundField) => {
        if (!Array.isArray(foundField)) return failError;
        if (foundField.length === 0) return failError;
        return true;
    }
}

module.exports = {
    fieldIsMinInt,
    fieldIsPopArray
}