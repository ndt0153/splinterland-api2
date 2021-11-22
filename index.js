const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");
const dbConnect = require("./db");
const saveData = require("./save");
const main = require("./check-info.js");
const User = require("./model/user.model");
const List = require("./model/list.model");
const userlist2 = require("./userlist");
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConnect.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to DB Cloud as Novel Leech DB");
  })
  .catch((err) => {
    console.log("Failed connect DB", err);
    process.exit();
  });
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(2000, () => {
  console.log("App running on port 2000");
});
app.post("/c", (req, res) => {
  const result = userlist2.map(function (ele) {
    return {
      username: ele,
    };
  });
  saveData.uploadUser(result);
  res.send({ status: "ok" });
});
app.get("/a", async (req, res) => {
  const userlist = await saveData.getUser();
  const result = await main(userlist);
});
app.get("/totalDEC", async (req, res) => {
  User.aggregate([
    { $match: {} },
    { $group: { _id: null, sum: { $sum: "$dec" } } },
  ]).then((sum) => res.send({ total: sum[0].sum }));
});
app.get("/totalPower", async (req, res) => {
  User.aggregate([
    { $match: {} },
    { $group: { _id: null, sum: { $sum: "$power" } } },
  ]).then((sum) => res.send({ total: sum[0].sum }));
});
app.get("/b", async (req, res) => {
  User.find({}) // find tất cả các data
    .exec((err, products) => {
      User.countDocuments((err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);

        res.send({ products, count }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
});
app.post("/group", async (req, res) => {
  /*  const reqArray = {
    name: "nhom2",
    array: ["pilefwdahmankjw"],
  }; */
  const reqData = req.body;
  List.create(reqData);
  reqData.array.forEach((item) => {
    saveData.updateUserGroup(item, reqData.name);
  });
  res.send({ status: "ok" });
});
app.post("/delete-group", async (req, res) => {
  const reqData = req.body;
  console.log(reqData);
  reqData.forEach((item) => {
    List.deleteOne({ name: item }, (err, result) => {
      if (err) {
        console.log(err);
        console.log("Khong the update vao db");
      } else {
        console.log("Da xoa thanh cong ");
      }
    });
  });
  let empty = "";
  reqData.forEach((item) => {
    saveData.updateUserGroup(item, empty);
  });
  res.send({ ok: "ok" });
});
app.get("/group-name", async (req, res) => {
  List.find({}, "name").exec(function (err, list) {
    if (err) return err;
    res.json(list);
  });
});
app.get("/group", async (req, res) => {
  if (req.query.name) {
    User.find({ group: req.query.name })
      .sort({ date: -1 })
      .exec(function (err, list) {
        if (err) return err;
        res.json(list);
      });
  } else {
    const firstList = await List.find({}, "name").exec();
    const result = firstList[0].name;
    User.find({ group: result }).exec(function (err, list) {
      if (err) return err;
      res.json(list);
    });
  }
});
