const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const sendPageData = (data, statusCode, res, contentType, isText) => {
  if (isText) {
    res
      .writeHead(statusCode, {
        "Content-Type": contentType,
      })
      .end(data);
  } else {
    fs.readFile(path.join(__dirname, "pages", data), (err, data) => {
      if (err) {
        res
          .writeHead(500, {
            "Content-Type": "text/html",
          })
          .end("<h1 style='color:red;'>Error Reading File</h1>");
      } else {
        res
          .writeHead(statusCode, {
            "Content-Type": contentType,
          })
          .end(data);
      }
    });
  }
};

const requestListener = (req, res) => {
  const url = req.url;
  switch (url) {
    case "/":
      sendPageData("index.html", 200, res, "text/html");
      break;
    case "/about":
      sendPageData("about.html", 200, res, "text/html");
      break;
    case "/sys":
      const osinfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        numberOfCPUS: os.cpus(),
        networkInterfaces: os.networkInterfaces(),
        uptime: os.uptime(),
      };
      const dir = path.join(__dirname, "info");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.writeFile(
        path.join(dir, "osinfo.json"),
        JSON.stringify(osinfo),
        (err) => {
          if (err) {
            console.log(err);

            sendPageData(
              "<h1 style='color:red;'>Unable to save your OS info successfully!</h1>",
              500,
              res,
              "text/html",
              true
            );
          } else {
            sendPageData(
              "Your OS info has been saved successfully!",
              201,
              res,
              "text/plain",
              true
            );
          }
        }
      );

      break;
    default:
      sendPageData("404.html", 404, res, "text/html");
  }
};
const app = http.createServer(requestListener);

const PORT = 8000;
const HOST = "localhost";

app.listen(PORT, HOST, () => console.log(`Server Running on: ${HOST}:${PORT}`));
