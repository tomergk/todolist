//TOMER
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tomer:Tg9009@cluster0.wg0hdfy.mongodb.net/todolistDB");



// This is the schema of Item
const itemSchema = {
  name: String
};
// This is the model of the schema
const Item = mongoose.model("Item", itemSchema);
// Creating a new 3 items
const item1 = new Item({
  name: "Welcome to our todolist!"
});
const item3 = new Item({
  name: "Hit the + button to add a new item"
});
const item2 = new Item({
  name: "<--- Hit this to delete an item"
});
//I will create an array that will store all three items
const defaultItems = [item1, item2, item3];

// schema for each list's document
const listSchema = {
  name: String, //name of the list
  items: [itemSchema] //array of item schema based items
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    //{} because we don't want any conditions, because we want to find all
    //foundItems is the results of what found inside items collection

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("successfully inserted the elements");
      });
      res.redirect("/");
    } else
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
  });
});

// This is a get request that allowing the user enter a route that gets to one of his lists
app.get("/:customListName", function(req, res) {
  const customListName = (req.params.customListName);


  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Creating a new list with default missions
        const list = new List({
          name: customListName, // The name that the user typed after the "/"
          items: defaultItems //The basic array will passed here
        });
        list.save();
        res.redirect("/" + customListName);
      } else
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
    } else
      console.log(err);
  });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  // get the new mission name
  const item = new Item({
    name: itemName
  });

  //check if we are in "/"
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    //first: we are not in "/"
    //second: Surely we will find the list because created it
    //before in the app.get("/:customListName", ...
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.deletedItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err)
        console.log("occured an error" + err);
      else
        console.log("item's" + checkedItemId + "were deleted successfully from DB");
    });
    res.redirect("/");
  }
  else {
    // In this situation, the list we're trying to delete a document from, is not "/",
    // so we use $pull in order to remove from an existing array all instances of a value or values that match a specified condition.
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err)
        res.redirect("/" + listName);
      else
        console.log(err);
    });
  }
});



    app.listen(3000, function() {
      console.log("Server started on port 3000");
    });
