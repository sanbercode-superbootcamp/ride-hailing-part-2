import { Sequelize, Model, DataTypes } from "sequelize";

const db = new Sequelize({
  database: "ridehailing",
  username: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false
});

export class Performance extends Model {}
Performance.init(
  {
    rider_id: DataTypes.INTEGER,
    point: DataTypes.FLOAT
  },
  { modelName: "performance", sequelize: db }
);

export function syncDB() {
  return db.sync();
}
