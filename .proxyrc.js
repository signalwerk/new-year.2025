const express = require("express");

const path = require("path");

module.exports = function (app) {
  const mainRoot = path.join(__dirname, "./");
  const assets = path.join(__dirname, "./public/assets");

console.log("assets", assets);

  app.use((req, res, next) => {
    console.log("Requested URL:", req.originalUrl);
    next();
  });

  app.use("/assets", express.static(assets));
};
