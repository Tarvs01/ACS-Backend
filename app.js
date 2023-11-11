const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const year = 17;

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

app.post("/createtable", (req, res) => {
  let sql1 = `CREATE TABLE students${req.body.year} ( MatricNumber VARCHAR(255) NOT NULL , library VARCHAR(255) NOT NULL DEFAULT 'default' , crc VARCHAR(255) NOT NULL DEFAULT 'default' , deptOfficer VARCHAR(255) NOT NULL DEFAULT 'default' , deptHod VARCHAR(255) NOT NULL DEFAULT 'default' , deptLab VARCHAR(255) NOT NULL DEFAULT 'default' , PRIMARY KEY (MatricNumber))`;

  con.query(sql1, (error, result) => {
    if (error) {
      if (error.errno === 1050) {
        res.send({ status: "FAILURE", message: "Table already exists" });
      } else {
        res
          .status(500)
          .send({ message: "There was an error creating the table" });
      }
    } else {
      res.status(200).send({ message: "Table successfully created" });
    }
  });
});

app.post("/registerstaff", (req, res) => {
  let sql = `INSERT INTO stafflogin (email, password, dept, defaulters) VALUES ("${req.body.email.toLowerCase()}", "${
    req.body.password
  }", "${req.body.dept}", "[]")`;
  let code = -1;
  let message = "";
  con.query(sql, function (err, result) {
    if (err) {
      if (err.errno === Number(1062)) {
        code = 0;
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
});

app.post("/registerstudentset", (req, res) => {
  let start = Number(req.body.start);
  let end = Number(req.body.end);

  if (!req.body.isExtraStudent) {
    let checkTableExists = `SHOW TABLES LIKE "students${req.body.year}"`;
    con.query(checkTableExists, (error, response) => {
      if (error) {
        res.status(500).send({ message: "There was an error" });
      } else {
        if (response.length === 0) {
          res.send({ status: "FAILURE", message: "Table does not exist" });
        } else {
          for (let x = start; x <= end; x++) {
            let sql = `INSERT INTO students${
              req.body.year
            } (MatricNumber) VALUES ("${req.body.dept.toLowerCase()}-${
              req.body.year % 100
            }-${x}")`;

            con.query(sql, function (err, result) {
              if (err) {
                res.status(500).send({
                  message: "There was an error registering the students",
                });
              }
              if (x === end) {
                res.send({ message: "Students successfully registered" });
              }
            });
          }
        }
      }
    });
  } else {
    let checkTableExists = `SHOW TABLES LIKE "students${req.body.year - 1}"`;
    con.query(checkTableExists, (error, response) => {
      if (error) {
        res.status(500).send({ message: "There was an error" });
      } else {
        if (response.length === 0) {
          res.send({ status: "FAILURE", message: "Table does not exist" });
        } else {
          for (let x = start; x <= end; x++) {
            let sql = `INSERT INTO students${
              req.body.year - 1
            } (MatricNumber) VALUES ("${req.body.dept}-${
              req.body.year % 100
            }-${x}")`;

            con.query(sql, function (err, result) {
              if (err) {
                res.status(500).send({
                  message: "There was an error registering the students",
                });
              }
              if (x === end) {
                res.send({ message: "Students successfully registered" });
              }
            });
          }
        }
      }
    });
  }

  /*  console.log("last: ", code);
  if (code === 0) {
    message = "There was an error registering the students";
  } else {
    code = 1;
    message = "Students successfully registered";
  }

  res.send({ code: code, message: message }); */
});

app.post("/loginstaff", (req, res) => {
  let sql = `SELECT * FROM stafflogin WHERE email="${req.body.email.toLowerCase()}"`;

  con.query(sql, (err, response) => {
    if (err) {
      res
        .status(500)
        .send({ message: "There was an error accessing the database" });
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

app.post("/loginadmin", (req, res) => {
  if (
    req.body.email.toLowerCase() === "tarvs01@gmail.com" &&
    req.body.password === "tarvagames18"
  ) {
    res.send({ status: "SUCCESS" });
  } else {
    res.send({ status: "FAILURE" });
  }
});

app.post("/getsinglestudent", (req, res) => {
  let sql1 = `SELECT * FROM students20${
    req.body.matricNumber.split("-")[1]
  } WHERE MatricNumber="${req.body.matricNumber}"`;

  con.query(sql1, (err, response) => {
    if (err) {
      if (err.errno === 1146) {
        res.send({ status: "FAILURE", data: [] });
      } else {
        res
          .status(500)
          .send({ message: "There was an error accessing the database" });
      }
    } else {
      if (response.length === 0) {
        let sql2 = `SELECT * FROM students20${
          Number(req.body.matricNumber.split("-")[1]) - 1
        } WHERE MatricNumber="${req.body.matricNumber}"`;

        con.query(sql2, (err, response) => {
          if (err) {
            if (err.errno === 1146) {
              res.send({ status: "FAILURE", data: [] });
            } else {
              res
                .status(500)
                .send({ message: "There was an error accessing the database" });
            }
          } else {
            if (response.length === 0) {
              res.send({ status: "FAILURE", data: [] });
            } else {
              res.send({ status: "SUCCESS", data: response });
            }
          }
        });
      } else {
        res.send({ status: "SUCCESS", data: response });
      }
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

app.put("/approveone", (req, res) => {
  if (req.body.dept.startsWith("dept")) {
    let sql = `UPDATE students20${
      req.body.matricNumber.split("-")[1]
    } SET ${req.body.dept.slice(
      0,
      req.body.dept.length - 3
    )}="approved" WHERE MatricNumber="${req.body.matricNumber}"`;

    con.query(sql, (error, response) => {
      if (error) {
        res
          .status(500)
          .send({ message: "There was an error accessing the database" });
      } else {
        res.status(200).send({ message: "Database successfully uploaded" });
      }
    });
  } else {
    let sql = `UPDATE students20${req.body.matricNumber.split("-")[1]} SET ${
      req.body.dept
    }="approved" WHERE MatricNumber="${req.body.matricNumber}"`;

    con.query(sql, (error, response) => {
      if (error) {
        res
          .status(500)
          .send({ message: "There was an error accessing the database" });
      } else {
        res.status(200).send({ message: "Database successfully uploaded" });
      }
    });
  }
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
