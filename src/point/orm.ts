import { Sequelize, Model, DataTypes } from "sequelize";

const db = new Sequelize({
  database: "postgres",
  username: "postgres",
  password: "alatahu",
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false
});

export class PointGenerator extends Model {};
PointGenerator.init(
  {
    rider_id: DataTypes.INTEGER,
    point: DataTypes.FLOAT
  },
  { modelName: 'point_generator', sequelize: db }
)

export class DriverPosition extends Model {};
DriverPosition.init(
  {
    rider_id: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
  },
  { modelName: 'driver_position', sequelize: db }
)

export function syncDB(): Promise<Sequelize> {
  return db.sync();
}
