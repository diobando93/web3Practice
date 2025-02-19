require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const web3 = require('web3').default;
const app = express();
const path = require('path');
const fileUpload = require('express-fileupload');
const Minio = require('minio');
const port = process.env.PORT || 5000;

const WEB3_PROVIDER = "https://eth.llamarpc.com"
const web = new web3(WEB3_PROVIDER);
//midlleware for see static files like html
app.use(express.static("public"));
//ficheros
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, //50mb
}));
app.use(express.json());

const minioClient = new Minio.Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: "minioadmin",
    secretKey: "minioadmin"
});


app.get('/balance/:address', async (req, res) => {
    
    const { address } = req.params;

    try {
        const balanceWei = await web.eth.getBalance(address);
        const balanceEth = web.utils.fromWei(balanceWei, 'ether');
        
        res.json({ address, balance: balanceEth });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching balance', details: error.message });
    }

});

app.post('/minio/createBucket', async (req, res) => {
    try{
        await minioClient.makeBucket(req.body.name, "us-east-1");
        res.status(200).send({result:"ok"});
    }catch(error){
        res.status(500).send({error:error});
    }
    
});

app.post('/minio/addFile', async (req, res) => {
    const bucket = req.body.bucket;
    const file = req.files.ficheros;
    try{
        await minioClient.putObject(
            bucket,
            file.name,
            file.data,
            file.data.length,
        );
        res.status(200).send({result:"ok"});
    }catch(error){
        res.status(500).send({error:error});
    }
    
});


app.get("/minio/:bucket/:fichero", async (req, res) => {
    try{
        const dataStream = await minioClient.getObject(req.params.bucket, req.params.fichero);
        dataStream.pipe(res);
    }catch(error){
        res.status(500).send({error:error});
    }

});

app.delete("/minio/:bucket/:fichero", async (req, res) => {
    try{
        await minioClient.removeObject(req.params.bucket, req.params.fichero);
        res.status(200).send({result:"ok"});
    }catch(error){
        res.status(500).send({error:error});
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

