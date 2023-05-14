import { DataTypes } from "sequelize";

export default {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING, },
    verified: { type: DataTypes.BOOLEAN, default: false },
    walletPhrase: { type: DataTypes.STRING, },
    walletAddress: { type: DataTypes.STRING },
    verifyHash: { type: DataTypes.STRING },
    verifyTimeStamp: { type: DataTypes.DATE }
}
