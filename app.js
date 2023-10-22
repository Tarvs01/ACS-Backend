const express = require("express");
const { readFileSync } = require("fs");
const mysql = require("mysql");
let html = readFileSync("./index.html", "utf8");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const year = 17;

let users = [];

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tarvs",
});

con.connect(function (err) {
  if (err) {
    throw err;
  }
});

app.get("/", (req, res) => {
  res.send(html);
});

app.post("/registerstaff", (req, res) => {
  let sql = `INSERT INTO stafflogin (email, password, dept, defaulters) VALUES ("${req.body.email}", "${req.body.password}", "${req.body.dept}", "[]")`;
  let code = -1;
  let message = "";
  con.query(sql, function (err, result) {
    console.log(result);
    if (err) {
      if (err.errno === Number(1062)) {
        code = 0;
        console.log("error set");
      }
    }

    if (code === 0) {
      message = "Email is already registered";
    } else {
      code = 1;
      message = "Account Created";
    }
    res.send({ code: code, msg: message });
  });

  /* res.send(html); */
});

app.post("/registerstudentset", (req, res) => {
  let start = Number(req.body.start);
  let end = Number(req.body.end);

  let code = -1;
  let message = "";

  for (let x = start; x <= end; x++) {
    let sql = `INSERT INTO students20${req.body.year} (MatricNumber, library, crc, deptLab, deptOfficer, deptHod) VALUES ("${req.body.dept}-${req.body.year}-${x}", "default", "default", "default", "default", "default")`;

    con.query(sql, function (err, result) {
      if (err) {
        code = 0;
      }
    });
  }

  console.log("last: ", code);
  if (code === 0) {
    message = "There was an error registering the students";
  } else {
    code = 1;
    message = "Students successfully registered";
  }

  res.send({ code: code, message: message });
});

app.post("/login", (req, res) => {
  let sql = `SELECT password FROM testusers WHERE email="${req.body.email}"`;

  con.query(sql, function (err, result) {
    if (err) {
      res.send({ status: "fail", msg: "There was an error. Try again" });
    } else {
      if (result.length === 0) {
        res.send({ status: "fail", msg: "No account found. Sign up first" });
      } else {
        if (result[0].password !== req.body.password) {
          res.send({ status: "fail", msg: "Incorrect passowrd" });
        } else {
          res.send({ status: "pass", msg: "Logged in" });
        }
      }
    }
  });
});

app.post("/loginstaff", (req, res) => {
  let sql = `SELECT * FROM stafflogin WHERE email="${req.body.email}"`;

  con.query(sql, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      if (response[0] && response[0].password === req.body.password) {
        res.send({
          status: "SUCCESS",
          data: { dept: response[0].dept, defaulters: response[0].defaulters },
        });
      } else {
        res.send({ status: "FAILURE", message: "INVALID CREDENTIALS" });
      }
    }
  });
});

app.post("/getsinglestudent", (req, res) => {
  let sql = `SELECT * FROM students20${
    req.body.matricNumber.split("-")[1]
  } WHERE MatricNumber="${req.body.matricNumber}"`;

  con.query(sql, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      console.log(response);
      res.send(response);
    }
  });
});

app.get("/getstaffdefaulters/:dept", (req, res) => {
  let sql = `SELECT defaulters FROM stafflogin WHERE dept="${req.params.dept}"`;

  con.query(sql, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ status: "SUCCESS", data: response });
    }
  });
});

app.post("/updatestaffdefaulters", (req, res) => {
  let defaulters = req.body.defaulters;
  defaulters = JSON.stringify(defaulters);

  let sql = `UPDATE stafflogin SET defaulters=\'${defaulters}\' WHERE dept="${req.body.dept}"`;

  con.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send({ data: "done" });
  });
});

app.put("/addnewdefaulter", (req, res) => {
  if (req.body.dept.startsWith("dept")) {
    let length = req.body.dept.length;
    let dept = req.body.dept.slice(length - 3, length);
    let deptPosition = req.body.dept.split(dept)[0];

    let sql = `UPDATE students20${
      req.body.matricNumber.split("-")[1]
    } SET ${deptPosition}="UI" WHERE MatricNumber="${req.body.matricNumber}"`;

    con.query(sql, (err, response) => {
      if (err) {
        console.log("Add request for: ", req.body.matricNumber, " Failure");
        //console.log(err);
      } else {
        console.log("Add request for: ", req.body.matricNumber, " Success");
        //console.log(response);
      }
      res.send({ data: "yolo" });
    });
  } else {
    let sql = `UPDATE students20${req.body.matricNumber.split("-")[1]} SET ${
      req.body.dept
    }="UI" WHERE MatricNumber="${req.body.matricNumber}"`;

    con.query(sql, (err, response) => {
      if (err) {
        console.log("Add request for: ", req.body.matricNumber, " Failure");
        //console.log(err);
      } else {
        console.log("Add request for: ", req.body.matricNumber, " Success");
        //console.log(response);
      }
      res.send({ data: "yolo" });
    });
  }
});

