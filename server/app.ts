import express, {Response, Request} from 'express'
import helmet from 'helmet';
import views from './views/index.ts'

let app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app = views(app)

export default app;