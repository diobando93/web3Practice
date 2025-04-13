import express from 'express';
import { Request, Response } from 'express';

const app = express();
app.use(express.json());
const port = 3333;

app.get('/:p1/:p2', (req: Request, res: Response) => {
    const { p1, p2 } = req.params;
    res.send('Hello World! ' + p1 + ' ' + p2);
});

app.post( '/', (req: Request, res: Response) => {
    const body = req.body;
    res.send('Hello World! ' + JSON.stringify(body));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
