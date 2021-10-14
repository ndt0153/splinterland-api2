const User = require("./model/user.model");
const getUser = async () => {
  const rawList = await User.find({}, "username").exec();
  let userList = rawList.map(function (raw) {
    return raw.username;
  });
  return userList;
};
const getUserbyUsername = async (array) => {
  const rawList = await User.find({ username: { $in: array } }, "_id").exec();
  let userList = rawList.map(function (raw) {
    return raw._id;
  });
  return userList;
};
const uploadUser = (users) => {
  User.insertMany(users, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log("Da upload " + docs.length + " user");
    }
  });
};
const getUserPaging = async (perPage, page) => {
  User.find() // find tất cả các data
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, products) => {
      User.countDocuments((err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        console.log(products);
        return products; // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
};
const updateUser = (
  username,
  dec,
  erc,
  rating,
  power,
  win,
  lose,
  draw,
  total,
  winrate,
  quest,
  lastgame,
  lastdec,
  lastclaim,
  afk
) => {
  User.updateOne(
    { username: username, lastgame: { $exists: false } },
    {
      $set: {
        dec,
        erc,
        rating,
        power,
        win,
        lose,
        draw,
        total,
        winrate,
        quest,
        lastgame,
        lastdec,
        lastclaim,
        afk,
      },
    },
    (err, result) => {
      if (err) {
        console.log(err);
        console.log("Khong the update user vao db");
      } else {
        console.log("Da update  " + username + "  vao db");
      }
    }
  );
};
const updateUserGroup = async (username, group) => {
  User.updateOne(
    { username: username },
    {
      $set: {
        group,
      },
    },
    (err, result) => {
      if (err) {
        console.log(err);
        console.log("Khong the update user vao db");
      } else {
        console.log("Da update  " + username + "  vao db");
      }
    }
  );
};
module.exports = {
  uploadUser,
  getUser,
  updateUser,
  getUserPaging,
  getUserbyUsername,
  updateUserGroup,
};
