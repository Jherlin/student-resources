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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteComment = exports.insertComment = exports.getComments = exports.getResource = exports.getItemsByCategory = exports.getSearchItems = exports.deleteResource = exports.updatePendingStatus = exports.getPendingSubmittals = exports.insertRersource = exports.getUserByEmail = exports.getUserById = exports.insertUser = exports.connection = void 0;
const dotenv = __importStar(require("dotenv"));
const mysql_1 = __importDefault(require("mysql"));
const uuid_1 = require("uuid");
dotenv.config();
exports.connection = mysql_1.default.createConnection(process.env.DATABASE_URL);
const insertUser = (firstName, lastName, email, hashedPassword, dateJoined, role) => {
    return new Promise((resolve, reject) => {
        const userId = (0, uuid_1.v4)();
        const sql = "INSERT INTO person (id, first_name, last_name, email, password, date_joined, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
        exports.connection.query(sql, [userId, firstName, lastName, email, hashedPassword, dateJoined, role], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error.code);
            }
            return resolve(userId);
        });
    });
};
exports.insertUser = insertUser;
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM person WHERE id = ?";
        exports.connection.query(sql, [id], (error, user) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(user);
        });
    });
};
exports.getUserById = getUserById;
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM person WHERE email = ?";
        exports.connection.query(sql, [email], (error, user) => {
            if (error) {
                return reject(error);
            }
            return resolve(user);
        });
    });
};
exports.getUserByEmail = getUserByEmail;
const insertRersource = (title, url, description, image, category, submittedBy, approvalPending) => {
    return new Promise((resolve, reject) => {
        const userId = (0, uuid_1.v4)();
        const sql = "INSERT INTO resource (id, title, url, description, image, category, submitted_by, approval_pending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        exports.connection.query(sql, [userId, title, url, description, image, category, submittedBy, approvalPending], (error, result) => {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.insertRersource = insertRersource;
const getPendingSubmittals = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM resource WHERE approval_pending = 1";
        exports.connection.query(sql, (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.getPendingSubmittals = getPendingSubmittals;
const updatePendingStatus = (resourceId) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE resource SET approval_pending = 0 WHERE id = ? AND approval_pending = 1";
        exports.connection.query(sql, [resourceId], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.updatePendingStatus = updatePendingStatus;
const deleteResource = (resourceId) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM resource WHERE id=?";
        exports.connection.query(sql, [resourceId], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.deleteResource = deleteResource;
const getSearchItems = (searchQuery, offset) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT *, MATCH (title, url, category) AGAINST (?) as score FROM resource WHERE MATCH (title, url, category) AGAINST (?) > 0 AND approval_pending=0 ORDER BY score DESC LIMIT ?, 25";
        exports.connection.query(sql, [searchQuery, searchQuery, offset], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.getSearchItems = getSearchItems;
const getItemsByCategory = (category, offset) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM resource WHERE category=? AND approval_pending=0 LIMIT ?, 25";
        exports.connection.query(sql, [category, offset], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.getItemsByCategory = getItemsByCategory;
const getResource = (resourceId) => {
    return new Promise((resolve, reject) => {
        const sql = " SELECT resource.id, resource.title, resource.url, resource.description, resource.image, resource.category, person.first_name as firstName FROM resource INNER JOIN person ON resource.submitted_by=person.id WHERE resource.id=?";
        exports.connection.query(sql, [resourceId], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.getResource = getResource;
const getComments = (resourceId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT comment.id, comment.content, comment.time, comment.user_id, person.first_name FROM comment INNER JOIN person ON comment.user_id=person.id WHERE resource_id=? ORDER BY time DESC";
        exports.connection.query(sql, [resourceId,], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.getComments = getComments;
const insertComment = (content, time, resourceId, userId) => {
    return new Promise((resolve, reject) => {
        const commentId = (0, uuid_1.v4)();
        const sql = "INSERT INTO comment (id, content, time, resource_id, user_id) VALUES (?, ?, ?, ?, ?)";
        exports.connection.query(sql, [commentId, content, time, resourceId, userId], (error, result) => {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.insertComment = insertComment;
const deleteComment = (commentId) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM comment WHERE id=?";
        exports.connection.query(sql, [commentId], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.deleteComment = deleteComment;
const getUserStats = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT person.date_joined as dateJoined, COUNT(resource.id) as count FROM person LEFT JOIN resource ON person.id=resource.submitted_by WHERE person.id=?;";
        exports.connection.query(sql, [id], (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
};
exports.getUserStats = getUserStats;
