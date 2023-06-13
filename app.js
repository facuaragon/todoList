//jshint esversion:6
require('dotenv').config();
const { CLUSTER_PASS } = process.env;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const Item = require("./Item")
const List = require("./List")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://facundoaragon:${CLUSTER_PASS}@cluster0.ab3p0xf.mongodb.net/todoListDB`)
.then(()=>console.log("Database connected"))
.catch((err)=>console.log(err))

const item1 = new Item ({
  name: "Welcome to your ToDoList"
})
const item2 = new Item ({
  name: "Hit the + buton to add a new item."
})
const item3 = new Item ({
  name: "<-- Hit this to delete an item"
})
const defaultItems = [item1, item2, item3]


app.get("/", function(req, res) {
  Item.find({})
  .then((items)=>{
    if(!items.length){
      Item.insertMany(defaultItems)
      .then(()=>{
        console.log("Successfully saved default items to DB")
        res.redirect("/")
      })
      .catch((err)=>console.log(err));
    } else {
      res.render("list", {listTitle: "Today", newListItems: items})
    }
  })
  .catch((err)=>console.log(err.message))
});

app.get("/:customListName", async function(req,res){
  let customListName = req.params.customListName;
  customListName=_.capitalize(customListName)
  try {
    let foundList = await List.findOne({name: customListName})
    if(!foundList){
      // create a new list
      const list = await new List({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect(`/${customListName}`)
    } else {
      // show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  } catch (error) {
    console.log(error.message)
  }
});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  if(itemName){
    const item = new Item ({
      name: itemName
    })
  
    if(listName==="Today"){
      item.save()
      .then(()=>{
        console.log("New Item Saved!")
        res.redirect("/")
      })
      .catch((err)=>console.log(err.message))
    } else {
      try {
        const foundList = await List.findOne({name:listName})
        foundList.items.push(item)
        await foundList.save()
        res.redirect(`/${listName}`)
      } catch (error) {
        console.log(error)
      }
    }
  } else {
    if(listName==="Today") res.redirect(`/`)
    else res.redirect(`/${listName}`)
  }
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  let listName = req.body.listName;
  // listName = _.capitalize(listName)
  // Item.deleteOne({_id: checkedItemId})
  if(listName==="Today"){
    Item.findByIdAndRemove({_id: checkedItemId})
    .then(()=>console.log("successfully deleted checked item"))
    .catch((err)=>console.log(err.message))
    res.redirect("/")
  } else {
    try {
      const foundList = await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
      res.redirect(`/${listName}`)
    } catch (error) {
      console.log(error);
    }
    
  }
})



// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
