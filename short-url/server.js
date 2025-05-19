import express from "express";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

const urls = {};
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.post("/shorten", (req, res) => {
  const { originalURL } = req.body;
  const id = nanoid(6);
  urls[id] = originalURL;
  res.status(200).json({
    shortUrl: `${req.protocol}://${req.get("host")}/${id}`,
  });
});


app.get("/:id",(req,res)=>{
    const originalURL=urls[req.params.id];
    if(originalURL){
        res.redirect(originalURL);
    }else{
        res.status(404).send('URL not found');
    }
})


app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
