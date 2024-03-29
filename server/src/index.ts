import * as dotenv from "dotenv";
import express from "express";
import * as session from "express-session";
import expressMysqlSession from "express-mysql-session";
import cors from "cors";
import axios from "axios";
import bcrypt from "bcrypt";
import _ from "lodash";
import Filter from "bad-words";
import * as db from "./db";
import { RowDataPacket } from "mysql2";
import path from "path";
import { OkPacket } from "mysql";

// Declaraton merging
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

// express and config
dotenv.config();
const app = express();
app.set("trust proxy", 1);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));
  app.use(cors({credentials: true}));
} else {
  app.use(
    cors({
        origin: "http://localhost:5000",
        methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
        credentials: true,
    })
  )
}

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session store and session config
const mysqlStore = expressMysqlSession(session);
const sessionStore = new mysqlStore({}, db.connection);

app.use(session.default({
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  secret: <string>process.env.SESSION_SECRET,
  cookie: {
    secure: (process.env.COOKIE_SECURE === "true"),
    httpOnly: (process.env.COOKIE_HTTP === "true"),
    sameSite: false,
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}))

// express routes
app.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, dateJoined, role } = req.body;

    if ( !firstName || !lastName || !email || !password || !confirmPassword) {
      console.log("Missing fields");
      return res.status(403).send("Missing fields");
    };

    if (password !== confirmPassword) {
      console.log("Passwords do not match")
      return res.status(403).send("Passwords do not match");
    }

    if (password.length < 6) {
      console.log("Password is too short");
      return res.status(403).send("Password is too short");
    }

    try {
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      const data = await db.insertUser(_.upperFirst(firstName), _.upperFirst(lastName), _.toLower(email), hashedPassword, dateJoined, role)
        .then(userID => { 
          return db.getUserById(<string>userID) as RowDataPacket;
        });

      const user = data[0];
      
      req.session.user = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        dateJoined: user.date_joined,
        role: user.role
      };

      return res.json({ user: req.session.user });
  } catch (error) {
      console.error(error);

      if (error == "ER_DUP_ENTRY") {
        return res.status(403).send("User already exist");
      }
      return res.status(403)
  };
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing fields")
    return res.status(403).send("Missing fields");
    }

  try {
    const data = await db.getUserByEmail(email) as RowDataPacket;

    if (data.length === 0) {
      console.log("User was not found");
      return res.status(403).send("User was not found");
    };

    const user = data[0];
    const matches = bcrypt.compareSync(password, user.password);

    if (!matches) {
      console.log("Incorrect password");
      return res.status(403).send("Incorrect password");
    };

    req.session.user = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      dateJoined: user.date_joined,
      role: user.role
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

app.get("/fetch-userstats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await db.getUserStats(userId) as RowDataPacket;
    return res.json(data[0]);
  } catch (error) {
      console.log(error);
      return res.sendStatus(403);
  }
})

// Search engine
app.post("/search-resources", async (req, res) => {
  const { searchQuery, filter, offset } = req.body;

  try {
    if (!filter) {
      const data = await db.getSearchItems(searchQuery, offset) as RowDataPacket;
      return res.json(data);
    } else {
      const dataFiltered = await db.getFilteredSearchItems(searchQuery, filter, offset) as RowDataPacket;
      return res.json(dataFiltered);
    }

} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
});

app.post("/search-category", async (req, res) => {
  const { searchQuery, offset } = req.body;

  try {
    const data = await db.getItemsByCategory(searchQuery, offset) as RowDataPacket;
    return res.json(data);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
});

// Resource submittals to database and admin approval functionality
app.post("/submit-resource", async (req, res) => {
  const { url, category, submittedBy, approvalPending } = req.body;

  if ( !url || !category || !submittedBy) {
    console.log("Missing fields");
    return res.status(403).send("Missing fields");
  };

  try {
    const response = await axios.get(`http://api.linkpreview.net/?key=${process.env.API_KEY}&q=${url}`);

    if (response.status === 200){
      const { title, description, image, url } = response.data;
      const result = await db.insertRersource(title, url, description, image, category, submittedBy, approvalPending);

      if (result){
        return res.send("Succesfully submitted a resource")
      }
    }
  } catch (error) {
    console.log(error);

    if (error == "ER_DUP_ENTRY") {
      return res.status(403).send("Resource link already exist");
    }
  };
});

app.post("/fetch-pending", async (req, res) => {
  if (!req.sessionID || req.session.user?.role !== "Admin") {
    return res.sendStatus(403);
  }

  try {
    const data = await db.getPendingSubmittals();
    return res.json(data);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
})

app.put("/update-status", async (req, res) => {
  const { resourceId } = req.body;

  if (!req.sessionID || req.session.user?.role !== "Admin") {
    return res.sendStatus(403);
  }

  try {
    const data = await db.updatePendingStatus(resourceId) as RowDataPacket;
    return res.json(data);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
})

app.delete("/delete-resource/:resourceId", async (req, res) => {
  const { resourceId } = req.params;

  if (!req.sessionID || req.session.user?.role !== "Admin") {
    return res.sendStatus(403);
  }

  try {
    const data = await db.deleteResource(resourceId) as OkPacket;
    return res.json(data);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
})

// fetching individual resource, names, and comments
app.get("/fetch-resource/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;

  try {
    const data = await db.getResource(resourceId) as RowDataPacket;
    return res.json(data);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
})

app.get("/fetch-comments/:resourceId", async (req, res) => {
  const resourceId = req.params.resourceId;

  try {
    const data = await db.getComments(resourceId) as RowDataPacket;
    return res.json(data);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
})

app.post("/submit-comment", async (req, res) => {
  const { content, time, resourceId, userId } = req.body;
  const filter = new Filter();

  // const newBadWords = ["some", "bad", "word"];
  // filter.addWords(...newBadWords);

  const comment = filter.clean(content);

  if (!req.sessionID || !req.session.user?.id) {
    return res.sendStatus(403);
  }
  
  try {
    const data = await db.insertComment(comment, time, resourceId, userId) as RowDataPacket;
    return res.sendStatus(200);
} catch (error) {
    console.error(error);
    return res.sendStatus(403);
  };
})

app.delete("/delete-comment/:commentId/:userId/:userRole", async (req, res) => {
  const { commentId, userId, userRole } = req.params;
  
  if (userRole !== "Admin"){
    if (!req.sessionID || req.session.user?.id !== userId) {
      return res.sendStatus(403);
    }
  };

  try {
    const data = await db.deleteComment(commentId) as RowDataPacket;
    return res.json(data);
} catch (error) {
    console.error(error);   
    return res.sendStatus(403);
  };
})

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build/index.html"))
  }
  )
};

app.listen(PORT, () => 
  {console.log(`⚡Server is listening on ${PORT}`)});

sessionStore.close();
