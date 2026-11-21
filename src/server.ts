import { crearApp } from "./app";
import { crearBase } from "./db/conexion";

const puerto = Number(process.env.PORT ?? 3000);
const db = crearBase();
const app = crearApp(db);

app.listen(puerto, () => {
  console.log(`SGAI en http://localhost:${puerto}`);
});
