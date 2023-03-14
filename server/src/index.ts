import * as dotenv from "dotenv";
import express from "express";
import * as session from "express-session";
import expressMysqlSession from "express-mysql-session";
import cors from "cors";
import bcrypt from "bcrypt";
import _ from "lodash";
import * as db from "./db";
import { RowDataPacket } from "mysql2";
import axios from "axios";

// Declaraton merging
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

// express and config
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
      origin: "http://localhost:5000",
      methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
      credentials: true,
  })
)

// session store and session config
const mysqlStore = expressMysqlSession(session);
const sessionStore = new mysqlStore({}, db.connection);

app.use(session.default({
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  secret: <string>process.env.SESSION_SECRET,
  cookie: {
    secure: false,
    httpOnly: false,
    sameSite: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}))

// express routes
app.get("/", async (req, res) => {
  return res.send("Welcome to Student Resources");
});

app.post("/register", async (req, res) => {
    const { firstname, lastname, username, password } = req.body;

    if ( !firstname || !lastname || !username || !password) {
      console.log("Missing fields");
      res.status(403);
      return res.send("Missing fields");
    };

    if (password.length < 6) {
      console.log("Password is too short");
      res.status(403);
      return res.send("Password is too short");
    }

    try {
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      const data = await db.insertUser(firstname, lastname, _.lowerCase(username), hashedPassword)
        .then(userID => { 
          return db.getUserById(<string>userID) as RowDataPacket;
        });

      const user = data[0];

      req.session.user = {
        id: user.id,
        firstname: user.first_name,
        lastname: user.last_name,
        username: user.username
      };

      return res.json({ user: req.session.user });
  } catch (error) {
      console.error(error);
      res.status(403);

      if (error == "ER_DUP_ENTRY") {
        return res.send("User already exist")
      }

      return res.sendStatus(403);
  };
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log("Missing fields")
    return res.sendStatus(403);
    }

  try {
    const data = await db.getUserByUsername(username) as RowDataPacket;

    if (data.length === 0) {
      console.log("User was not found");
      res.status(403);
      return res.send("User was not found");
    };

    const user = data[0];
    const matches = bcrypt.compareSync(password, user.password);

    if (!matches) {
      console.log("Incorrect password");
      res.status(403);
      return res.send("Incorrect password");
    };

    req.session.user = {
      id: user.id,
      firstname: user.first_name,
      lastname: user.last_name,
      username: user.username
    };

    return res.json({ user: req.session.user });
  } catch (error) {
      console.log(error);
      return res.sendStatus(403);
  }
});

app.post("/logout", async (req, res) => {
  try {
    req.session.destroy((error)=> {
      if (error){
        throw error
      }
    });
    return res.sendStatus(200);
  } catch (error) {
      console.error(error);
      return res.sendStatus(500);
  }
});

// User authentication for front end
app.get("/fetch-user", async (req, res) => {
  if (req.sessionID && req.session.user) {
    res.status(200);
    return res.json({ user: req.session.user });
  }
  return res.sendStatus(403);
})

// Search engine
app.post("/search-resources", async (req, res) => {
  const { searchQuery, offset } = req.body;

  try {
    const data = await db.getSearchItems(searchQuery, offset);
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
});

app.post("/search-category", async (req, res) => {
  const { category, offset } = req.body;

  try {
    const data = await db.getItemsByCategory(category, offset) as RowDataPacket;
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
});

// Resource submittals to database and admin approval functionality
app.post("/submit-resource", async (req, res) => {
  const { url, category, submittedBy, approvalPending } = req.body;

  if ( !url || !category || !submittedBy) {
    console.log("Missing fields");
    res.status(403);
    return res.send("Missing fields");
  };

  axios
  .get(`http://api.linkpreview.net/?key=${process.env.API_KEY}&q=${url}`)
  .then(response => {
    if(response.status === 200) {
      const { title, description, image, url } = response.data;
      return db.insertRersource(title, _.toLower(url), description, image, category, submittedBy, approvalPending) as RowDataPacket;
    }
  })
  .then(response => {
    if(response){
      return res.send("Succesfully submitted a resource")
    }
  })
  .catch(error => {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(403);
      return res.send("Resource link already exist")
    }
  });
});

app.post("/fetch-pending", async (req, res) => {
  if (!req.sessionID || req.session.user?.username !== "admin") {
    return res.sendStatus(403);
  }

  try {
    const data = await db.getPendingSubmittals();
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
})

app.put("/update-status", async (req, res) => {
  const { resourceId } = req.body;

  if (!req.sessionID || req.session.user?.username !== "admin") {
    return res.sendStatus(403);
  }

  try {
    const data = await db.updatePendingStatus(resourceId) as RowDataPacket;
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
})

app.delete("/delete-resource", async (req, res) => {
  const { resourceId } = req.body;

  if (!req.sessionID || req.session.user?.username !== "admin") {
    return res.sendStatus(403);
  }

  try {
    const data = await db.deleteResource(resourceId);
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
})

// fetching individual resource, names, and comments
app.get("/fetch-resource/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;

  try {
    const data = await db.getResource(resourceId);
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
})

app.get("/fetch-comments/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;

  try {
    const data = await db.getComments(resourceId) as RowDataPacket;
    return res.json( data );
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
})

app.post("/submit-comment", async (req, res) => {
  const { content, time, resourceId, userId } = req.body;

  try {
    const data = await db.insertComment(content, time, resourceId, userId) as RowDataPacket;
    return res.sendStatus(200);
} catch (error) {
    console.error(error);
    res.status(403);
    return res.sendStatus(403);
  };
})

app.listen(3000, () => 
  {console.log(`⚡Server is listening on 3000`)});

sessionStore.close();
