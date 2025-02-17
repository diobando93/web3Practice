require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const web3 = require('web3').default;
const app = express();
const Minio = require('minio');
const port = process.env.PORT || 5000;

const WEB3_PROVIDER = "https://eth.llamarpc.com"
const web = new web3(WEB3_PROVIDER);

app.use(express.json());


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


const minioClient = new Minio.Client({
    endPoint: "localhost",
    port: 9009,
    useSSL: false,
    accessKey: "minioadmin",
    secretKey: "minioadmin"
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

