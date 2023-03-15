import * as dotenv from "dotenv";
import mysql from "mysql";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const connection = mysql.createConnection(<any>process.env.DATABASE_URL);

export const insertUser = (firstname: string, lastname: string, username: string, hashedPassword: string) => {
  return new Promise((resolve, reject)=> {
    const userId = uuidv4();
    const sql = "INSERT INTO person (id, first_name, last_name, username, password) VALUES (?, ?, ?, ?, ?)";
    connection.query(sql,[userId, firstname, lastname, username, hashedPassword], (error, result) => {
      if(error){
        console.log(error);
        return reject(error.code);
      }
        return resolve(userId);
    });
  });
};

export const getUserById = (id: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT * FROM person WHERE id = ?";
    connection.query(sql, [id], (error, user) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(user);
    });
  });
};

export const getUserByUsername = (username: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT * FROM person WHERE username = ?";
    connection.query(sql, [username], (error, user) => {
      if(error){
        return reject(error);
      }
        return resolve(user);
    });
  });
};

export const insertRersource = (title: string, url: string, description: string, image: string, category: string, submittedBy: string, approvalPending: boolean) => {
  return new Promise((resolve, reject)=> {
    const userId = uuidv4();
    const sql = "INSERT INTO resource (id, title, url, description, image, category, submitted_by, approval_pending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    connection.query(sql,[userId, title, url, description, image, category, submittedBy, approvalPending], (error, result) => {
      if(error){
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const getPendingSubmittals = () => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT * FROM resource WHERE approval_pending = 1";
    
    connection.query(sql, (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const updatePendingStatus = (resourceId: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "UPDATE resource SET approval_pending = 0 WHERE id = ? AND approval_pending = 1";
    connection.query(sql, [resourceId], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const deleteResource = (resourceId: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "DELETE FROM resource WHERE id = ?";
    connection.query(sql, [resourceId], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const getSearchItems = (searchQuery: string, offset: number) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT *, MATCH (title, url) AGAINST (?) as score FROM resource WHERE MATCH (title, url) AGAINST (?) > 0 AND approval_pending=0 ORDER BY score DESC LIMIT ?, 25";
    connection.query(sql, [searchQuery, searchQuery, offset], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const getItemsByCategory = (category: string, offset: number) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT * FROM resource WHERE category=? AND approval_pending=0 LIMIT ?, 25";
    connection.query(sql, [category, offset], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const getResource = (resourceId: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT * FROM resource WHERE id = ?";
    connection.query(sql, [resourceId], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const getComments = (resourceId: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT comment.id, comment.content, comment.time, person.first_name FROM comment INNER JOIN person ON comment.user_id=person.id WHERE resource_id=? ORDER BY time DESC";
    connection.query(sql, [resourceId,], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const insertComment = (content: string, time: string, resourceId: string, userId: string) => {
  return new Promise((resolve, reject)=> {
    const commentId = uuidv4();
    const sql = "INSERT INTO comment (id, content, time, resource_id, user_id) VALUES (?, ?, ?, ?, ?)";

    connection.query(sql,[commentId, content, time, resourceId, userId], (error, result) => {
      if(error){
        return reject(error);
      }
        return resolve(result);
    });
  });
};