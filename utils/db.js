export const genForeignKey = (name, allowNull = false, unique = false) => {
    return {
        foreignKey: {
            name: name,
            allowNull: allowNull,
            unique: unique,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }
}