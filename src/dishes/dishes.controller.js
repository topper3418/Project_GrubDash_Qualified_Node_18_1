const path = require("path");
const { stat } = require("fs");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// middleware and middleware factories
const findEntry = require("../utils/findEntry");
const dataHasField = require("../utils/dataHasField");
const requestHasData = require("../utils/requestHasData");
const { fieldIsMinInt } = require("../utils/validation")

// data checkers
const findDish = findEntry(dishes, 'dishes');
const dataHasName = dataHasField('name', {empty: 'Dish must include a name'});
const dataHasDescription = dataHasField('description', {empty: 'Dish must include a description'})
const dataHasPrice = dataHasField(
    'price', 
    {
        notFound: 'Dish must include a price',
        validation: fieldIsMinInt(1, {
            status: 400, 
            message: 'Dish must have a price that is an integer greater than 0'
        })
    }
);
const dataHasUrl = dataHasField('image_url', {empty: 'Dish must include a image_url'});
const dataHasId = dataHasField('id')

// routes
const list = (req, res, next) => {
    res.json({ data: dishes });
}

const read = (req, res, next) => {
    const { foundEntry } = res.locals;
    res.json({ data: foundEntry });
}

const create = (req, res, next) => {
    const { 
        name, 
        price, 
        image_url, 
        description 
    } = res.locals;
    const newDish = {
        id: nextId(),
        name, price, image_url, description
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

const update = (req, res, next) => {
    const { 
        foundEntry, 
        name, 
        price, 
        image_url, 
        description,
        id
    } = res.locals;
    if (id && foundEntry.id != id) next({
        status: 400,
        message: `body ID ${id} does not match param id ${foundEntry.id}`
    })
    if (name) foundEntry.name = name;
    if (price) foundEntry.price = price;
    if (image_url) foundEntry.image_url = image_url;
    if (description) foundEntry.description = description;
    res.json({ data: foundEntry });
}

module.exports = {
    list,
    read: [findDish, read],
    create: [
        requestHasData,
        dataHasName, 
        dataHasDescription, 
        dataHasPrice, 
        dataHasUrl, 
        create
    ],
    update: [
        findDish,
        requestHasData,
        dataHasName, 
        dataHasDescription, 
        dataHasPrice, 
        dataHasUrl, 
        dataHasId,
        update
    ]
}