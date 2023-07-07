/*********************************************************************************
 * WEB322 – Assignment 03
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: kismat kc Student ID: 175036219 Date:19th june 2023
 *
 * Cyclic Web App URL:https://cooperative-tan-rhinoceros.cyclic.app/
 *
 * GitHub Repository URL:https://github.com/kismatkc12/web322.app
 *
 ********************************************************************************/

const path = require("path");
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const app = express();

const blogService = require("./blog-service");

app.get("/blog", (req, res) => {
  blogService
    .getPublishedPosts()
    .then((publishedPosts) => {
      res.json(publishedPosts);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("/posts", (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    blogService
      .getPostsByCategory(category)
      .then((postsByCategory) => {
        res.json(postsByCategory);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else if (minDate) {
    blogService
      .getPostsByMinDate(minDate)
      .then((postsByMinDate) => {
        res.json(postsByMinDate);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else {
    blogService
      .getAllPosts()
      .then((allPosts) => {
        res.json(allPosts);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  }
});

app.get("/post/:id", (req, res) => {
  const postId = req.params.id;

  blogService
    .getPostById(postId)
    .then((post) => {
      res.json(post);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("/posts/add", (req, res) => {
  const filePath = path.join(__dirname, "views", "addPost.html");
  res.sendFile(filePath);
});

app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((allCategories) => {
      res.json(allCategories);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html");
});

cloudinary.config({
  cloud_name: "dvzj3embw",
  api_key: "138618375686358",
  api_secret: "dhlSA2fMtMHSzTOpiijKcqPeNHM",
  secure: true,
});
const upload = multer();

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processPost(uploaded.url);
      })
      .catch((error) => {
        console.error(error);
        processPost("");
      });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    // Create the post data object
    const postData = {
      title: req.body.title,
      content: req.body.content,
      featureImage: req.body.featureImage,
      published: req.body.published,
    };

    // Add the post using the addPost function
    blogService
      .addPost(postData)
      .then((addedPost) => {
        // Redirect to the /posts route
        res.redirect("/posts");
      })
      .catch((error) => {
        console.error(error);
        // Handle the error and send an appropriate response
        res.status(500).send("Failed to add the blog post.");
      });
  }
});

app.use(express.static("public"));

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

const port = process.env.PORT || 8080;

blogService
  .initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express http server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
