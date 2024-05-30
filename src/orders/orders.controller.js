const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// middleware and middleware factories
const findEntry = require("../utils/findEntry");
const dataHasField = require("../utils/dataHasField");
const requestHasData = require("../utils/requestHasData");
const { fieldIsMinInt, fieldIsPopArray } = require("../utils/validation");
const { stat } = require("fs");

// data checkers
const findOrder = findEntry(orders, "orders");
const dataHasDeliverTo = dataHasField("deliverTo", {
    empty: "Order must include a deliverTo",
});
const dataHasMobileNumber = dataHasField("mobileNumber", {
    empty: "Order must include a mobileNumber",
});
const dataHasStatus = dataHasField("status", {
    empty: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    validation: (foundStatus) => {
        if (
            !["pending", "preparing", "out-for-deliver", "delivered"].includes(
                foundStatus
            )
        )
            return {
                status: 400,
                message:
                    "Order must have a status of pending, preparing, out-for-delivery, delivered",
            };
        return true;
    },
});
const dataHasId = dataHasField("id");
const dataHasDishes = dataHasField("dishes", {
    notFound: "Order must include a dish",
    validation: [
        fieldIsPopArray({
            status: 400,
            message: "Order must include at least one dish",
        }),
        (foundDishes) => {
            let returnVal = true;
            foundDishes.forEach((dish, index) => {
                const { quantity } = dish;
                if (
                    quantity === undefined ||
                    !Number.isInteger(quantity) ||
                    quantity <= 0
                ) {
                    returnVal = {
                        status: 400,
                        message: `dish ${index} must have a quantity that is an integer greater than 0`,
                    };
                }
            });
            return returnVal;
        },
    ],
});

// routes
const list = (req, res, next) => {
    res.json({ data: orders });
};

const create = (req, res, next) => {
    const { deliverTo, mobileNumber, dishes } = res.locals;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

const read = (req, res, next) => {
    const { foundEntry } = res.locals;
    res.json({ data: foundEntry });
};

const update = (req, res, next) => {
    const { deliverTo, mobileNumber, status, foundEntry, dishes } = res.locals;
    const { id } = req.body.data;
    if (id && id !== foundEntry.id)
        next({
            status: 400,
            message: `body ID ${id} does not match param id ${foundEntry.id}`,
        });
    if (foundEntry.status === "delivered")
        next({
            status: 400,
            message: "A delivered order cannot be changed",
        });
    if (deliverTo) foundEntry.deliverTo = deliverTo;
    if (mobileNumber) foundEntry.mobileNumber = mobileNumber;
    if (dishes) foundEntry.dishes = dishes;
    foundEntry.status = status;
    res.status(200).json({ data: foundEntry });
};

const destroy = (req, res, next) => {
    const { foundEntry } = res.locals;
    if (foundEntry.status !== "pending") next({
        status: 400,
        message: "An order cannot be deleted unless it is pending",
    });
    const index = orders.findIndex((order) => order.id === foundEntry.id);
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
};

module.exports = {
    list,
    create: [dataHasDeliverTo, dataHasMobileNumber, dataHasDishes, create],
    read: [findOrder, read],
    update: [
        findOrder,
        dataHasId,
        dataHasDeliverTo,
        dataHasMobileNumber,
        dataHasStatus,
        dataHasDishes,
        update,
    ],
    delete: [findOrder, destroy],
};
