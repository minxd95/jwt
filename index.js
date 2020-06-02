const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const secretObj = require("./config/jwt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "111111",
  database: "jwt",
});

app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res, next) => {
  res.send(`
  <form action="/login" method="POST">
  <p>id: <input type="text" name="username" placeholder="id"/></p>
  <p>pw: <input type="password" name="password"/></p>
  <input type="submit">
  `);
});
app.post("/login", (req, res, next) => {
  db.query(
    `SELECT * FROM t_jwt WHERE username='${req.body.username}'`,
    (err, result) => {
      if (err) next(err);
      if (result.length == 0) res.redirect("/");
      if (result[0].password == req.body.password) {
        const token = jwt.sign(
          {
            username: result[0].username,
            email: result[0].email,
            nickname: result[0].nickname,
          },
          secretObj.secret,
          {
            expiresIn: "30m",
          }
        );
        const rtoken = jwt.sign(
          {
            id: result[0].id,
          },
          secretObj.secret,
          {}
        );
        res.cookie("token", token);
        res.cookie(("rtoken", rtoken));
        res.json(200, {
          token: token,
          rtoken: rtoken,
        });
      } else res.sendStatus(401);
    }
  );
});
app.get("/someAPI", function (req, res, next) {
  let token = req.cookies.token;
  jwt.verify(token, secretObj.secret, (err, decoded) => {
    if (err) {
      console.log(err);
      res.send("오류");
    }
    console.log(decoded);
    res.send(
      `ID : ${decoded.username}<br>NICKNAME : ${decoded.nickname}<br>EMAIL : ${decoded.email}`
    );
  });
});
app.listen(3000, () => {
  console.log("Listening : 3000");
});
