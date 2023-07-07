const fs = require("fs");

let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, postData) => {
      if (err) {
        reject("Unable to read file");
        return;
      }

      posts = JSON.parse(postData);

      fs.readFile("./data/categories.json", "utf8", (err, categoryData) => {
        if (err) {
          reject("Unable to read file");
          return;
        }

        categories = JSON.parse(categoryData);
        resolve();
      });
    });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    let length = posts.length;
    if (length === 0) {
      reject("No results returned");
    } else {
      resolve(posts);
    }
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.category === category);
    const length = filteredPosts.length;

    if (length === 0) {
      reject("No results returned");
    } else {
      resolve(filteredPosts);
    }
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find((post) => post.id === id);

    if (post) {
      resolve(post);
    } else {
      reject("No result returned");
    }
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(
      (post) => new Date(post.postDate) >= new Date(minDateStr)
    );
    const length = filteredPosts.length;

    if (length === 0) {
      reject("No results returned");
    } else {
      resolve(filteredPosts);
    }
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter((post) => post.published);
    let length = publishedPosts.length;
    if (length === 0) {
      reject("No results returned");
    } else {
      resolve(publishedPosts);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    let length = categories.length;
    if (length === 0) {
      reject("No results returned");
    } else {
      resolve(categories);
    }
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    if (postData.published === undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }

    postData.id = posts.length + 1;

    posts.push(postData);

    resolve(postData);
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
};
