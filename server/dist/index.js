"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const session = __importStar(require("express-session"));
const express_mysql_session_1 = __importDefault(require("express-mysql-session"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = __importDefault(require("lodash"));
const bad_words_1 = __importDefault(require("bad-words"));
const db = __importStar(require("./db"));
const path_1 = __importDefault(require("path"));
// express and config
dotenv.config();
const app = (0, express_1.default)();
app.set("trust proxy", 1);
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.join(__dirname, "../../client/build")));
    app.use((0, cors_1.default)({ credentials: true }));
}
else {
    app.use((0, cors_1.default)({
        origin: "http://localhost:5000",
        methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
        credentials: true,
    }));
}
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// session store and session config
const mysqlStore = (0, express_mysql_session_1.default)(session);
const sessionStore = new mysqlStore({}, db.connection);
app.use(session.default({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    cookie: {
        secure: (process.env.COOKIE_SECURE === "true"),
        httpOnly: (process.env.COOKIE_HTTP === "true"),
        sameSite: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
// express routes
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, confirmPassword, dateJoined, role } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        console.log("Missing fields");
        return res.status(403).send("Missing fields");
    }
    ;
    if (password !== confirmPassword) {
        console.log("Passwords do not match");
        res.status(403);
        return res.status(403).send("Passwords do not match");
    }
    if (password.length < 6) {
        console.log("Password is too short");
        return res.status(403).send("Password is too short");
    }
    try {
        const hashedPassword = bcrypt_1.default.hashSync(req.body.password, 10);
        const data = yield db.insertUser(lodash_1.default.upperFirst(firstName), lodash_1.default.upperFirst(lastName), lodash_1.default.toLower(email), hashedPassword, dateJoined, role)
            .then(userID => {
            return db.getUserById(userID);
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
    }
    catch (error) {
        console.error(error);
        if (error == "ER_DUP_ENTRY") {
            return res.status(403).send("User already exist");
        }
        return res.status(403);
    }
    ;
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log("Missing fields");
        return res.status(403).send("Missing fields");
    }
    try {
        const data = yield db.getUserByEmail(email);
        if (data.length === 0) {
            console.log("User was not found");
            return res.status(403).send("User was not found");
        }
        ;
        const user = data[0];
        const matches = bcrypt_1.default.compareSync(password, user.password);
        if (!matches) {
            console.log("Incorrect password");
            return res.status(403).send("Incorrect password");
        }
        ;
        req.session.user = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            dateJoined: user.date_joined,
            role: user.role
        };
        return res.json({ user: req.session.user });
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(403);
    }
}));
app.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy((error) => {
            if (error) {
                throw error;
            }
        });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}));
// User authentication for front end
app.get("/fetch-user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.sessionID && req.session.user) {
        res.status(200);
        return res.json({ user: req.session.user });
    }
    return res.sendStatus(403);
}));
app.get("/fetch-userstats/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const data = yield db.getUserStats(userId);
        return res.json(data[0]);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(403);
    }
}));
// Search engine
app.post("/search-resources", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchQuery, offset } = req.body;
    try {
        const data = yield db.getSearchItems(searchQuery, offset);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
app.post("/search-category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchQuery, offset } = req.body;
    try {
        const data = yield db.getItemsByCategory(searchQuery, offset);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(403);
        return res.sendStatus(403);
    }
    ;
}));
// Resource submittals to database and admin approval functionality
app.post("/submit-resource", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, category, submittedBy, approvalPending } = req.body;
    if (!url || !category || !submittedBy) {
        console.log("Missing fields");
        return res.status(403).send("Missing fields");
    }
    ;
    axios_1.default
        .get(`http://api.linkpreview.net/?key=${process.env.API_KEY}&q=${url}`)
        .then(response => {
        if (response.status === 200) {
            const { title, description, image, url } = response.data;
            return db.insertRersource(title, lodash_1.default.toLower(url), description, image, category, submittedBy, approvalPending);
        }
    })
        .then(response => {
        if (response) {
            return res.send("Succesfully submitted a resource");
        }
    })
        .catch(error => {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(403).send("Resource link already exist");
        }
    });
}));
app.post("/fetch-pending", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.sessionID || ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.role) !== "Admin") {
        return res.sendStatus(403);
    }
    try {
        const data = yield db.getPendingSubmittals();
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
app.put("/update-status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { resourceId } = req.body;
    if (!req.sessionID || ((_b = req.session.user) === null || _b === void 0 ? void 0 : _b.role) !== "Admin") {
        return res.sendStatus(403);
    }
    try {
        const data = yield db.updatePendingStatus(resourceId);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
app.delete("/delete-resource/:resourceId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { resourceId } = req.params;
    if (!req.sessionID || ((_c = req.session.user) === null || _c === void 0 ? void 0 : _c.role) !== "Admin") {
        return res.sendStatus(403);
    }
    try {
        const data = yield db.deleteResource(resourceId);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
// fetching individual resource, names, and comments
app.get("/fetch-resource/:resourceId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resourceId = req.params.resourceId;
    try {
        const data = yield db.getResource(resourceId);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
app.get("/fetch-comments/:resourceId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resourceId = req.params.resourceId;
    try {
        const data = yield db.getComments(resourceId);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
app.post("/submit-comment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { content, time, resourceId, userId } = req.body;
    const filter = new bad_words_1.default();
    // const newBadWords = ["some", "bad", "word"];
    // filter.addWords(...newBadWords);
    const comment = filter.clean(content);
    if (!req.sessionID || !((_d = req.session.user) === null || _d === void 0 ? void 0 : _d.id)) {
        return res.sendStatus(403);
    }
    try {
        const data = yield db.insertComment(comment, time, resourceId, userId);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
app.delete("/delete-comment/:commentId/:userId/:userRole", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { commentId, userId, userRole } = req.params;
    if (userRole !== "Admin") {
        if (!req.sessionID || ((_e = req.session.user) === null || _e === void 0 ? void 0 : _e.id) !== userId) {
            return res.sendStatus(403);
        }
    }
    ;
    try {
        const data = yield db.deleteComment(commentId);
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(403);
    }
    ;
}));
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path_1.default.join(__dirname, "../../client/build/index.html"));
    });
}
;
app.listen(PORT, () => { console.log(`⚡Server is listening on ${PORT}`); });
sessionStore.close();
