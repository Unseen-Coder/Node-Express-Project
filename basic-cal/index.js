const express=require("express")

const app=express();


function middleware(req, res, next){
    console.log("Method is:"+req.method);
    console.log("Url is:" + req.url);
    console.log(new Date());
    next();
    
}

app.use(middleware);

app.get("/add",(req,res)=>{
    const a=parseInt(req.query.a);
    const b=parseInt(req.query.b);

    res.json({
        msg:a+b,
    })

})


app.get("/mul",(req,res)=>{
    const a=parseInt(req.query.a);
    const b=parseInt(req.query.b);

    res.json({
        msg:a*b,
    })

})

app.get("/div",(req,res)=>{
    const a=parseInt(req.query.a);
    const b=parseInt(req.query.b);

    res.json({
        msg:a/b,
    })

})

app.get("/sub",(req,res)=>{
    const a=parseInt(req.query.a);
    const b=parseInt(req.query.b);

    res.json({
        msg:a-b,
    })

})

app.listen(3000,()=>{
    console.log("http://localhost:3000");
    
})