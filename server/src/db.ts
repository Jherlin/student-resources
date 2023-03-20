import * as dotenv from "dotenv";
import mysql from "mysql";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const connection = mysql.createConnection(<any>process.env.DATABASE_URL);

export const insertUser = (firstName: string, lastName: string, email: string, hashedPassword: string, dateJoined: string, role: string) => {
  return new Promise((resolve, reject)=> {
    const userId = uuidv4();
    const sql = "INSERT INTO person (id, first_name, last_name, email, password, date_joined, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(sql,[userId, firstName, lastName, email, hashedPassword, dateJoined, role], (error, result) => {
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

export const getUserByEmail= (email: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT * FROM person WHERE email = ?";
    connection.query(sql, [email], (error, user) => {
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
    const sql = "DELETE FROM resource WHERE id=?";
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
    const sql = "SELECT *, MATCH (title, url, category) AGAINST (?) as score FROM resource WHERE MATCH (title, url, category) AGAINST (?) > 0 AND approval_pending=0 ORDER BY score DESC LIMIT ?, 25";
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
    const sql = " SELECT resource.id, resource.title, resource.url, resource.description, resource.image, resource.category, person.first_name as firstName FROM resource INNER JOIN person ON resource.submitted_by=person.id WHERE resource.id=?";
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
    const sql = "SELECT comment.id, comment.content, comment.time, comment.user_id, person.first_name FROM comment INNER JOIN person ON comment.user_id=person.id WHERE resource_id=? ORDER BY time DESC";
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

export const deleteComment = (commentId: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "DELETE FROM comment WHERE id=?";
    connection.query(sql, [commentId], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};

export const getUserStats = (id: string) => {
  return new Promise((resolve, reject)=> {
    const sql = "SELECT person.date_joined as dateJoined, COUNT(resource.id) as count FROM person LEFT JOIN resource ON person.id=resource.submitted_by WHERE person.id=?;"
    connection.query(sql, [id], (error, result) => {
      if(error){
        console.log(error);
        return reject(error);
      }
        return resolve(result);
    });
  });
};