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

export class DriverPerformance extends Model {}
DriverPerformance.init(
  {
    rider_id: DataTypes.INTEGER,
    point: DataTypes.FLOAT,
  },
  { modelName: 'driver_performance', sequelize: db }
)

export function syncDB(): Promise<Sequelize> {
  return db.sync();
}