const express = require("express");
const  PDFparse = require("pdf-parse");
const multer = require("multer");
const app = express();

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use("uploads/", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
    destination:"uploads/",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    const alloweTypes = /pdf/;
    const extName = alloweTypes.test(
        path.extname(file.originalname).toLowerCase()
    ); 
    const mimeType = alloweTypes.test(file.mimetype);

    if(extName && mimeType) {
        cb(null, true);
    } else {
        cb( new Error("Only PDF files are allowed."));
    }
};

const upload = multer({
    storage, 
    limits : {fileSize :5* 1024 * 1024},
    fileFilter,
});

const port = 3000;



app.get("/home", (req, res) => {
    res.render("index.ejs");
});

app.post("/home/file", upload.single("pdf"), (req, res) => {
    console.log(req.file);
    res.send("uploaded successfully.");
});

// async function run() {
//     const parser = new PDFparse({
//         url: "./"})
// }
app.listen(port, (req, res) => {
    console.log(`server is listening on port ${port}`);
});
