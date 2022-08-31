module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('user', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            email: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            first_name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            activated: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
            deleted_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: true,
            }
        }).then(() => {
            return queryInterface.addIndex('user', ['email'], {
                name: 'user_email_idx',
                unique: true,
            });
        }).then(() => {
            return queryInterface.addIndex('user', ['deleted_at'], {
                name: 'user_deleted_at_idx'
            })
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('user');
    },
};