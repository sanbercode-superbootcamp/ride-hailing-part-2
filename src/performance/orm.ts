import { Sequelize, Model, DataTypes } from "sequelize";

const db = new Sequelize({
  database: "bootcamp",
  username: "yayang",
  password: "password",
  host: "172.18.0.2",
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