app.put("/removesingledefaulter", (req, res) => {
  if (req.body.dept.startsWith("dept")) {
    let length = req.body.dept.length;
    let dept = req.body.dept.slice(length - 3, length);
    let deptPosition = req.body.dept.split(dept)[0];

    let sql = `UPDATE students20${
      req.body.matricNumber.split("-")[1]
    } SET ${deptPosition}="default" WHERE MatricNumber="${
      req.body.matricNumber
    }"`;

    con.query(sql, (err, response) => {
      if (err) {
        console.log("remove request for: ", req.body.matricNumber, " Failure");
        //console.log(err);
      } else {
        console.log("remove request for: ", req.body.matricNumber, " Success");
        //console.log(response);
      }

      res.send({ data: "done" });
    });
  } else {
    let sql = `UPDATE students20${req.body.matricNumber.split("-")[1]} SET ${
      req.body.dept
    }="default" WHERE MatricNumber="${req.body.matricNumber}"`;

    con.query(sql, (err, response) => {
      if (err) {
        console.log("remove request for: ", req.body.matricNumber, " Failure");
        //console.log(err);
      } else {
        console.log("remove request for: ", req.body.matricNumber, " Success");
        //console.log(response);
      }

      res.send({ data: "done" });
    });
  }
});

app.put("/approveall/:dept", (req, res) => {
  if (req.params.dept.startsWith("dept")) {
    let length = req.params.dept.length;
    let dept = req.params.dept.slice(length - 3, length);
    let deptPosition = req.params.dept.split(dept)[0];

    let sql1 = `SELECT MatricNumber FROM students20${year} WHERE ${deptPosition}="UI"`;

    con.query(sql1, (error, response) => {
      if (error) {
        console.log(error);
      } else {
        let sql2 = `UPDATE students20${year} SET ${deptPosition}="approved" WHERE MatricNumber LIKE "${dept}%" `;

        for (let i = 0; i < response.length; i++) {
          sql2 += `AND NOT MatricNumber="${response[i].MatricNumber}" `;
        }

        console.log(sql2);

        con.query(sql2, (err, response) => {
          if (err) {
            res.send({ data: "fail" });
          } else {
            res.send({ data: "done" });
          }
        });
      }
    });
  } else {
    let sql1 = `SELECT MatricNumber FROM students20${year} WHERE ${req.params.dept}="UI"`;

    con.query(sql1, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        let sql2 = `UPDATE students20${year} SET ${req.params.dept}="approved" WHERE NOT MatricNumber="rando" `;
        for (let i = 0; i < response.length; i++) {
          sql2 += `AND NOT MatricNumber="${response[i].MatricNumber}" `;
        }

        con.query(sql2, (err, response) => {
          if (err) {
            res.send({ data: "fail" });
          } else {
            res.send({ data: "done" });
          }
        });
      }
    });
  }
});

app.post("/changepassword", (req, res) => {
  let sql = `UPDATE testusers SET password='${req.body.password}' WHERE email="${req.body.email}"`;

  con.query(sql, function (err, result) {
    console.log(result);
    if (err) {
      res.send({ status: "fail", msg: "There was an error. Try again" });
    } else {
      res.send({ status: "pass", msg: "Password successfully changed" });
    }
  });
});

app.post("/deleteAccount", (req, res) => {
  let sql = `DELETE FROM testusers WHERE email="${req.body.email}"`;

  con.query(sql, function (err, result) {
    console.log(result);
    if (err) {
      res.send({ status: "fail", msg: "There was an error. Try again" });
    } else {
      res.send({ status: "pass", msg: "Account successfully deleted" });
    }
  });
});

app.get("*", (req, res) => {
  let sql = `SELECT * FROM testusers`;
  con.query(sql, function (err, result, fields) {
    if (err) console.log(err.sqlMessage);
    users = result;
  });

  res.status(200).json(users);
});

let port = 5000;
app.listen(port, function () {
  console.log(`Server is listening on port ${port}...`);
});
